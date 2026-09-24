<template>
  <PermissionGuard :permission="`${redirect}.create`">
    <button
      @click="action"
      class="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200 shadow-sm"
    >
      <svg
        class="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
      {{ text }}
    </button>
  </PermissionGuard>
</template>

<script>
export default {
  name: "CreateButton",
  props: {
    text: {
      type: String,
      required: true,
    },
    redirect: {
      type: String,
      required: true,
    },
  },
  methods: {
    action() {
      this.$router.push(`/${this.redirect}/create`);
    },
  },
};
</script>
