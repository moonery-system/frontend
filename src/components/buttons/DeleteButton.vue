<template>
  <PermissionGuard :permission="`${redirect}.delete`">
    <button
      @click="handleDelete"
      :disabled="loading"
      class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-150 disabled:opacity-50"
    >
      <svg
        v-if="!loading"
        class="w-3 h-3 mr-1.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
      <svg
        v-else
        class="animate-spin w-3 h-3 mr-1.5"
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
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {{ loading ? "Deleting..." : "Delete" }}
    </button>
  </PermissionGuard>
</template>

<script>
import api from "@/services/api";
import PermissionGuard from "@/components/PermissionGuard.vue";

export default {
  name: "DeleteButton",
  components: {
    PermissionGuard,
  },
  props: {
    id: {
      type: [Number, String],
      required: true,
    },
    redirect: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: "",
    },
  },
  emits: ["deleted"],
  data() {
    return {
      loading: false,
    };
  },
  methods: {
    async handleDelete() {
      const itemName = this.name || `${this.redirect} #${this.id}`;

      if (!confirm(`Are you sure you want to delete ${itemName}?`)) {
        return;
      }

      this.loading = true;

      try {
        await api.delete(`/${this.redirect}/${this.id}`);
        this.$emit("deleted", this.id);
      } catch (error) {
        console.error("Delete failed:", error);
        alert("Failed to delete. Please try again.");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
