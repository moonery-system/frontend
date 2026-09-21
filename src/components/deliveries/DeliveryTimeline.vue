<template>
  <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
    <h2 class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-5">
      Status history
    </h2>

    <p v-if="!history.length" class="text-sm text-gray-400">
      No status recorded yet.
    </p>

    <ol v-else class="relative border-l border-gray-200 ml-2">
      <li
        v-for="(entry, index) in history"
        :key="entry.id"
        class="ml-6"
        :class="index === history.length - 1 ? '' : 'pb-6'"
      >
        <span
          class="absolute -left-1.5 w-3 h-3 rounded-full border-2 border-white"
          :class="index === history.length - 1 ? 'bg-blue-500' : 'bg-gray-300'"
        ></span>

        <DeliveryStatusBadge :status="entry.status" />

        <p class="mt-1.5 text-sm text-gray-500">
          {{ formatDateTime(entry.created_at) }}
          <span v-if="entry.user"> · by {{ entry.user.name }}</span>
        </p>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import type { DeliveryStatusHistoryEntry } from "@/types/api";
import DeliveryStatusBadge from "@/components/deliveries/DeliveryStatusBadge.vue";
import { formatDateTime } from "@/utils/date";

defineProps<{ history: DeliveryStatusHistoryEntry[] }>();
</script>
