<template>
  <div class="mx-auto max-w-md py-16 text-center animate-rise">
    <div
      class="mx-auto grid h-14 w-14 place-items-center rounded-xl border border-gold-400/30 bg-gold-400/10 text-gold-400"
    >
      <AppIcon name="lock" :size="24" />
    </div>
    <p class="eyebrow mt-8">Restricted area</p>
    <h1 class="page-title mt-3">Not on your route</h1>
    <p class="page-lead mx-auto">
      Your account does not have access to this page. If you think it should,
      ask an administrator to review your permissions.
    </p>
    <div class="mt-8 flex flex-wrap justify-center gap-3">
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg bg-ember-500 px-4 py-2.5 text-sm font-bold text-ink-950 transition-colors duration-200 hover:bg-ember-400 active:bg-ember-600"
        @click="$router.push('/')"
      >
        Go to overview
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg border border-cream/20 px-4 py-2.5 text-sm font-semibold text-cream/85 transition-colors duration-200 hover:bg-cream/[0.06] active:bg-cream/10"
        @click="$router.go(-1)"
      >
        Previous page
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppIcon from "@/components/ui/AppIcon.vue";
</script>
