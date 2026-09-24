<template>
  <PermissionGuard :permission="`${redirect}.update`">
    <button
      @click="action"
      :to="`${redirect}/${id}/edit`"
      class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-150"
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
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
      Edit
    </button>
  </PermissionGuard>
</template>

<script>
export default {
  name: "EditButton",
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
      this.$router.push(`/${this.redirect}/${this.id}/edit`);
    },
  },
};
</script>
