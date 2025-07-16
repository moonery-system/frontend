<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div
      v-if="loadingAuth"
      class="min-h-screen flex items-center justify-center"
    >
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"
        ></div>
        <p class="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>

    <!-- Main App -->
    <div v-else>
      <!-- Navbar Superior -->
      <nav
        v-if="isAuthenticated"
        class="bg-white shadow-lg border-b border-gray-200"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <!-- Logo/Brand -->
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <h1 class="text-2xl font-bold text-gray-800">Moonery</h1>
              </div>
            </div>

            <!-- Navigation Links - Desktop -->
            <div class="hidden md:block">
              <div class="ml-10 flex items-baseline space-x-8">
                <router-link
                  to="/"
                  class="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-blue-50 hover:text-blue-600"
                  active-class="bg-blue-100 text-blue-700"
                  exact
                >
                  <span class="mr-2">🏠</span>
                  Home
                </router-link>

                <router-link
                  to="/about"
                  class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600"
                  active-class="bg-blue-100 text-blue-700"
                >
                  <span class="mr-2">ℹ️</span>
                  About
                </router-link>

                <!-- Permission Guard funcionando com Options API -->
                <PermissionGuard permission="clients.viewAny">
                  <router-link
                    to="/clients"
                    class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600"
                    active-class="bg-blue-100 text-blue-700"
                  >
                    <span class="mr-2">👥</span>
                    Clients
                  </router-link>
                </PermissionGuard>

                <!-- Exemplo com wildcard -->
                <PermissionGuard permission="users.*">
                  <router-link
                    to="/users"
                    class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600"
                    active-class="bg-blue-100 text-blue-700"
                  >
                    <span class="mr-2">👤</span>
                    Users
                  </router-link>
                </PermissionGuard>
              </div>
            </div>

            <!-- User Menu -->
            <div class="hidden md:block">
              <div class="ml-4 flex items-center md:ml-6">
                <!-- Profile dropdown -->
                <div class="ml-3 relative">
                  <div class="flex items-center space-x-4">
                    <div class="flex items-center space-x-2 text-gray-600">
                      <div
                        class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"
                      >
                        <span class="text-blue-600 font-medium text-sm">
                          {{ userInitial }}
                        </span>
                      </div>
                      <span class="text-sm font-medium">{{ userName }}</span>
                    </div>
                    <button
                      @click="logout"
                      class="flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-all duration-200"
                    >
                      <span class="mr-2">🚪</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mobile menu button -->
            <div class="md:hidden">
              <button
                @click="mobileMenuOpen = !mobileMenuOpen"
                class="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <span class="sr-only">Abrir menu principal</span>
                <svg
                  :class="{ hidden: mobileMenuOpen, block: !mobileMenuOpen }"
                  class="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                <svg
                  :class="{ block: mobileMenuOpen, hidden: !mobileMenuOpen }"
                  class="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile menu -->
        <div
          :class="{ block: mobileMenuOpen, hidden: !mobileMenuOpen }"
          class="md:hidden"
        >
          <div
            class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 border-t border-gray-200"
          >
            <router-link
              to="/"
              class="flex items-center px-3 py-2 rounded-md text-base font-medium transition-all duration-200 hover:bg-blue-50 hover:text-blue-600"
              active-class="bg-blue-100 text-blue-700"
              exact
              @click="mobileMenuOpen = false"
            >
              <span class="mr-3">🏠</span>
              Home
            </router-link>

            <router-link
              to="/about"
              class="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600"
              active-class="bg-blue-100 text-blue-700"
              @click="mobileMenuOpen = false"
            >
              <span class="mr-3">ℹ️</span>
              About
            </router-link>

            <!-- Mobile Permission Guards -->
            <PermissionGuard permission="clients.viewAny">
              <router-link
                to="/clients"
                class="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600"
                active-class="bg-blue-100 text-blue-700"
                @click="mobileMenuOpen = false"
              >
                <span class="mr-3">👥</span>
                Clients
              </router-link>
            </PermissionGuard>

            <PermissionGuard permission="users.*">
              <router-link
                to="/users"
                class="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600"
                active-class="bg-blue-100 text-blue-700"
                @click="mobileMenuOpen = false"
              >
                <span class="mr-3">👤</span>
                Users
              </router-link>
            </PermissionGuard>

            <!-- User info in mobile -->
            <div class="border-t border-gray-200 pt-4 pb-3">
              <div class="flex items-center px-3">
                <div
                  class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"
                >
                  <span class="text-blue-600 font-medium">{{
                    userInitial
                  }}</span>
                </div>
                <div class="ml-3">
                  <div class="text-base font-medium text-gray-800">
                    {{ userName }}
                  </div>
                  <div class="text-sm font-medium text-gray-500">
                    {{ userEmail }}
                  </div>
                </div>
              </div>
              <div class="mt-3 px-2 space-y-1">
                <button
                  @click="logout"
                  class="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                  <span class="mr-3">🚪</span>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="flex-1">
        <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div class="px-4 py-6 sm:px-0">
            <router-view />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import api from "@/services/api";
import PermissionGuard from "@/components/PermissionGuard.vue";
import { clearAuthCache } from "@/services/auth";

export default {
  name: "AppLayout",
  components: {
    PermissionGuard,
  },
  data() {
    return {
      isAuthenticated: false,
      loadingAuth: true,
      mobileMenuOpen: false,
      user: null,
    };
  },
  computed: {
    userName() {
      return this.user?.name;
    },
    userEmail() {
      return this.user?.email;
    },
    userInitial() {
      return this.userName.charAt(0).toUpperCase();
    },
  },
  async created() {
    await this.checkAuth();
  },
  watch: {
    $route() {
      this.checkAuth();
      this.mobileMenuOpen = false;
    },
  },
  methods: {
    async checkAuth() {
      this.loadingAuth = true;
      try {
        const response = await api.get("/auth/user");
        this.isAuthenticated = true;
        this.user = response.data.data?.user || null;
      } catch (error) {
        this.isAuthenticated = false;
        this.user = null;
        clearAuthCache();
      } finally {
        this.loadingAuth = false;
      }
    },
    async logout() {
      try {
        await api.post("/auth/logout");
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        this.isAuthenticated = false;
        this.user = null;
        clearAuthCache();
        this.$router.push("/login");
      }
    },
  },
};
</script>

<style scoped>
.router-link-active {
  @apply bg-blue-100 text-blue-700;
}

.hover\:bg-blue-50:hover {
  background-color: rgb(239 246 255);
}

@media (max-width: 768px) {
  .max-w-7xl {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
