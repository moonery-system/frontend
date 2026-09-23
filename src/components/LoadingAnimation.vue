<template>
  <div v-if="loading" class="space-y-10" role="status" aria-busy="true">
    <div class="space-y-3">
      <div class="skeleton h-3 w-24"></div>
      <div class="skeleton h-9 w-2/5"></div>
      <div class="skeleton h-4 w-3/5"></div>
    </div>
    <div class="surface space-y-4 p-6">
      <div class="skeleton h-5 w-1/3"></div>
      <div class="skeleton h-4 w-3/4"></div>
      <div class="skeleton h-4 w-1/2"></div>
    </div>
    <span class="sr-only">Loading</span>
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
