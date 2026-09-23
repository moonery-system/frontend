<template>
  <div
    class="surface divide-y divide-cream/10 overflow-hidden"
    role="status"
    aria-busy="true"
  >
    <div
      v-for="n in rows"
      :key="n"
      class="flex items-center gap-4 px-5 py-4 sm:px-6"
    >
      <div class="skeleton h-10 w-10 shrink-0 !rounded-lg"></div>
      <div class="flex-1 space-y-2">
        <div
          class="skeleton h-4"
          :style="{ width: 30 + ((n * 17) % 25) + '%' }"
        ></div>
        <div
          class="skeleton h-3"
          :style="{ width: 18 + ((n * 11) % 20) + '%' }"
        ></div>
      </div>
      <div class="skeleton hidden h-8 w-20 sm:block"></div>
    </div>
    <span class="sr-only">Loading</span>
  </div>
</template>

<script setup lang="ts">
defineProps({ rows: { type: Number, default: 5 } });
</script>
