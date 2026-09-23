<template>
  <div class="mx-auto max-w-md py-16 text-center animate-rise">
    <img :src="logoMark" alt="" class="mx-auto h-24 w-24 opacity-90" />
    <p class="eyebrow mt-8">Error 404</p>
    <h1 class="page-title mt-3">Wrong turn</h1>
    <p class="page-lead mx-auto">
      This address is not on our route map. The page may have moved, or the link
      is out of date.
    </p>
    <router-link
      to="/"
      class="mt-8 inline-flex items-center gap-2 rounded-lg bg-ember-500 px-4 py-2.5 text-sm font-bold text-ink-950 transition-colors duration-200 hover:bg-ember-400 active:bg-ember-600"
    >
      <AppIcon name="arrow-left" :size="16" :stroke-width="2.25" />
      Back to overview
    </router-link>
  </div>
</template>

<script setup lang="ts">
import AppIcon from "@/components/ui/AppIcon.vue";
import logoMark from "@/assets/logo-mark.png";
</script>
