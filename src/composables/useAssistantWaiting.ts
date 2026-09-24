import { computed, getCurrentScope, onScopeDispose, ref, watch } from "vue";
import type { Ref } from "vue";
import type { AssistantStatus, Message } from "@/types/api";

/**
 * "The assistant is replying…" -- and what to say when it takes too long.
 *
 * It is derived from the data, not from an event: the assistant is being waited for when
 * the last message of the thread is mine, the assistant is still in charge, and I am
 * someone it answers. That is why it survives closing and reopening the chat, and why it
 * goes away on its own the moment the bot (or a person) writes back, or the conversation
 * is handed over.
 */
export type WaitingPhase = "idle" | "waiting" | "timed_out";

// Answers took 6 to 11 s when measured. The slow but legitimate paths (retries of 1, 2 and
// 4 s, a 5 s gap between calls, several tool rounds) go past 20 s; the backend gives up at
// 90 s. 45 s covers the normal without holding the customer in front of a spinner.
export const ASSISTANT_TIMEOUT_MS = 45_000;

// While the answer is awaited, the chat is reloaded as a safety net for a push that was
// lost (a reconnecting socket): every 5 s, for at most 2 minutes after the message.
export const POLL_INTERVAL_MS = 5_000;
export const POLL_WINDOW_MS = 120_000;

/**
 * The same rule the backend uses to decide who the assistant answers: it needs
 * assistant.use, and people of support (chat.viewAll) are on the other side of the chat.
 * Without this an admin or a delivery man would wait for an answer that never comes.
 */
export function canUseAssistant(permissions: string[]): boolean {
  return (
    permissions.includes("assistant.use") &&
    !permissions.includes("chat.viewAll")
  );
}

/**
 * Milliseconds since a message was written, by the server's timestamp. Never negative
 * (the clocks of the server and of this browser may disagree by a little) and 0 when the
 * timestamp is unreadable.
 */
export function ageOf(createdAt: string, now: number): number {
  const written = Date.parse(createdAt);

  return Number.isNaN(written) ? 0 : Math.max(0, now - written);
}

export function withinPollWindow(createdAt: string, now: number): boolean {
  return ageOf(createdAt, now) < POLL_WINDOW_MS;
}

export interface WaitingOptions {
  messages: Ref<Message[]>;
  assistantStatus: Ref<AssistantStatus | undefined>;
  /** The user is someone the assistant answers (see canUseAssistant). */
  enabled: Ref<boolean>;
  currentUserId: Ref<number | null>;
  timeoutMs?: number;
  now?: () => number;
}

export function useAssistantWaiting(options: WaitingOptions) {
  const now = options.now ?? Date.now;
  const timeoutMs = options.timeoutMs ?? ASSISTANT_TIMEOUT_MS;

  const phase = ref<WaitingPhase>("idle");
  let timer: ReturnType<typeof setTimeout> | null = null;

  // The message being waited on, if any.
  const awaited = computed<Message | null>(() => {
    if (!options.enabled.value) return null;
    if (options.assistantStatus.value !== "active") return null;

    const last = options.messages.value[options.messages.value.length - 1];

    // Only a message of mine can be waiting for an answer: the assistant's own, or a
    // person's, is the answer.
    if (!last) return null;
    if (last.sender_id !== options.currentUserId.value) return null;

    return last;
  });

  function clearTimer() {
    if (timer) clearTimeout(timer);
    timer = null;
  }

  // Keyed on the id: a reload brings back new objects for the same messages, and the time
  // is counted from the message's timestamp anyway, so there is nothing to restart.
  watch(
    () => awaited.value?.id,
    () => {
      clearTimer();

      const message = awaited.value;

      if (!message) {
        phase.value = "idle";
        return;
      }

      // A message that has been waiting since before the chat was opened has already used
      // up part of its time, or all of it.
      const remaining = timeoutMs - ageOf(message.created_at, now());

      if (remaining <= 0) {
        phase.value = "timed_out";
        return;
      }

      phase.value = "waiting";
      timer = setTimeout(() => {
        phase.value = "timed_out";
        timer = null;
      }, remaining);
    },
    { immediate: true, flush: "sync" }
  );

  if (getCurrentScope()) onScopeDispose(clearTimer);

  return { phase, awaited, dispose: clearTimer };
}
