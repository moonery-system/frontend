<template>
  <button
    type="submit"
    :disabled="loading"
    class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition disabled:opacity-50"
  >
    <svg
      v-if="loading"
      class="animate-spin w-4 h-4 mr-2"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
    {{ loading ? loadingText : defaultText }}
  </button>
</template>

<script>
export default {
  name: "ProcessButton",
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    loadingText: {
      type: String,
      default: "Processing...",
    },
    defaultText: {
      type: String,
      default: "Submit",
    },
  },
};
</script>
