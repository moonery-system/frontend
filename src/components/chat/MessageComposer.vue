<template>
  <form
    @submit.prevent="submit"
    class="border-t border-cream/10 p-3 flex items-end gap-2"
  >
    <textarea
      v-model="body"
      rows="1"
      :disabled="disabled"
      placeholder="Write a message"
      class="flex-1 resize-none rounded-lg border border-cream/[0.14] bg-ink-900 px-3 py-2 text-sm text-cream placeholder-cream/40 transition-colors duration-200 focus:border-ember-500/60 focus:outline-none focus:ring-2 focus:ring-ember-500/30 disabled:opacity-50"
      @keydown.enter.exact.prevent="submit"
    ></textarea>

    <button
      type="submit"
      :disabled="disabled || !body.trim()"
      class="rounded-lg bg-ember-500 px-3 py-2 text-sm font-semibold text-ink-950 transition-colors duration-200 hover:bg-ember-400 active:bg-ember-600 disabled:opacity-40"
    >
      Send
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{ disabled?: boolean }>();

const emit = defineEmits<{ (e: "send", body: string): void }>();

const body = ref("");

function submit() {
  const text = body.value.trim();

  if (!text || props.disabled) return;

  emit("send", text);
  body.value = "";
}
</script>
