<template>
  <div class="min-h-screen bg-ink-950">
    <!-- First session check: the brand mark breathes instead of a spinner -->
    <div
      v-if="booting"
      class="min-h-screen grid place-items-center bg-ink-900"
      role="status"
      aria-label="Starting Moonery"
    >
      <img
        :src="logoMark"
        alt=""
        class="h-20 w-20 animate-pulse select-none"
        draggable="false"
      />
    </div>

    <template v-else>
      <!-- Guest pages (login, invite) own the whole screen -->
      <router-view v-if="!isAuthenticated" :key="$route.fullPath" />

      <template v-else>
        <!-- Drawer backdrop, mobile only -->
        <transition
          enter-active-class="transition-opacity duration-300"
          leave-active-class="transition-opacity duration-300"
          enter-from-class="opacity-0"
          leave-to-class="opacity-0"
        >
          <div
            v-if="drawerOpen"
            class="fixed inset-0 z-40 bg-ink-950/70 backdrop-blur-sm lg:hidden"
            @click="drawerOpen = false"
          />
        </transition>

        <!-- Sidebar: fixed on lg+, slide-in drawer below -->
        <aside
          id="app-sidebar"
          class="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-cream/10 bg-ink-900 transition-transform duration-300 ease-out lg:translate-x-0"
          :class="drawerOpen ? 'translate-x-0' : '-translate-x-full'"
          aria-label="Main navigation"
        >
          <div class="relative flex flex-col items-center px-6 pb-2 pt-7">
            <img
              :src="logoFull"
              alt="Moonery"
              class="h-28 w-28 select-none"
              draggable="false"
            />
            <button
              type="button"
              class="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-lg text-cream/60 transition-colors duration-200 hover:bg-cream/[0.06] hover:text-cream lg:hidden"
              aria-label="Close menu"
              @click="drawerOpen = false"
            >
              <AppIcon name="x" />
            </button>
          </div>

          <nav class="mt-6 flex-1 space-y-1 overflow-y-auto px-4">
            <p class="eyebrow px-3 pb-2">Operations</p>
            <SidebarLink to="/" label="Overview" icon="home" exact />
            <PermissionGuard permission="deliveries.viewAny">
              <SidebarLink to="/deliveries" label="Deliveries" icon="package" />
            </PermissionGuard>
            <PermissionGuard permission="chat.viewAll">
              <SidebarLink to="/support" label="Support desk" icon="headset" />
            </PermissionGuard>

            <PermissionGuard :permissions="['clients.viewAny', 'users.*']">
              <p class="eyebrow px-3 pb-2 pt-7">Registry</p>
            </PermissionGuard>
            <PermissionGuard permission="clients.viewAny">
              <SidebarLink to="/clients" label="Clients" icon="users" />
            </PermissionGuard>
            <PermissionGuard permission="users.*">
              <SidebarLink to="/users" label="Team" icon="user" />
            </PermissionGuard>
          </nav>

          <div class="border-t border-cream/10 p-4">
            <div class="flex items-center gap-3 rounded-lg px-2 py-2">
              <div
                class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold-400/15 font-display text-sm font-bold text-gold-400"
              >
                {{ userInitial }}
              </div>
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-cream">
                  {{ userName }}
                </p>
                <p class="truncate text-xs text-cream/50">{{ userEmail }}</p>
              </div>
            </div>
            <button
              type="button"
              class="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-semibold text-cream/60 transition-colors duration-200 hover:bg-rust-500/10 hover:text-rust-400 active:bg-rust-500/15"
              @click="logout"
            >
              <AppIcon name="logout" class="shrink-0" />
              Sign out
            </button>
          </div>
        </aside>

        <div class="lg:pl-72">
          <!-- Slim top strip: hamburger + mark on mobile, bell everywhere -->
          <header
            class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-cream/[0.06] bg-ink-950/80 px-4 backdrop-blur sm:px-8 lg:justify-end lg:px-14 xl:px-20"
          >
            <div class="flex items-center gap-3 lg:hidden">
              <button
                type="button"
                class="grid h-10 w-10 place-items-center rounded-lg text-cream/75 transition-colors duration-200 hover:bg-cream/[0.06] hover:text-cream active:bg-cream/[0.09]"
                aria-controls="app-sidebar"
                :aria-expanded="drawerOpen"
                aria-label="Open menu"
                @click="drawerOpen = true"
              >
                <AppIcon name="menu" :size="20" />
              </button>
              <img :src="logoMark" alt="Moonery" class="h-8 w-8 rounded-lg" />
            </div>
            <NotificationBell />
          </header>

          <main
            class="px-4 pb-24 pt-8 sm:px-8 sm:pt-10 lg:px-14 lg:pt-14 xl:px-20"
          >
            <div class="mx-auto max-w-6xl">
              <router-view :key="$route.fullPath" />
            </div>
          </main>
        </div>

        <NotificationToast />
        <ChatWidget />
      </template>
    </template>
  </div>
</template>

<script>
import api from "@/services/api";
import AppIcon from "@/components/ui/AppIcon.vue";
import SidebarLink from "@/components/layout/SidebarLink.vue";
import PermissionGuard from "@/components/PermissionGuard.vue";
import NotificationBell from "@/components/NotificationBell.vue";
import NotificationToast from "@/components/NotificationToast.vue";
import ChatWidget from "@/components/chat/ChatWidget.vue";
import { clearAuthCache, getUserData } from "@/services/auth";
import {
  connect as connectWebSocket,
  disconnect as disconnectWebSocket,
} from "@/services/websocket";
import logoFull from "@/assets/logo-full.png";
import logoMark from "@/assets/logo-mark.png";

export default {
  name: "AppShell",
  components: {
    AppIcon,
    SidebarLink,
    PermissionGuard,
    NotificationBell,
    NotificationToast,
    ChatWidget,
  },
  data() {
    return {
      isAuthenticated: false,
      // Only true until the first session check resolves. Later navigations
      // re-check quietly so the shell does not unmount under the user.
      booting: true,
      drawerOpen: false,
      user: null,
      logoFull,
      logoMark,
    };
  },
  computed: {
    userName() {
      return this.user?.name ?? "";
    },
    userEmail() {
      return this.user?.email ?? "";
    },
    userInitial() {
      return this.userName.charAt(0).toUpperCase();
    },
  },
  async created() {
    await this.checkAuth();
  },
  mounted() {
    window.addEventListener("keydown", this.onKeydown);
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.onKeydown);
  },
  watch: {
    $route() {
      this.checkAuth();
      this.drawerOpen = false;
    },
    drawerOpen(open) {
      document.body.style.overflow = open ? "hidden" : "";
    },
  },
  methods: {
    onKeydown(event) {
      if (event.key === "Escape") this.drawerOpen = false;
    },
    async checkAuth() {
      try {
        // Shares the cache with the router guard: before this, every navigation made
        // two calls to /auth/user.
        const authData = await getUserData();

        if (!authData) throw new Error("not authenticated");

        this.isAuthenticated = true;
        this.user = authData.user || null;
        connectWebSocket();
      } catch (error) {
        this.isAuthenticated = false;
        this.user = null;
        clearAuthCache();
        disconnectWebSocket();
      } finally {
        this.booting = false;
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
        disconnectWebSocket();
        this.$router.push("/login");
      }
    },
  },
};
</script>
