import { computed, getCurrentScope, onScopeDispose, ref, watch } from "vue";
import type { Ref } from "vue";
import type { PendingAction } from "@/types/api";

/**
 * The life of one "do you confirm the cancellation?" card.
 *
 *   pending ──confirm──▶ submitting ──ok──▶ confirmed
 *      │  ▲                  │ └────409/403/404──▶ refused
 *      │  └──try again───────┴── network / 5xx / 401 ──▶ network_error
 *      └──reject──▶ submitting ──ok──▶ rejected
 *      └──time passes──▶ expired          (also: closed, when a newer question replaced it)
 *
 * The composable knows nothing about HTTP or the DOM: the calls come in as functions, so
 * every branch can be tested in plain Node.
 */
export type ConfirmationState =
  | "pending"
  | "submitting"
  | "confirmed"
  | "rejected"
  | "expired"
  | "refused"
  | "network_error"
  | "closed";

export type Intent = "confirm" | "reject";

export const GENERIC_REFUSAL =
  "Couldn't cancel this delivery. Contact support if you need help.";

// setTimeout stores its delay in 32 bits: anything longer fires immediately.
const MAX_TIMER_MS = 2 ** 31 - 1;

export interface ConfirmationOptions {
  action: Ref<PendingAction>;
  confirm: (id: number) => Promise<unknown>;
  reject: (id: number) => Promise<unknown>;
  /**
   * Plain-language reason for a refusal, from data the screen can fetch (the real status
   * of the delivery). The message the API sends with a 409 is technical and never shown.
   */
  describeRefusal?: (action: PendingAction) => Promise<string | null>;
  /** Called once an outcome is known, so the caller can reload the conversation. */
  onSettled?: () => void | Promise<void>;
  now?: () => number;
}

/**
 * What the server says the card should look like.
 */
export function stateFromAction(
  action: PendingAction,
  now: number
): ConfirmationState {
  switch (action.status) {
    case "pending":
      // The server only flips a confirmation to "expired" when somebody tries it, so a
      // "pending" one past its time is expired as far as the customer is concerned.
      return Date.parse(action.expires_at) <= now ? "expired" : "pending";
    case "confirmed":
      return "confirmed";
    case "rejected":
      return "rejected";
    case "expired":
      return "expired";
    case "failed":
      return "refused";
    case "superseded":
      return "closed";
  }
}

/**
 * 409 is the state machine refusing (the delivery moved on); 403 and 404 mean this
 * confirmation is not the caller's or is gone. None of them gets better by trying again.
 * Anything else -- no answer, a 5xx, a 401 the interceptor could not fix -- might.
 */
export function classifyFailure(error: unknown): "refused" | "network_error" {
  const status = (error as { status?: number } | null)?.status;

  return status === 409 || status === 403 || status === 404
    ? "refused"
    : "network_error";
}

export function useAssistantConfirmation(options: ConfirmationOptions) {
  const now = options.now ?? Date.now;

  const state = ref<ConfirmationState>(
    stateFromAction(options.action.value, now())
  );
  const refusal = ref<string | null>(null);

  // True while a request is in the air. Against a double click it is one of two guards, and
  // neither waits for the screen to render: `state` also flips to "submitting" synchronously,
  // before the first await, so a second click in the same tick already finds the card busy.
  // What only this flag does is keep a reload from overwriting "submitting" (see the watch).
  let inFlight = false;
  let lastIntent: Intent | null = null;
  let lastServerState = stateFromAction(options.action.value, now());
  let timer: ReturnType<typeof setTimeout> | null = null;

  const canAct = computed(
    () => state.value === "pending" || state.value === "network_error"
  );
  const busy = computed(() => state.value === "submitting");

  function clearTimer() {
    if (timer) clearTimeout(timer);
    timer = null;
  }

  function scheduleExpiry() {
    clearTimer();

    if (!canAct.value) return;

    const expiresAt = Date.parse(options.action.value.expires_at);
    const remaining = expiresAt - now();

    if (remaining <= 0) return expire();

    timer = setTimeout(scheduleExpiry, Math.min(remaining, MAX_TIMER_MS));
  }

  function expire() {
    // A request already in the air decides for itself: the server may still accept it.
    if (!canAct.value || inFlight) return;

    state.value = "expired";
    settle();
  }

  async function settle() {
    try {
      await options.onSettled?.();
    } catch (err) {
      // Reloading is a courtesy: the card already shows the outcome.
    }
  }

  async function fillRefusal() {
    if (refusal.value) return;

    refusal.value = GENERIC_REFUSAL;

    try {
      const reason = await options.describeRefusal?.(options.action.value);
      if (reason && state.value === "refused") refusal.value = reason;
    } catch (err) {
      // keeps the generic text
    }
  }

  async function run(intent: Intent) {
    if (inFlight || !canAct.value) return;

    inFlight = true;
    lastIntent = intent;
    state.value = "submitting";
    refusal.value = null;
    clearTimer();

    const id = options.action.value.id;

    try {
      await (intent === "confirm" ? options.confirm(id) : options.reject(id));
      state.value = intent === "confirm" ? "confirmed" : "rejected";
    } catch (err) {
      state.value = classifyFailure(err);

      if (state.value === "refused") {
        // Only a 409 has something worth explaining; the other two stay generic.
        const status = (err as { status?: number } | null)?.status;
        if (status === 409) await fillRefusal();
        else refusal.value = GENERIC_REFUSAL;
      }
    } finally {
      inFlight = false;
    }

    if (state.value === "network_error") {
      scheduleExpiry();
      return;
    }

    await settle();
  }

  const confirm = () => run("confirm");
  const reject = () => run("reject");

  /**
   * Repeats what the customer had asked for when the network failed.
   */
  const retry = () => (lastIntent ? run(lastIntent) : Promise.resolve());

  // The server has the last word, but only when it has NEWS. A reload that still says
  // "pending" must not erase a network error the customer is looking at, nor an expiry
  // the clock already decided.
  watch(
    options.action,
    (action) => {
      if (inFlight) return;

      const server = stateFromAction(action, now());
      if (server === lastServerState) return;

      lastServerState = server;
      state.value = server;

      if (server === "refused") fillRefusal();
      else refusal.value = null;

      scheduleExpiry();
    },
    { flush: "sync" }
  );

  if (state.value === "refused") fillRefusal();
  scheduleExpiry();

  if (getCurrentScope()) onScopeDispose(clearTimer);

  return {
    state,
    refusal,
    canAct,
    busy,
    confirm,
    reject,
    retry,
    dispose: clearTimer,
  };
}
