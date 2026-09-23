<template>
  <div class="relative">
    <button
      type="button"
      @click="toggle"
      class="relative grid h-10 w-10 place-items-center rounded-lg text-cream/70 transition-colors duration-200 hover:bg-cream/[0.06] hover:text-cream active:bg-cream/[0.09]"
      :class="open ? 'bg-cream/[0.06] text-cream' : ''"
      title="Notifications"
      aria-label="Notifications"
    >
      <AppIcon name="bell" :size="20" />
      <span
        v-if="unread > 0"
        class="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ember-500 px-1 text-[10px] font-bold text-ink-950 ring-2 ring-ink-950"
      >
        {{ unread > 99 ? "99+" : unread }}
      </span>
    </button>

    <div
      v-if="open"
      class="absolute right-0 z-50 mt-2 max-h-[26rem] w-[20rem] max-w-[calc(100vw-2rem)] animate-rise overflow-y-auto rounded-xl border border-cream/[0.14] bg-ink-800 shadow-float sm:w-96"
    >
      <div
        class="px-4 py-3 border-b border-cream/10 flex items-center justify-between"
      >
        <span class="font-display text-sm font-bold text-cream"
          >Notifications</span
        >
        <span class="text-xs text-cream/55">{{
          unread ? `${unread} unread` : "All caught up"
        }}</span>
      </div>

      <div v-if="loading" class="space-y-4 px-4 py-4" aria-busy="true">
        <div v-for="n in 3" :key="n" class="space-y-2">
          <div class="skeleton h-3.5 w-2/3"></div>
          <div class="skeleton h-3 w-full"></div>
        </div>
      </div>

      <div v-else-if="!notifications.length" class="px-6 py-10 text-center">
        <AppIcon name="bell" :size="22" class="mx-auto text-cream/30" />
        <p class="mt-3 text-sm font-semibold text-cream/85">
          No alerts on the road
        </p>
        <p class="mt-1 text-xs leading-5 text-cream/50">
          Status changes on your deliveries will show up here as they happen.
        </p>
      </div>

      <ul v-else class="divide-y divide-cream/10">
        <li
          v-for="notification in notifications"
          :key="notification.id"
          class="px-4 py-3 transition-colors duration-200"
          :class="notification.read_at ? 'bg-ink-800' : 'bg-ember-500/[0.07]'"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="text-sm text-cream">{{ notification.title }}</p>
              <p
                v-if="notification.description"
                class="mt-0.5 text-xs text-cream/65"
              >
                {{ notification.description }}
              </p>
              <p class="mt-1 text-[11px] text-cream/55">
                {{ formatDateTime(notification.created_at) }}
              </p>
            </div>

            <button
              v-if="!notification.read_at"
              type="button"
              @click="markAsRead(notification)"
              class="text-xs font-medium text-ember-400 transition-colors duration-200 hover:text-ember-300 whitespace-nowrap"
            >
              Mark read
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import api from "@/services/api";
import AppIcon from "@/components/ui/AppIcon.vue";
import { formatDateTime } from "@/utils/date";
import { onNotification } from "@/services/websocket";

interface NotificationRow {
  id: number;
  title: string;
  description: string | null;
  created_at: string;
  read_at: string | null;
}

const open = ref(false);
const loading = ref(false);
const unread = ref(0);
const notifications = ref<NotificationRow[]>([]);
let unsubscribe: (() => void) | null = null;

async function loadUnread() {
  try {
    const response = await api.get("/notifications/unread-count");
    unread.value = response.data.data.unread;
  } catch (err) {
    unread.value = 0;
  }
}

async function loadNotifications() {
  loading.value = true;

  try {
    const response = await api.get("/notifications", {
      params: { per_page: 10 },
    });
    notifications.value = response.data.data.data;
  } finally {
    loading.value = false;
  }
}

function toggle() {
  open.value = !open.value;
  if (open.value) loadNotifications();
}

async function markAsRead(notification: NotificationRow) {
  try {
    await api.put(`/notifications/${notification.id}/read`);
    notification.read_at = new Date().toISOString();
    unread.value = Math.max(0, unread.value - 1);
  } catch (err) {
    // sem alterar o estado local se o servidor recusou
  }
}

onMounted(() => {
  loadUnread();

  unsubscribe = onNotification((payload) => {
    if (payload.type !== "notification") return;

    unread.value += 1;
    if (open.value) loadNotifications();
  });
});

onUnmounted(() => unsubscribe?.());
</script>
