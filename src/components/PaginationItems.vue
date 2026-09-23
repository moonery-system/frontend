<template>
  <div
    v-if="total > 0"
    class="mt-8 pt-6 border-t border-cream/10 flex justify-between items-center"
  >
    <div class="text-sm text-cream/65">
      Showing {{ (currentPage - 1) * perPage + 1 }} to
      {{ Math.min(currentPage * perPage, total) }} of {{ total }}
      {{ itemLabel }}
    </div>

    <div class="flex items-center space-x-2">
      <button
        @click="$emit('go-to-page', currentPage - 1)"
        :disabled="currentPage === 1 || loading"
        class="px-3 py-1.5 text-sm font-medium text-cream/75 bg-ink-800 border border-cream/[0.14] rounded-lg hover:bg-cream/[0.06] disabled:opacity-50 transition-colors duration-200"
      >
        Previous
      </button>

      <span class="text-sm font-medium text-cream/85">
        Page {{ currentPage }} of {{ lastPage }}
      </span>

      <button
        @click="$emit('go-to-page', currentPage + 1)"
        :disabled="currentPage === lastPage || loading"
        class="px-3 py-1.5 text-sm font-medium text-cream/75 bg-ink-800 border border-cream/[0.14] rounded-lg hover:bg-cream/[0.06] disabled:opacity-50 transition-colors duration-200"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    total: number;
    currentPage: number;
    perPage: number;
    lastPage: number;
    loading: boolean;
    itemLabel?: string;
  }>(),
  { itemLabel: "items" }
);

defineEmits<{
  (e: "go-to-page", page: number): void;
}>();
</script>
