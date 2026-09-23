<template>
  <div class="px-6 py-16 text-center">
    <div
      class="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-xl border border-cream/10 bg-cream/[0.04] text-gold-400"
    >
      <AppIcon :name="icon" :size="22" />
    </div>
    <h3 class="font-display text-lg font-bold tracking-tight text-cream">
      {{ title }}
    </h3>
    <p class="mx-auto mt-2 max-w-sm text-sm leading-6 text-cream/60">
      {{ text }}
    </p>
    <div v-if="$slots.default" class="mt-7 flex justify-center">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import AppIcon from "@/components/ui/AppIcon.vue";

defineProps({
  icon: { type: String, default: "inbox" },
  title: { type: String, required: true },
  text: { type: String, default: "" },
});
</script>
