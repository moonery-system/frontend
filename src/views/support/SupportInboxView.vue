<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-6xl mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-light text-gray-900 tracking-tight">
          Support inbox
        </h1>
        <p class="text-sm text-gray-500 mt-1">
          Conversations you attend. Your own conversation is in the chat button.
        </p>
      </div>

      <LoadingAnimation :loading="loading" />

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Conversas -->
        <div class="md:col-span-1 space-y-2">
          <button
            v-for="conversation in conversations"
            :key="conversation.id"
            type="button"
            @click="openConversation(conversation)"
            class="w-full text-left bg-white rounded-xl border p-4 transition"
            :class="
              selected?.id === conversation.id
                ? 'border-blue-300 bg-blue-50'
                : 'border-gray-100 hover:border-gray-200'
            "
          >
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-gray-900">
                {{ conversation.user?.name ?? `#${conversation.user_id}` }}
              </p>
              <span
                v-if="conversation.unread_count"
                class="min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-medium flex items-center justify-center"
              >
                {{ conversation.unread_count }}
              </span>
            </div>
            <p class="text-xs text-gray-400 mt-0.5">
              {{ conversation.user?.email }}
            </p>
            <p class="text-[11px] text-gray-400 mt-1">
              {{ formatDateTime(conversation.updated_at) }}
            </p>
          </button>

          <p
            v-if="!loading && !conversations.length"
            class="text-sm text-gray-400 py-6 text-center"
          >
            No conversation yet.
          </p>

          <PaginationItems
            :total="total"
            :current-page="currentPage"
            :per-page="perPage"
            :last-page="lastPage"
            :loading="loading"
            item-label="conversations"
            @go-to-page="(page: number) => goToPage(page)"
          />
        </div>

        <!-- Thread -->
        <div class="md:col-span-2">
          <div
            v-if="selected"
            class="bg-white rounded-xl border border-gray-100 shadow-sm h-[32rem] flex flex-col overflow-hidden"
          >
            <div class="px-4 py-3 border-b border-gray-100">
              <p class="text-sm font-medium text-gray-900">
                {{ selected.user?.name }}
              </p>
              <p class="text-[11px] text-gray-400">
                {{ selected.user?.email }}
              </p>
            </div>

            <MessageList
              :messages="messages"
              :current-user-id="currentUserId"
            />
            <MessageComposer :disabled="sending" @send="send" />
          </div>

          <p v-else class="text-sm text-gray-400 py-16 text-center">
            Pick a conversation on the left.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import api from "@/services/api";
import LoadingAnimation from "@/components/LoadingAnimation.vue";
import PaginationItems from "@/components/PaginationItems.vue";
import MessageList from "@/components/chat/MessageList.vue";
import MessageComposer from "@/components/chat/MessageComposer.vue";
import { usePaginatedFetch } from "@/types/api";
import type { Conversation, Message } from "@/types/api";
import { formatDateTime } from "@/utils/date";
import { getCurrentUser } from "@/services/auth";
import { onNotification } from "@/services/websocket";

const {
  data: conversations,
  total,
  currentPage,
  lastPage,
  perPage,
  loading,
  fetch: loadConversations,
  goToPage,
} = usePaginatedFetch<Conversation>("/conversations");

const selected = ref<Conversation | null>(null);
const messages = ref<Message[]>([]);
const sending = ref(false);
const currentUserId = ref<number | null>(null);
let unsubscribe: (() => void) | null = null;

async function openConversation(conversation: Conversation) {
  const response = await api.get(`/conversations/${conversation.id}`);
  selected.value = response.data.data;
  messages.value = response.data.data.messages ?? [];

  await api
    .put(`/conversations/${conversation.id}/read`)
    .catch(() => undefined);
  conversation.unread_count = 0;
}

async function send(body: string) {
  if (!selected.value) return;

  sending.value = true;

  try {
    const response = await api.post(
      `/conversations/${selected.value.id}/messages`,
      {
        body,
      }
    );
    messages.value = [...messages.value, response.data.data];
  } finally {
    sending.value = false;
  }
}

onMounted(() => {
  currentUserId.value = getCurrentUser()?.id ?? null;
  loadConversations();

  unsubscribe = onNotification((payload: any) => {
    if (payload.type !== "chat.message") return;

    if (selected.value && payload.conversation_id === selected.value.id) {
      messages.value = [...messages.value, payload as Message];
      api
        .put(`/conversations/${selected.value.id}/read`)
        .catch(() => undefined);
      return;
    }

    // Chegou noutra conversa: recarrega a lista para o contador subir.
    loadConversations(currentPage.value);
  });
});

onUnmounted(() => unsubscribe?.());
</script>
