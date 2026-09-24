<template>
  <div v-if="error" class="text-center py-16">
    <div
      class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
    >
      <svg
        class="w-8 h-8 text-red-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
    <h3 class="text-lg font-medium text-gray-900 mb-2">
      Error Loading Resource
    </h3>
    <p class="text-gray-500 mb-6">{{ error }}</p>
    <button
      @click="tryAgain"
      class="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200"
    >
      Try Again
    </button>
  </div>
</template>

<script>
export default {
  name: "ErrorLoading",
  props: {
    error: String,
    retry: Function,
  },
  methods: {
    tryAgain() {
      this.$emit("retry");
    },
  },
};
</script>
