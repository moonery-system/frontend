<template>
  <form
    @submit.prevent="submit"
    class="border-t border-gray-100 p-3 flex items-end gap-2"
  >
    <textarea
      v-model="body"
      rows="1"
      :disabled="disabled"
      placeholder="Write a message..."
      class="flex-1 resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
      @keydown.enter.exact.prevent="submit"
    ></textarea>

    <button
      type="submit"
      :disabled="disabled || !body.trim()"
      class="px-3 py-2 text-sm font-medium rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition disabled:opacity-50"
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
