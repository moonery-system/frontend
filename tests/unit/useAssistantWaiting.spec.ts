import { ref } from "vue";
import {
  ASSISTANT_TIMEOUT_MS,
  POLL_WINDOW_MS,
  ageOf,
  canUseAssistant,
  useAssistantWaiting,
  withinPollWindow,
} from "@/composables/useAssistantWaiting";
import type { AssistantStatus, Message } from "@/types/api";

const NOW = Date.parse("2026-09-27T12:00:00Z");
const ME = 5;
const BOT = 99;
const SUPPORT = 42;

let nextId = 1;

function message(
  senderId: number,
  ageMs = 0,
  extra: Partial<Message> = {}
): Message {
  return {
    id: nextId++,
    conversation_id: 1,
    sender_id: senderId,
    delivery_id: null,
    body: "hello",
    read_at: null,
    created_at: new Date(Date.now() - ageMs).toISOString(),
    is_assistant: senderId === BOT,
    ...extra,
  };
}

// `null` stands for "the API did not say": a default parameter would swallow `undefined`.
function setup(
  messages: Message[],
  status: AssistantStatus | null = "active",
  enabled = true
) {
  const thread = ref(messages);
  const assistantStatus = ref<AssistantStatus | undefined>(status ?? undefined);
  const isEnabled = ref(enabled);
  const userId = ref<number | null>(ME);

  const waiting = useAssistantWaiting({
    messages: thread,
    assistantStatus,
    enabled: isEnabled,
    currentUserId: userId,
    now: () => Date.now(),
  });

  return { waiting, thread, assistantStatus, isEnabled, userId };
}

beforeEach(() => {
  jest.useFakeTimers("modern");
  jest.setSystemTime(NOW);
  nextId = 1;
});

afterEach(() => {
  jest.useRealTimers();
});

describe("canUseAssistant", () => {
  it("is for whoever has assistant.use and is not on the support side", () => {
    expect(canUseAssistant(["assistant.use", "deliveries.cancel"])).toBe(true);
  });

  it("is not for support, even with assistant.use (an admin has both)", () => {
    expect(canUseAssistant(["assistant.use", "chat.viewAll"])).toBe(false);
  });

  it("is not for someone without the permission (a delivery man)", () => {
    expect(canUseAssistant(["deliveries.attach"])).toBe(false);
    expect(canUseAssistant([])).toBe(false);
  });
});

describe("ageOf and withinPollWindow", () => {
  it("measures by the timestamp of the message", () => {
    expect(ageOf(new Date(NOW - 7_000).toISOString(), NOW)).toBe(7_000);
  });

  it("never goes negative when the server clock is ahead", () => {
    expect(ageOf(new Date(NOW + 3_000).toISOString(), NOW)).toBe(0);
  });

  it("is 0 for a timestamp it cannot read", () => {
    expect(ageOf("not a date", NOW)).toBe(0);
  });

  it("polls only inside the window", () => {
    expect(
      withinPollWindow(new Date(NOW - (POLL_WINDOW_MS - 1)).toISOString(), NOW)
    ).toBe(true);
    expect(
      withinPollWindow(new Date(NOW - POLL_WINDOW_MS).toISOString(), NOW)
    ).toBe(false);
  });
});

describe("when nothing is being waited for", () => {
  it("is idle with no messages", () => {
    expect(setup([]).waiting.phase.value).toBe("idle");
  });

  it("is idle when the last message is not mine", () => {
    expect(setup([message(ME), message(SUPPORT)]).waiting.phase.value).toBe(
      "idle"
    );
  });

  it("is idle when the last message is the assistant's", () => {
    expect(setup([message(ME), message(BOT)]).waiting.phase.value).toBe("idle");
  });

  it("is idle once the conversation was handed over", () => {
    expect(setup([message(ME)], "handed_off").waiting.phase.value).toBe("idle");
  });

  it("is idle when the status is not known", () => {
    expect(setup([message(ME)], null).waiting.phase.value).toBe("idle");
  });

  it("is idle for someone the assistant does not answer", () => {
    expect(setup([message(ME)], "active", false).waiting.phase.value).toBe(
      "idle"
    );
  });
});

describe("waiting", () => {
  it("waits for a fresh message of mine", () => {
    expect(setup([message(BOT), message(ME)]).waiting.phase.value).toBe(
      "waiting"
    );
  });

  it("times out at exactly the limit, and not a millisecond before", () => {
    const { waiting } = setup([message(ME)]);

    jest.advanceTimersByTime(ASSISTANT_TIMEOUT_MS - 1);
    expect(waiting.phase.value).toBe("waiting");

    jest.advanceTimersByTime(1);
    expect(waiting.phase.value).toBe("timed_out");
    expect(jest.getTimerCount()).toBe(0);
  });

  it("goes away when the assistant answers, before the limit", () => {
    const { waiting, thread } = setup([message(ME)]);

    jest.advanceTimersByTime(8_000);
    thread.value = [...thread.value, message(BOT)];

    expect(waiting.phase.value).toBe("idle");
    expect(jest.getTimerCount()).toBe(0);
  });

  it("goes away when the assistant answers after the limit, too", () => {
    const { waiting, thread } = setup([message(ME)]);

    jest.advanceTimersByTime(ASSISTANT_TIMEOUT_MS + 1_000);
    expect(waiting.phase.value).toBe("timed_out");

    thread.value = [...thread.value, message(BOT)];
    expect(waiting.phase.value).toBe("idle");
  });

  it("goes away when a person of support answers", () => {
    const { waiting, thread } = setup([message(ME)]);

    thread.value = [...thread.value, message(SUPPORT)];

    expect(waiting.phase.value).toBe("idle");
  });

  it("goes away the moment the conversation is handed over", () => {
    const { waiting, assistantStatus } = setup([message(ME)]);

    assistantStatus.value = "handed_off";

    expect(waiting.phase.value).toBe("idle");
    expect(jest.getTimerCount()).toBe(0);
  });

  it("goes away if the user stops being one the assistant answers", () => {
    const { waiting, isEnabled } = setup([message(ME)]);

    isEnabled.value = false;

    expect(waiting.phase.value).toBe("idle");
  });

  it("starts the clock again for a new message of mine", () => {
    const { waiting, thread } = setup([message(ME)]);

    jest.advanceTimersByTime(40_000);
    thread.value = [...thread.value, message(ME)];
    expect(waiting.phase.value).toBe("waiting");

    // 40 s + 44 s after the first message, but only 44 s after the second.
    jest.advanceTimersByTime(ASSISTANT_TIMEOUT_MS - 1);
    expect(waiting.phase.value).toBe("waiting");

    jest.advanceTimersByTime(1);
    expect(waiting.phase.value).toBe("timed_out");
  });

  it("keeps counting from the message's own timestamp when the thread is reloaded", () => {
    const first = message(ME);
    const { waiting, thread } = setup([first]);

    jest.advanceTimersByTime(30_000);
    thread.value = [{ ...first }]; // a reload brings back the same message

    jest.advanceTimersByTime(15_000);
    expect(waiting.phase.value).toBe("timed_out");
  });
});

describe("a message that was already waiting when the chat opened", () => {
  it("counts the time it already waited", () => {
    const { waiting } = setup([message(ME, 30_000)]);

    expect(waiting.phase.value).toBe("waiting");

    jest.advanceTimersByTime(14_999);
    expect(waiting.phase.value).toBe("waiting");

    jest.advanceTimersByTime(1);
    expect(waiting.phase.value).toBe("timed_out");
  });

  it("shows the notice at once when it waited longer than the limit", () => {
    const { waiting } = setup([message(ME, ASSISTANT_TIMEOUT_MS + 1)]);

    expect(waiting.phase.value).toBe("timed_out");
    expect(jest.getTimerCount()).toBe(0);
  });

  it("waits normally when the server clock is ahead of the browser's", () => {
    expect(setup([message(ME, -5_000)]).waiting.phase.value).toBe("waiting");
  });

  it("waits normally when the timestamp is unreadable", () => {
    const broken = message(ME, 0, { created_at: "???" });

    expect(setup([broken]).waiting.phase.value).toBe("waiting");
  });
});

describe("cleanup", () => {
  it("clears its timer on dispose", () => {
    const { waiting } = setup([message(ME)]);
    expect(jest.getTimerCount()).toBe(1);

    waiting.dispose();

    expect(jest.getTimerCount()).toBe(0);
  });
});
