<template>
  <PermissionGuard :permission="`${redirect}.view`">
    <button
      @click="action"
      class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150"
    >
      <svg
        class="w-3 h-3 mr-1.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
      View
    </button>
  </PermissionGuard>
</template>

<script>
export default {
  name: "ViewButton",
  props: {
    id: {
      type: Number,
      required: true,
    },
    redirect: {
      type: String,
      required: true,
    },
  },
  methods: {
    action() {
      this.$router.push(`/${this.redirect}/${this.id}`);
    },
  },
};
</script>
