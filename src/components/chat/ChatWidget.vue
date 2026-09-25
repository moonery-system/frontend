<template>
  <div class="fixed bottom-4 left-4 z-40 lg:left-[19rem]">
    <!-- Painel -->
    <div
      v-if="open"
      class="mb-3 flex h-[26rem] w-[20rem] max-w-[calc(100vw-2rem)] animate-rise flex-col overflow-hidden rounded-xl border border-cream/[0.14] bg-ink-800 shadow-float"
    >
      <div
        class="px-4 py-3 border-b border-cream/10 flex items-center justify-between"
      >
        <div>
          <p class="font-display text-sm font-bold text-cream">Support desk</p>
          <p class="text-[11px] text-cream/55">
            Usually answered within a few minutes
          </p>
        </div>
        <button
          type="button"
          @click="open = false"
          class="grid h-8 w-8 place-items-center rounded-lg text-cream/55 transition-colors duration-200 hover:bg-cream/[0.06] hover:text-cream"
          aria-label="Close chat"
        >
          <AppIcon name="x" :size="16" />
        </button>
      </div>

      <div v-if="loading" class="flex-1 space-y-3 p-4" aria-busy="true">
        <div class="skeleton h-9 w-2/3"></div>
        <div class="skeleton ml-auto h-9 w-1/2"></div>
        <div class="skeleton h-9 w-3/5"></div>
      </div>

      <MessageList
        v-else
        :messages="messages"
        :current-user-id="currentUserId"
        interactive
        @settled="reload"
      />

      <AssistantPresence
        v-if="eligible"
        :phase="waiting.phase.value"
        :handed-off="handedOff"
      />

      <MessageComposer :disabled="sending || !conversationId" @send="send" />

      <p v-if="error" class="px-4 pb-2 text-xs text-rust-400">{{ error }}</p>
    </div>

    <!-- Botao -->
    <button
      type="button"
      @click="toggle"
      class="relative grid h-12 w-12 place-items-center rounded-xl bg-ember-500 text-ink-950 shadow-float transition-all duration-200 hover:bg-ember-400 active:bg-ember-600 active:scale-95"
      title="Talk to support"
      aria-label="Talk to support"
    >
      <AppIcon :name="open ? 'x' : 'message'" :size="20" :stroke-width="2" />
      <span
        v-if="unread > 0 && !open"
        class="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold-400 px-1 text-[10px] font-bold text-ink-950 ring-2 ring-ink-950"
      >
        {{ unread > 9 ? "9+" : unread }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import api from "@/services/api";
import AppIcon from "@/components/ui/AppIcon.vue";
import AssistantPresence from "@/components/chat/AssistantPresence.vue";
import MessageList from "@/components/chat/MessageList.vue";
import MessageComposer from "@/components/chat/MessageComposer.vue";
import type { AssistantStatus, Conversation, Message } from "@/types/api";
import { getCurrentPermissions, getCurrentUser } from "@/services/auth";
import { onNotification } from "@/services/websocket";
import {
  POLL_INTERVAL_MS,
  canUseAssistant,
  useAssistantWaiting,
  withinPollWindow,
} from "@/composables/useAssistantWaiting";
import { createSingleFlight } from "@/utils/singleFlight";

const open = ref(false);
const loading = ref(false);
const sending = ref(false);
const error = ref("");
const conversationId = ref<number | null>(null);
const messages = ref<Message[]>([]);
const unread = ref(0);
const currentUserId = ref<number | null>(getCurrentUser()?.id ?? null);
const assistantStatus = ref<AssistantStatus | undefined>(undefined);
let unsubscribe: (() => void) | null = null;
let poller: ReturnType<typeof setInterval> | null = null;

// The widget is everybody's "my conversation": the assistant only answers customers, so
// only they get its indicator and its handoff notice.
const eligible = computed(() => canUseAssistant(getCurrentPermissions()));
const handedOff = computed(
  () => eligible.value && assistantStatus.value === "handed_off"
);

const waiting = useAssistantWaiting({
  messages,
  assistantStatus,
  enabled: eligible,
  currentUserId,
});

// api.ts turns every failure into { status, message, errors }; no status means no answer.
function describe(err: unknown): string {
  const failure = err as { status?: number; message?: string };

  return failure.status
    ? failure.message ?? "Unexpected error"
    : "Network error or server is unreachable.";
}

function apply(conversation: Conversation) {
  conversationId.value = conversation.id;
  messages.value = conversation.messages ?? [];
  assistantStatus.value = conversation.assistant_status;
}

async function loadConversation() {
  loading.value = true;
  error.value = "";

  try {
    const response = await api.get("/conversations/me");
    apply(response.data.data);
  } catch (err) {
    error.value = describe(err);
  } finally {
    loading.value = false;
  }
}

// Reloads without the skeleton, and never two at once: a burst of pushes becomes one
// extra fetch. The push carries neither the confirmation card nor the assistant flag, so
// the thread is fetched again instead of appending what the push says.
const reload = createSingleFlight(async () => {
  const response = await api.get("/conversations/me");
  apply(response.data.data);
});

async function markRead() {
  if (!conversationId.value) return;

  try {
    await api.put(`/conversations/${conversationId.value}/read`);
    unread.value = 0;
  } catch (err) {
    // deixa o contador como esta se o servidor recusou
  }
}

async function loadUnread() {
  try {
    const response = await api.get("/conversations/unread-count");
    unread.value = response.data.data.unread;
  } catch (err) {
    unread.value = 0;
  }
}

async function toggle() {
  open.value = !open.value;

  if (!open.value) return;

  await loadConversation();
  await markRead();
}

async function send(body: string) {
  if (!conversationId.value) return;

  sending.value = true;
  error.value = "";

  try {
    const response = await api.post(
      `/conversations/${conversationId.value}/messages`,
      {
        body,
      }
    );
    messages.value = [...messages.value, response.data.data];
  } catch (err) {
    error.value = describe(err);
  } finally {
    sending.value = false;
  }
}

// Safety net while an answer is awaited: a push lost while the socket reconnects would
// otherwise leave the customer looking at "replying…" for an answer that already came.
function syncPolling() {
  const shouldPoll = open.value && waiting.phase.value !== "idle";

  if (!shouldPoll) {
    if (poller) clearInterval(poller);
    poller = null;
    return;
  }

  if (poller) return;

  poller = setInterval(() => {
    const last = messages.value[messages.value.length - 1];

    // Long past the point where an answer can still come: stop asking. It starts again
    // by itself the next time the chat is opened or a new message is waiting.
    if (!last || !withinPollWindow(last.created_at, Date.now())) {
      if (poller) clearInterval(poller);
      poller = null;
      return;
    }

    reload().catch(() => undefined);
  }, POLL_INTERVAL_MS);
}

watch([open, waiting.phase], syncPolling);

onMounted(() => {
  currentUserId.value = getCurrentUser()?.id ?? null;
  loadUnread();

  unsubscribe = onNotification((payload) => {
    if (payload.type !== "chat.message") return;

    if (open.value && payload.conversation_id === conversationId.value) {
      reload()
        .then(markRead)
        .catch(() => undefined);
    } else {
      unread.value += 1;
    }
  });
});

onUnmounted(() => {
  unsubscribe?.();
  if (poller) clearInterval(poller);
});
</script>
