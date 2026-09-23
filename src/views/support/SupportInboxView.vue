<template>
  <div class="animate-rise">
    <PageHeader
      eyebrow="Support desk"
      title="Conversations"
      lead="People waiting on an answer. Your own conversation lives in the chat button."
    />

    <div
      class="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]"
    >
      <!-- Conversation list -->
      <div class="space-y-2">
        <template v-if="loading">
          <div
            v-for="n in 4"
            :key="n"
            class="surface space-y-2 p-4"
            aria-busy="true"
          >
            <div class="skeleton h-4 w-2/5"></div>
            <div class="skeleton h-3 w-3/5"></div>
          </div>
        </template>

        <button
          v-for="conversation in conversations"
          :key="conversation.id"
          type="button"
          @click="openConversation(conversation)"
          class="w-full rounded-xl border p-4 text-left transition-colors duration-200 active:bg-cream/[0.06]"
          :class="
            selected?.id === conversation.id
              ? 'border-ember-500/50 bg-ember-500/10'
              : 'border-cream/10 bg-ink-800 hover:bg-cream/[0.04]'
          "
        >
          <div class="flex items-center justify-between gap-3">
            <p class="truncate text-sm font-semibold text-cream">
              {{ conversation.user?.name ?? `#${conversation.user_id}` }}
            </p>
            <span
              v-if="conversation.unread_count"
              class="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ember-500 px-1 text-[10px] font-bold text-ink-950"
            >
              {{ conversation.unread_count }}
            </span>
          </div>
          <p class="mt-0.5 truncate text-xs text-cream/55">
            {{ conversation.user?.email }}
          </p>
          <p class="mt-2 text-[11px] text-cream/40">
            {{ formatDateTime(conversation.updated_at) }}
          </p>
        </button>

        <div v-if="!loading && !conversations.length" class="surface">
          <EmptyState
            icon="headset"
            title="Quiet on the desk"
            text="When someone writes in, their conversation shows up here."
          />
        </div>

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
      <div>
        <div
          v-if="selected"
          class="surface flex h-[34rem] flex-col overflow-hidden"
        >
          <div class="border-b border-cream/10 px-5 py-4">
            <p class="font-display text-sm font-bold text-cream">
              {{ selected.user?.name }}
            </p>
            <p class="text-[11px] text-cream/55">
              {{ selected.user?.email }}
            </p>
          </div>

          <MessageList :messages="messages" :current-user-id="currentUserId" />
          <MessageComposer :disabled="sending" @send="send" />
        </div>

        <div v-else class="surface">
          <EmptyState
            icon="message"
            title="Pick a conversation"
            text="Choose someone from the list to read the thread and reply."
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import api from "@/services/api";
import PageHeader from "@/components/layout/PageHeader.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
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
