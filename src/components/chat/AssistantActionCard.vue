<template>
  <div
    class="mt-2 border-t border-cream/10 pt-2"
    role="group"
    :aria-labelledby="labelledby"
    :aria-busy="card.busy.value"
  >
    <!-- Always in the DOM, so a screen reader announces the text when it changes. -->
    <p
      ref="statusEl"
      role="status"
      aria-live="polite"
      tabindex="-1"
      class="flex items-start gap-1.5 text-xs leading-5 focus:outline-none"
      :class="[statusText ? 'mb-2' : '', toneClass]"
    >
      <AppIcon
        v-if="statusIcon"
        :name="statusIcon"
        :size="14"
        class="mt-[3px] shrink-0"
      />
      <span>{{ statusText }}</span>
    </p>

    <div v-if="showButtons" class="flex flex-col gap-2">
      <template v-if="card.state.value === 'network_error'">
        <button
          type="button"
          class="min-h-[40px] rounded-lg bg-ember-500 px-3 py-2 text-sm font-semibold text-ink-950 transition-colors duration-200 hover:bg-ember-400 active:bg-ember-600"
          @click="onRetry"
        >
          Try again
        </button>
      </template>

      <template v-else>
        <button
          type="button"
          :disabled="card.busy.value"
          class="min-h-[40px] rounded-lg bg-rust-500 px-3 py-2 text-sm font-semibold text-ink-950 transition-colors duration-200 hover:bg-rust-400 active:bg-rust-500 disabled:cursor-not-allowed disabled:opacity-40"
          @click="onConfirm"
        >
          {{
            card.busy.value && intent === "confirm"
              ? "Confirming…"
              : "Confirm cancellation"
          }}
        </button>
        <button
          type="button"
          :disabled="card.busy.value"
          class="min-h-[40px] rounded-lg border border-cream/20 px-3 py-2 text-sm font-semibold text-cream transition-colors duration-200 hover:bg-cream/[0.06] active:bg-cream/10 disabled:cursor-not-allowed disabled:opacity-40"
          @click="onReject"
        >
          {{
            card.busy.value && intent === "reject"
              ? "Keeping…"
              : "Keep delivery"
          }}
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, toRef, watch } from "vue";
import api from "@/services/api";
import AppIcon from "@/components/ui/AppIcon.vue";
import { useAssistantConfirmation } from "@/composables/useAssistantConfirmation";
import type { ConfirmationState } from "@/composables/useAssistantConfirmation";
import { humanizeStatus } from "@/utils/status";
import type { PendingAction } from "@/types/api";

const props = defineProps<{
  action: PendingAction;
  // Support only reads the card: the API accepts an answer from the customer alone.
  readonly?: boolean;
  // Id of the element that holds the question the card answers.
  labelledby: string;
}>();

const emit = defineEmits<{ (e: "settled"): void }>();

const statusEl = ref<HTMLElement | null>(null);
const intent = ref<"confirm" | "reject" | null>(null);
// Set when a click started the request: the buttons disappear at the end, and focus
// must not fall to the top of the page with them.
let restoreFocus = false;

// The message of a 409 is technical; what is worth saying is what the delivery is now.
async function describeRefusal(action: PendingAction): Promise<string | null> {
  const response = await api.get(`/deliveries/${action.delivery_id}`);
  const status: string | undefined = response.data?.data?.status?.name;

  if (!status) return null;

  return `Couldn't cancel: the delivery is now ${humanizeStatus(
    status
  ).toLowerCase()} and can't be canceled here. Contact support if you need help.`;
}

const card = useAssistantConfirmation({
  action: toRef(props, "action"),
  confirm: (id) => api.post(`/assistant/actions/${id}/confirm`),
  reject: (id) => api.post(`/assistant/actions/${id}/reject`),
  describeRefusal: props.readonly ? undefined : describeRefusal,
  onSettled: () => emit("settled"),
});

const showButtons = computed(
  () =>
    !props.readonly &&
    (card.state.value === "pending" ||
      card.state.value === "submitting" ||
      card.state.value === "network_error")
);

const CUSTOMER_TEXT: Record<ConfirmationState, string> = {
  pending: "",
  submitting: "",
  confirmed: "Cancellation confirmed.",
  rejected: "Delivery kept.",
  expired: "This confirmation expired. Ask the assistant again.",
  refused: "",
  network_error: "Couldn't reach the server. Try again.",
  closed: "Replaced by a newer question.",
};

const SUPPORT_TEXT: Record<ConfirmationState, string> = {
  pending: "Waiting for the customer to confirm.",
  submitting: "Waiting for the customer to confirm.",
  confirmed: "Customer confirmed the cancellation.",
  rejected: "Customer kept the delivery.",
  expired: "Expired without an answer.",
  refused: "Not completed: the delivery changed status.",
  network_error: "Waiting for the customer to confirm.",
  closed: "Replaced by a newer question.",
};

const statusText = computed(() => {
  const state = card.state.value;

  if (props.readonly) return SUPPORT_TEXT[state];
  if (state === "submitting") {
    return intent.value === "reject" ? "Keeping…" : "Confirming…";
  }
  if (state === "refused") return card.refusal.value ?? "";

  return CUSTOMER_TEXT[state];
});

const statusIcon = computed(() => {
  switch (card.state.value) {
    case "confirmed":
      return "check";
    case "refused":
    case "network_error":
      return "alert";
    case "rejected":
    case "expired":
    case "closed":
      return "x";
    default:
      return "";
  }
});

// The words always say it too: colour is never the only carrier of the meaning.
const toneClass = computed(() => {
  switch (card.state.value) {
    case "confirmed":
      return "text-moss-400";
    case "refused":
    case "network_error":
      return "text-rust-400";
    default:
      return "text-cream/65";
  }
});

function onConfirm() {
  intent.value = "confirm";
  restoreFocus = true;
  card.confirm();
}

function onReject() {
  intent.value = "reject";
  restoreFocus = true;
  card.reject();
}

function onRetry() {
  restoreFocus = true;
  card.retry();
}

watch(card.state, async (state) => {
  if (!restoreFocus) return;
  // Still working, or offering the buttons again: the focus is where it should be.
  if (state === "submitting" || state === "network_error") return;

  restoreFocus = false;
  await nextTick();
  statusEl.value?.focus();
});
</script>
