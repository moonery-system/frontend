<template>
  <div class="relative">
    <AppIcon
      name="search"
      :size="16"
      class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cream/40"
    />
    <input
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
      class="w-full rounded-lg border border-cream/[0.14] py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ember-500/30"
      @input="onInput"
    />
  </div>
</template>

<script setup lang="ts">
import AppIcon from "@/components/ui/AppIcon.vue";

defineProps({
  modelValue: { type: String, default: "" },
  placeholder: { type: String, default: "Search" },
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "input"): void;
}>();

function onInput(event: Event) {
  emit("update:modelValue", (event.target as HTMLInputElement).value);
  emit("input");
}
</script>
