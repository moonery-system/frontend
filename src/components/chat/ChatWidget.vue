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
import { onMounted, onUnmounted, ref } from "vue";
import api from "@/services/api";
import AppIcon from "@/components/ui/AppIcon.vue";
import MessageList from "@/components/chat/MessageList.vue";
import MessageComposer from "@/components/chat/MessageComposer.vue";
import type { Conversation, Message } from "@/types/api";
import { getCurrentUser } from "@/services/auth";
import { onNotification } from "@/services/websocket";

const open = ref(false);
const loading = ref(false);
const sending = ref(false);
const error = ref("");
const conversationId = ref<number | null>(null);
const messages = ref<Message[]>([]);
const unread = ref(0);
const currentUserId = ref<number | null>(null);
let unsubscribe: (() => void) | null = null;

async function loadConversation() {
  loading.value = true;
  error.value = "";

  try {
    const response = await api.get("/conversations/me");
    const conversation: Conversation = response.data.data;
    conversationId.value = conversation.id;
    messages.value = conversation.messages ?? [];
  } catch (err: any) {
    error.value = err.status
      ? err.message
      : "Network error or server is unreachable.";
  } finally {
    loading.value = false;
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

  if (conversationId.value) {
    try {
      await api.put(`/conversations/${conversationId.value}/read`);
      unread.value = 0;
    } catch (err) {
      // deixa o contador como esta se o servidor recusou
    }
  }
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
  } catch (err: any) {
    error.value = err.status
      ? err.message
      : "Network error or server is unreachable.";
  } finally {
    sending.value = false;
  }
}

onMounted(() => {
  currentUserId.value = getCurrentUser()?.id ?? null;
  loadUnread();

  unsubscribe = onNotification((payload: any) => {
    if (payload.type !== "chat.message") return;
    if (payload.conversation_id !== conversationId.value) {
      unread.value += 1;
      return;
    }

    if (open.value) {
      messages.value = [...messages.value, payload as Message];
      api
        .put(`/conversations/${conversationId.value}/read`)
        .catch(() => undefined);
    } else {
      unread.value += 1;
    }
  });
});

onUnmounted(() => unsubscribe?.());
</script>
