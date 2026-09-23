<template>
  <div ref="scroller" class="flex-1 overflow-y-auto px-4 py-3 space-y-2">
    <p v-if="!messages.length" class="text-xs text-gray-400 text-center py-6">
      No message yet. Say something.
    </p>

    <div
      v-for="message in messages"
      :key="message.id"
      class="flex"
      :class="isMine(message) ? 'justify-end' : 'justify-start'"
    >
      <div
        class="max-w-[80%] rounded-2xl px-3 py-2"
        :class="
          isMine(message)
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
        "
      >
        <p
          v-if="!isMine(message) && message.sender"
          class="text-[11px] font-medium opacity-70 mb-0.5"
        >
          {{ message.sender.name }}
        </p>
        <p class="text-sm whitespace-pre-wrap break-words">
          {{ message.body }}
        </p>
        <p
          class="text-[10px] mt-1"
          :class="isMine(message) ? 'text-blue-100' : 'text-gray-400'"
        >
          {{ formatDateTime(message.created_at) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import type { Message } from "@/types/api";
import { formatDateTime } from "@/utils/date";

const props = defineProps<{
  messages: Message[];
  currentUserId: number | null;
}>();

const scroller = ref<HTMLElement | null>(null);

function isMine(message: Message): boolean {
  return message.sender_id === props.currentUserId;
}

// Keeps the latest message in view as the thread grows.
watch(
  () => props.messages.length,
  async () => {
    await nextTick();
    if (scroller.value) scroller.value.scrollTop = scroller.value.scrollHeight;
  }
);
</script>
