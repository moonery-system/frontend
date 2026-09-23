<template>
  <div ref="scroller" class="flex-1 overflow-y-auto px-4 py-3 space-y-2">
    <div v-if="!messages.length" class="px-4 py-10 text-center">
      <AppIcon name="message" :size="22" class="mx-auto text-cream/30" />
      <p class="mt-3 text-sm font-semibold text-cream/85">Nothing sent yet</p>
      <p class="mt-1 text-xs leading-5 text-cream/50">
        Ask about a tracking code or a late delivery and the desk picks it up.
      </p>
    </div>

    <div
      v-for="message in messages"
      :key="message.id"
      class="flex"
      :class="isMine(message) ? 'justify-end' : 'justify-start'"
    >
      <div
        class="max-w-[80%] rounded-xl px-3 py-2"
        :class="
          isMine(message)
            ? 'bg-ember-500 text-ink-950 rounded-br-sm'
            : 'bg-cream/[0.06] text-cream rounded-bl-sm'
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
          :class="isMine(message) ? 'text-ink-950/60' : 'text-cream/55'"
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
import AppIcon from "@/components/ui/AppIcon.vue";

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
