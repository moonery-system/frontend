<template>
  <div class="relative">
    <button
      type="button"
      @click="toggle"
      class="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition"
      title="Notifications"
    >
      <span class="text-lg">🔔</span>
      <span
        v-if="unread > 0"
        class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-medium flex items-center justify-center"
      >
        {{ unread > 99 ? "99+" : unread }}
      </span>
    </button>

    <div
      v-if="open"
      class="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-xl border border-gray-200 shadow-xl z-50"
    >
      <div
        class="px-4 py-3 border-b border-gray-100 flex items-center justify-between"
      >
        <span class="text-sm font-medium text-gray-900">Notifications</span>
        <span class="text-xs text-gray-400">{{ unread }} unread</span>
      </div>

      <p v-if="loading" class="px-4 py-6 text-sm text-gray-400 text-center">
        Loading...
      </p>

      <p
        v-else-if="!notifications.length"
        class="px-4 py-6 text-sm text-gray-400 text-center"
      >
        Nothing here yet.
      </p>

      <ul v-else class="divide-y divide-gray-100">
        <li
          v-for="notification in notifications"
          :key="notification.id"
          class="px-4 py-3"
          :class="notification.read_at ? 'bg-white' : 'bg-blue-50'"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="text-sm text-gray-900">{{ notification.title }}</p>
              <p
                v-if="notification.description"
                class="mt-0.5 text-xs text-gray-500"
              >
                {{ notification.description }}
              </p>
              <p class="mt-1 text-[11px] text-gray-400">
                {{ formatDateTime(notification.created_at) }}
              </p>
            </div>

            <button
              v-if="!notification.read_at"
              type="button"
              @click="markAsRead(notification)"
              class="text-xs font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap"
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
