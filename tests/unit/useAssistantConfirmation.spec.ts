import { ref } from "vue";
import type { Ref } from "vue";
import {
  GENERIC_REFUSAL,
  classifyFailure,
  stateFromAction,
  useAssistantConfirmation,
} from "@/composables/useAssistantConfirmation";
import type { PendingAction, PendingActionStatus } from "@/types/api";

const NOW = Date.parse("2026-09-27T12:00:00Z");
const MINUTE = 60_000;

function makeAction(
  status: PendingActionStatus = "pending",
  expiresInMs = 10 * MINUTE
): PendingAction {
  return {
    id: 7,
    conversation_id: 1,
    user_id: 2,
    delivery_id: 3,
    message_id: 11,
    action: "cancel_delivery",
    status,
    expires_at: new Date(Date.now() + expiresInMs).toISOString(),
    resolved_at: null,
  };
}

function deferred<T = void>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

// Lets the chain of awaits inside the composable run to its end.
async function flush() {
  for (let i = 0; i < 20; i++) await Promise.resolve();
}

function setup(
  overrides: Partial<Parameters<typeof useAssistantConfirmation>[0]> = {},
  action: Ref<PendingAction> = ref(makeAction())
) {
  const confirm = jest.fn(async () => undefined);
  const reject = jest.fn(async () => undefined);
  const onSettled = jest.fn();

  const card = useAssistantConfirmation({
    action,
    confirm,
    reject,
    onSettled,
    now: () => Date.now(),
    ...overrides,
  });

  return { card, action, confirm, reject, onSettled };
}

beforeEach(() => {
  jest.useFakeTimers("modern");
  jest.setSystemTime(NOW);
});

afterEach(() => {
  jest.useRealTimers();
});

describe("stateFromAction", () => {
  it.each([
    ["confirmed", "confirmed"],
    ["rejected", "rejected"],
    ["expired", "expired"],
    ["failed", "refused"],
    ["superseded", "closed"],
  ] as const)("maps the server status %s to %s", (status, expected) => {
    expect(stateFromAction(makeAction(status), NOW)).toBe(expected);
  });

  it("keeps a pending one pending while it is still valid", () => {
    expect(stateFromAction(makeAction("pending", MINUTE), NOW)).toBe("pending");
  });

  it("treats a pending one past its time as expired, even if the server did not flip it yet", () => {
    expect(stateFromAction(makeAction("pending", -1), NOW)).toBe("expired");
    expect(stateFromAction(makeAction("pending", 0), NOW)).toBe("expired");
  });
});

describe("classifyFailure", () => {
  it.each([409, 403, 404])("%s is a refusal", (status) => {
    expect(classifyFailure({ status })).toBe("refused");
  });

  it.each([[undefined], [401], [500], [502], [503]])(
    "%s may get better by trying again",
    (status) => {
      expect(classifyFailure({ status })).toBe("network_error");
    }
  );

  it("treats a thrown value without a status as a network failure", () => {
    expect(classifyFailure(new Error("boom"))).toBe("network_error");
    expect(classifyFailure(null)).toBe("network_error");
  });
});

describe("initial state", () => {
  it("starts from what the server says", () => {
    const { card } = setup({}, ref(makeAction("confirmed")));
    expect(card.state.value).toBe("confirmed");
    expect(card.canAct.value).toBe(false);
  });

  it("only offers the buttons while pending", () => {
    const { card } = setup();
    expect(card.state.value).toBe("pending");
    expect(card.canAct.value).toBe(true);
    expect(card.busy.value).toBe(false);
  });

  it("does not reload anything on start", () => {
    const { onSettled } = setup();
    expect(onSettled).not.toHaveBeenCalled();
  });

  it("explains a refusal that already happened when the card first shows", async () => {
    const describeRefusal = jest.fn(async () => "It is In transit now.");
    const { card } = setup({ describeRefusal }, ref(makeAction("failed")));

    expect(card.state.value).toBe("refused");
    expect(card.refusal.value).toBe(GENERIC_REFUSAL); // until the reason arrives

    await flush();
    expect(card.refusal.value).toBe("It is In transit now.");
  });
});

describe("confirming and rejecting", () => {
  it("confirms: submitting while the call is in the air, then confirmed, and reloads once", async () => {
    const gate = deferred();
    const { card, confirm, onSettled } = setup({
      confirm: jest.fn(() => gate.promise),
    });

    const done = card.confirm();
    expect(card.state.value).toBe("submitting");
    expect(card.busy.value).toBe(true);
    expect(card.canAct.value).toBe(false);

    gate.resolve();
    await done;

    expect(card.state.value).toBe("confirmed");
    expect(onSettled).toHaveBeenCalledTimes(1);
    expect(confirm).not.toHaveBeenCalled(); // the override was used, not the default
  });

  it("calls the endpoint with the id of the action", async () => {
    const { card, confirm } = setup();

    await card.confirm();

    expect(confirm).toHaveBeenCalledWith(7);
  });

  it("rejects: goes to rejected and never calls confirm", async () => {
    const { card, confirm, reject, onSettled } = setup();

    await card.reject();

    expect(card.state.value).toBe("rejected");
    expect(reject).toHaveBeenCalledWith(7);
    expect(confirm).not.toHaveBeenCalled();
    expect(onSettled).toHaveBeenCalledTimes(1);
  });

  it("a double click in the same tick sends ONE request", async () => {
    const gate = deferred();
    const confirm = jest.fn(() => gate.promise);
    const { card } = setup({ confirm });

    // Nothing is awaited between the two clicks: the state has not had a chance to render.
    card.confirm();
    card.confirm();
    card.confirm();

    gate.resolve();
    await flush();

    expect(confirm).toHaveBeenCalledTimes(1);
    expect(card.state.value).toBe("confirmed");
  });

  it("confirm and reject clicked together: only the first one goes out", async () => {
    const gate = deferred();
    const confirm = jest.fn(() => gate.promise);
    const reject = jest.fn(async () => undefined);
    const { card } = setup({ confirm, reject });

    card.confirm();
    card.reject();

    gate.resolve();
    await flush();

    expect(confirm).toHaveBeenCalledTimes(1);
    expect(reject).not.toHaveBeenCalled();
    expect(card.state.value).toBe("confirmed");
  });

  it("ignores every action once the card is resolved", async () => {
    const { card, confirm, reject } = setup();

    await card.confirm();
    await card.confirm();
    await card.reject();
    await card.retry();

    expect(confirm).toHaveBeenCalledTimes(1);
    expect(reject).not.toHaveBeenCalled();
  });
});

describe("refusals", () => {
  it("409 becomes refused with the plain-language reason, and reloads", async () => {
    const describeRefusal = jest.fn(
      async () => "The delivery is now In transit."
    );
    const { card, onSettled } = setup({
      confirm: jest.fn(async () => Promise.reject({ status: 409 })),
      describeRefusal,
    });

    await card.confirm();

    expect(card.state.value).toBe("refused");
    expect(card.refusal.value).toBe("The delivery is now In transit.");
    expect(describeRefusal).toHaveBeenCalledTimes(1);
    expect(onSettled).toHaveBeenCalledTimes(1);
    expect(card.canAct.value).toBe(false);
  });

  it("falls back to a generic reason when there is nothing to say", async () => {
    const { card } = setup({
      confirm: jest.fn(async () => Promise.reject({ status: 409 })),
      describeRefusal: jest.fn(async () => null),
    });

    await card.confirm();

    expect(card.refusal.value).toBe(GENERIC_REFUSAL);
  });

  it("falls back to the generic reason when finding the reason fails", async () => {
    const { card } = setup({
      confirm: jest.fn(async () => Promise.reject({ status: 409 })),
      describeRefusal: jest.fn(async () =>
        Promise.reject(new Error("offline"))
      ),
    });

    await card.confirm();

    expect(card.state.value).toBe("refused");
    expect(card.refusal.value).toBe(GENERIC_REFUSAL);
  });

  it.each([403, 404])(
    "%s is refused too, without asking for a reason",
    async (status) => {
      const describeRefusal = jest.fn(async () => "never used");
      const { card } = setup({
        confirm: jest.fn(async () => Promise.reject({ status })),
        describeRefusal,
      });

      await card.confirm();

      expect(card.state.value).toBe("refused");
      expect(card.refusal.value).toBe(GENERIC_REFUSAL);
      expect(describeRefusal).not.toHaveBeenCalled();
    }
  );

  it("does not let a failing reload undo the outcome", async () => {
    const { card } = setup({
      onSettled: jest.fn(async () => Promise.reject(new Error("x"))),
    });

    await card.confirm();

    expect(card.state.value).toBe("confirmed");
  });
});

describe("network errors", () => {
  it.each([[undefined], [500], [401]])(
    "status %s leaves the buttons available and does not reload",
    async (status) => {
      const { card, onSettled } = setup({
        confirm: jest.fn(async () => Promise.reject({ status })),
      });

      await card.confirm();

      expect(card.state.value).toBe("network_error");
      expect(card.canAct.value).toBe(true);
      expect(onSettled).not.toHaveBeenCalled();
    }
  );

  it("retry repeats the SAME intent and succeeds", async () => {
    const reject = jest
      .fn<Promise<unknown>, [number]>()
      .mockRejectedValueOnce({})
      .mockResolvedValueOnce(undefined);
    const confirm = jest.fn(async () => undefined);
    const { card, onSettled } = setup({ reject, confirm });

    await card.reject();
    expect(card.state.value).toBe("network_error");

    await card.retry();

    expect(reject).toHaveBeenCalledTimes(2);
    expect(confirm).not.toHaveBeenCalled();
    expect(card.state.value).toBe("rejected");
    expect(onSettled).toHaveBeenCalledTimes(1);
  });

  it("can fail again and again without getting stuck", async () => {
    const confirm = jest.fn(async () => Promise.reject({}));
    const { card } = setup({ confirm });

    await card.confirm();
    await card.retry();
    await card.retry();

    expect(confirm).toHaveBeenCalledTimes(3);
    expect(card.state.value).toBe("network_error");
    expect(card.canAct.value).toBe(true);
  });

  it("retry does nothing before anything was tried", async () => {
    const { card, confirm, reject } = setup();

    await card.retry();

    expect(confirm).not.toHaveBeenCalled();
    expect(reject).not.toHaveBeenCalled();
    expect(card.state.value).toBe("pending");
  });

  it("a double click on retry is one request too", async () => {
    const gate = deferred();
    const confirm = jest
      .fn<Promise<unknown>, [number]>()
      .mockRejectedValueOnce({})
      .mockImplementationOnce(() => gate.promise);
    const { card } = setup({ confirm });

    await card.confirm();
    card.retry();
    card.retry();

    gate.resolve();
    await flush();

    expect(confirm).toHaveBeenCalledTimes(2);
  });
});

describe("expiry", () => {
  it("expires by itself when the time comes, and reloads", () => {
    const { card, onSettled } = setup({}, ref(makeAction("pending", 5_000)));

    jest.advanceTimersByTime(4_999);
    expect(card.state.value).toBe("pending");

    jest.advanceTimersByTime(1);
    expect(card.state.value).toBe("expired");
    expect(card.canAct.value).toBe(false);
    expect(onSettled).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
  });

  it("does not expire under a request that is already in the air", async () => {
    const gate = deferred();
    const { card } = setup(
      { confirm: jest.fn(() => gate.promise) },
      ref(makeAction("pending", 5_000))
    );

    const done = card.confirm();
    jest.advanceTimersByTime(60_000);

    expect(card.state.value).toBe("submitting");

    gate.resolve();
    await done;
    expect(card.state.value).toBe("confirmed");
  });

  it("stops the timer when the card is resolved by a click", async () => {
    const { card } = setup();
    expect(jest.getTimerCount()).toBe(1);

    await card.confirm();

    expect(jest.getTimerCount()).toBe(0);
  });

  it("keeps counting after a network error, so the card still expires", async () => {
    const { card } = setup(
      { confirm: jest.fn(async () => Promise.reject({})) },
      ref(makeAction("pending", 5_000))
    );

    await card.confirm();
    expect(card.state.value).toBe("network_error");

    jest.advanceTimersByTime(5_000);

    expect(card.state.value).toBe("expired");
  });

  it("clears its timer on dispose", () => {
    const { card } = setup();
    expect(jest.getTimerCount()).toBe(1);

    card.dispose();

    expect(jest.getTimerCount()).toBe(0);
  });

  it("survives a delay longer than a setTimeout can hold", () => {
    const thirtyDays = 30 * 24 * 60 * MINUTE;
    const spy = jest.spyOn(globalThis, "setTimeout");
    const { card } = setup({}, ref(makeAction("pending", thirtyDays)));

    // A naive setTimeout(thirtyDays) overflows 32 bits and fires at once. Checked on the
    // delays themselves, so a regression fails fast instead of spinning the fake clock.
    const delays = spy.mock.calls.map((call) => Number(call[1]));
    expect(delays.length).toBeGreaterThan(0);
    expect(Math.max(...delays)).toBeLessThanOrEqual(2 ** 31 - 1);
    spy.mockRestore();

    jest.advanceTimersByTime(25 * 24 * 60 * MINUTE);
    expect(card.state.value).toBe("pending");
    expect(jest.getTimerCount()).toBe(1);

    jest.advanceTimersByTime(5 * 24 * 60 * MINUTE);
    expect(card.state.value).toBe("expired");
  });
});

describe("synchronising with the server", () => {
  it("follows the server when a reload brings news", () => {
    const action = ref(makeAction("pending"));
    const { card } = setup({}, action);

    action.value = makeAction("confirmed");

    expect(card.state.value).toBe("confirmed");
    expect(jest.getTimerCount()).toBe(0);
  });

  it("a reload that still says pending keeps the network error on screen", async () => {
    const action = ref(makeAction("pending"));
    const { card } = setup(
      { confirm: jest.fn(async () => Promise.reject({})) },
      action
    );

    await card.confirm();
    action.value = makeAction("pending"); // an unrelated push made the screen reload

    expect(card.state.value).toBe("network_error");
  });

  it("a reload that still says pending keeps the expiry the clock decided", () => {
    const action = ref(makeAction("pending", 5_000));
    const { card } = setup({}, action);

    jest.advanceTimersByTime(5_000);
    expect(card.state.value).toBe("expired");

    // The server has not flipped it (it only does when somebody tries).
    action.value = { ...makeAction("pending", -1) };

    expect(card.state.value).toBe("expired");
  });

  it("ignores a reload that lands while the request is still in the air", async () => {
    const gate = deferred();
    const action = ref(makeAction("pending"));
    const { card } = setup({ confirm: jest.fn(() => gate.promise) }, action);

    const done = card.confirm();
    action.value = makeAction("rejected"); // e.g. answered from another tab

    expect(card.state.value).toBe("submitting");

    gate.resolve();
    await done;
    expect(card.state.value).toBe("confirmed");
  });

  it("keeps the reason of a refusal when the reload confirms it", async () => {
    const action = ref(makeAction("pending"));
    const describeRefusal = jest.fn(async () => "It is In transit now.");
    const { card } = setup(
      {
        confirm: jest.fn(async () => Promise.reject({ status: 409 })),
        describeRefusal,
      },
      action
    );

    await card.confirm();
    action.value = makeAction("failed"); // what the reload brings back

    expect(card.state.value).toBe("refused");
    expect(card.refusal.value).toBe("It is In transit now.");
    expect(describeRefusal).toHaveBeenCalledTimes(1);
  });

  it("shows what really happened when the 409 was somebody else's answer", async () => {
    const action = ref(makeAction("pending"));
    const { card } = setup(
      { confirm: jest.fn(async () => Promise.reject({ status: 409 })) },
      action
    );

    await card.confirm();
    action.value = makeAction("confirmed"); // another tab got there first

    expect(card.state.value).toBe("confirmed");
    expect(card.refusal.value).toBeNull();
  });
});
