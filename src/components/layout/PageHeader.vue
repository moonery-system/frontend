<template>
  <header
    class="mb-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-6 lg:mb-14"
  >
    <div class="min-w-0">
      <button
        v-if="back"
        type="button"
        class="group mb-6 inline-flex items-center gap-2 text-sm font-semibold text-cream/55 transition-colors duration-200 hover:text-cream"
        @click="$router.go(-1)"
      >
        <AppIcon
          name="arrow-left"
          :size="16"
          class="transition-transform duration-200 group-hover:-translate-x-0.5"
        />
        Back
      </button>
      <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
      <h1 class="page-title" :class="eyebrow ? 'mt-3' : ''">{{ title }}</h1>
      <p v-if="lead" class="page-lead">{{ lead }}</p>
    </div>
    <div v-if="$slots.default" class="flex shrink-0 items-center gap-3">
      <slot />
    </div>
  </header>
</template>

<script setup lang="ts">
import AppIcon from "@/components/ui/AppIcon.vue";

defineProps({
  title: { type: String, required: true },
  eyebrow: { type: String, default: "" },
  lead: { type: String, default: "" },
  back: { type: Boolean, default: false },
});
</script>
