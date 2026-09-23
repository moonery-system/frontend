<template>
  <PermissionGuard :permission="`${redirect}.create`">
    <button
      @click="action"
      class="inline-flex items-center px-4 py-2 bg-ember-500 text-ink-950 text-sm font-medium rounded-lg hover:bg-ember-400 active:bg-ember-600 transition-colors duration-200 shadow-layer"
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
