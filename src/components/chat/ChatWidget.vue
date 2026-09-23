<template>
  <div class="fixed bottom-4 left-4 z-50">
    <!-- Painel -->
    <div
      v-if="open"
      class="mb-3 w-80 h-96 bg-white rounded-xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden"
    >
      <div
        class="px-4 py-3 border-b border-gray-100 flex items-center justify-between"
      >
        <div>
          <p class="text-sm font-medium text-gray-900">Support</p>
          <p class="text-[11px] text-gray-400">
            Your conversation with our team
          </p>
        </div>
        <button
          type="button"
          @click="open = false"
          class="text-gray-400 hover:text-gray-600 text-lg leading-none"
        >
          &times;
        </button>
      </div>

      <p
        v-if="loading"
        class="flex-1 grid place-items-center text-xs text-gray-400"
      >
        Loading...
      </p>

      <MessageList
        v-else
        :messages="messages"
        :current-user-id="currentUserId"
      />

      <MessageComposer :disabled="sending || !conversationId" @send="send" />

      <p v-if="error" class="px-4 pb-2 text-xs text-red-600">{{ error }}</p>
    </div>

    <!-- Botao -->
    <button
      type="button"
      @click="toggle"
      class="relative w-12 h-12 rounded-full bg-gray-900 text-white shadow-lg hover:bg-gray-800 transition grid place-items-center"
      title="Talk to support"
    >
      <span class="text-lg">💬</span>
      <span
        v-if="unread > 0 && !open"
        class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-medium flex items-center justify-center"
      >
        {{ unread > 9 ? "9+" : unread }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import api from "@/services/api";
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
