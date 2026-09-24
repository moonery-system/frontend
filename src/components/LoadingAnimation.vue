<template>
  <div v-if="loading" class="animate-pulse">
    <div class="mb-8">
      <div class="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
      <div class="h-4 bg-gray-200 rounded w-1/3"></div>
    </div>
    <div class="bg-white rounded-xl border border-gray-100 p-6">
      <div class="space-y-4">
        <div class="h-6 bg-gray-200 rounded w-1/2"></div>
        <div class="h-4 bg-gray-200 rounded w-3/4"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "LoadingAnimation",
  props: {
    loading: Boolean,
  },
};
</script>
