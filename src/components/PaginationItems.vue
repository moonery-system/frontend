<template>
  <div
    v-if="total > 0"
    class="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center"
  >
    <div class="text-sm text-gray-500">
      Showing {{ (currentPage - 1) * perPage + 1 }} to
      {{ Math.min(currentPage * perPage, total) }} of {{ total }} clients
    </div>

    <div class="flex items-center space-x-2">
      <button
        @click="$emit('go-to-page', currentPage - 1)"
        :disabled="currentPage === 1 || loading"
        class="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors duration-150"
      >
        Previous
      </button>

      <span class="text-sm font-medium text-gray-700">
        Page {{ currentPage }} of {{ lastPage }}
      </span>

      <button
        @click="$emit('go-to-page', currentPage + 1)"
        :disabled="currentPage === lastPage || loading"
        class="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors duration-150"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
  loading: boolean;
}>();

defineEmits<{
  (e: "go-to-page", page: number): void;
}>();
</script>
