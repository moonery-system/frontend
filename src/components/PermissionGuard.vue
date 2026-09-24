<template>
  <div v-if="hasAccess">
    <slot />
  </div>
  <div v-else-if="showFallback">
    <slot name="fallback"></slot>
  </div>
</template>

<script>
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from "../services/auth";

export default {
  name: "PermissionGuard",
  props: {
    permission: {
      type: String,
      default: null,
    },
    permissions: {
      type: Array,
      default: () => [],
    },
    requireAll: {
      type: Boolean,
      default: false,
    },
    showFallback: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      hasAccess: false,
      loading: true,
    };
  },
  async created() {
    await this.checkPermissions();
  },
  watch: {
    permission: {
      handler() {
        this.checkPermissions();
      },
    },
    permissions: {
      handler() {
        this.checkPermissions();
      },
      deep: true,
    },
  },
  methods: {
    async checkPermissions() {
      this.loading = true;

      try {
        if (this.permission) {
          // Single permission check (supports wildcards)
          this.hasAccess = await hasPermission(this.permission);
        } else if (this.permissions && this.permissions.length > 0) {
          if (this.requireAll) {
            // Check if user has ALL permissions (supports wildcards)
            this.hasAccess = await hasAllPermissions(this.permissions);
          } else {
            // Check if user has ANY permission (supports wildcards)
            this.hasAccess = await hasAnyPermission(this.permissions);
          }
        } else {
          this.hasAccess = true;
        }
      } catch (error) {
        console.error("Error checking permissions:", error);
        this.hasAccess = false;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
