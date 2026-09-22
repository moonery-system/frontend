<template>
  <div class="fixed bottom-4 right-4 z-50 space-y-2 w-80">
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="bg-white rounded-xl border border-gray-200 shadow-lg p-4"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-sm font-medium text-gray-900">{{ toast.title }}</p>
            <p v-if="toast.description" class="mt-1 text-xs text-gray-500">
              {{ toast.description }}
            </p>
          </div>
          <button
            type="button"
            @click="dismiss(toast.id)"
            class="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            &times;
          </button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { onNotification } from "@/services/websocket";

interface Toast {
  id: number;
  title: string;
  description?: string;
}

const toasts = ref<Toast[]>([]);
let nextId = 1;
let unsubscribe: (() => void) | null = null;

function dismiss(id: number) {
  toasts.value = toasts.value.filter((toast) => toast.id !== id);
}

onMounted(() => {
  unsubscribe = onNotification((payload) => {
    if (payload.type !== "notification" || !payload.title) return;

    const id = nextId++;
    toasts.value = [
      ...toasts.value,
      { id, title: payload.title, description: payload.description },
    ];

    setTimeout(() => dismiss(id), 8000);
  });
});

onUnmounted(() => unsubscribe?.());
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
