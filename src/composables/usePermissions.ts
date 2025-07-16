import { ref, computed } from "vue";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getMatchingPermissions,
  hasDomainPermissions,
  getDomainPermissions,
} from "../services/auth";

/**
 * Composable for permission checking in Vue components
 */
export function usePermissions() {
  const loading = ref(false);

  /**
   * Check if user has a specific permission (reactive)
   */
  const checkPermission = async (permission: string) => {
    loading.value = true;
    try {
      return await hasPermission(permission);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Check if user has any of the specified permissions (reactive)
   */
  const checkAnyPermission = async (permissions: string[]) => {
    loading.value = true;
    try {
      return await hasAnyPermission(permissions);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Check if user has all specified permissions (reactive)
   */
  const checkAllPermissions = async (permissions: string[]) => {
    loading.value = true;
    try {
      return await hasAllPermissions(permissions);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get permissions matching a wildcard pattern
   */
  const getWildcardPermissions = async (pattern: string) => {
    loading.value = true;
    try {
      return await getMatchingPermissions(pattern);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Check if user has any permissions in a domain
   */
  const checkDomainAccess = async (domain: string) => {
    loading.value = true;
    try {
      return await hasDomainPermissions(domain);
    } finally {
      loading.value = false;
    }
  };

  return {
    loading: computed(() => loading.value),
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
    getWildcardPermissions,
    checkDomainAccess,
    getDomainPermissions,
  };
}
