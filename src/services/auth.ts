import api from "./api";

interface User {
  id: number;
  name: string;
  email: string;
  // Add other user properties as needed
}

interface AuthData {
  user: User;
  permissions: string[];
}

let cachedAuthData: AuthData | null = null;

export async function isTokenValid(): Promise<boolean> {
  try {
    const response = await api.get("/auth/user");
    cachedAuthData = response.data.data;
    return true;
  } catch (error) {
    cachedAuthData = null;
    return false;
  }
}

export async function getUserData(): Promise<AuthData | null> {
  try {
    if (cachedAuthData) {
      return cachedAuthData;
    }

    const response = await api.get("/auth/user");
    cachedAuthData = response.data.data;
    return cachedAuthData;
  } catch (error) {
    cachedAuthData = null;
    return null;
  }
}

/**
 * Check if a permission matches a wildcard pattern
 * @param permission - The permission to check (e.g., "clients.view")
 * @param pattern - The wildcard pattern (e.g., "clients.*")
 * @returns boolean
 */
function matchesWildcard(permission: string, pattern: string): boolean {
  if (!pattern.includes("*")) {
    return permission === pattern;
  }

  // Convert wildcard pattern to regex
  // clients.* becomes ^clients\..*$
  const regexPattern = pattern
    .replace(/\./g, "\\.") // Escape dots
    .replace(/\*/g, ".*"); // Replace * with .*

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(permission);
}

/**
 * Check if user has a specific permission (supports wildcards)
 * @param permission - Permission to check (e.g., "clients.view" or "clients.*")
 * @returns Promise<boolean>
 */
export async function hasPermission(permission: string): Promise<boolean> {
  const authData = await getUserData();
  if (!authData) return false;

  // If it's a wildcard permission, check if any user permission matches the pattern
  if (permission.includes("*")) {
    return authData.permissions.some((userPermission) =>
      matchesWildcard(userPermission, permission)
    );
  }

  // Regular permission check
  return authData.permissions.includes(permission);
}

/**
 * Check if user has any of the specified permissions (supports wildcards)
 * @param permissions - Array of permissions to check
 * @returns Promise<boolean>
 */
export async function hasAnyPermission(
  permissions: string[]
): Promise<boolean> {
  const authData = await getUserData();
  if (!authData) return false;

  return permissions.some((permission) => {
    if (permission.includes("*")) {
      // Check wildcard permission
      return authData.permissions.some((userPermission) =>
        matchesWildcard(userPermission, permission)
      );
    } else {
      // Check regular permission
      return authData.permissions.includes(permission);
    }
  });
}

/**
 * Check if user has all specified permissions (supports wildcards)
 * @param permissions - Array of permissions to check
 * @returns Promise<boolean>
 */
export async function hasAllPermissions(
  permissions: string[]
): Promise<boolean> {
  const results = await Promise.all(
    permissions.map((permission) => hasPermission(permission))
  );
  return results.every(Boolean);
}

/**
 * Get all user permissions that match a wildcard pattern
 * @param pattern - Wildcard pattern (e.g., "clients.*")
 * @returns Promise<string[]>
 */
export async function getMatchingPermissions(
  pattern: string
): Promise<string[]> {
  const authData = await getUserData();
  if (!authData) return [];

  if (!pattern.includes("*")) {
    return authData.permissions.includes(pattern) ? [pattern] : [];
  }

  return authData.permissions.filter((permission) =>
    matchesWildcard(permission, pattern)
  );
}

/**
 * Check if user has permissions in a specific domain/module
 * @param domain - Domain prefix (e.g., "clients", "users")
 * @returns Promise<boolean>
 */
export async function hasDomainPermissions(domain: string): Promise<boolean> {
  return hasPermission(`${domain}.*`);
}

export function clearAuthCache(): void {
  cachedAuthData = null;
}

export function getCurrentUser(): User | null {
  return cachedAuthData?.user || null;
}

export function getCurrentPermissions(): string[] {
  return cachedAuthData?.permissions || [];
}

/**
 * Get all permissions for a specific domain
 * @param domain - Domain prefix (e.g., "clients")
 * @returns string[]
 */
export function getDomainPermissions(domain: string): string[] {
  const permissions = getCurrentPermissions();
  return permissions.filter((permission) =>
    permission.startsWith(`${domain}.`)
  );
}
