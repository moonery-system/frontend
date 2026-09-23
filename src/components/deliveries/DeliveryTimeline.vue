<template>
  <div class="surface p-6">
    <h2
      class="text-[11px] font-semibold uppercase tracking-[0.12em] text-cream/50 mb-5"
    >
      Status history
    </h2>

    <p v-if="!history.length" class="text-sm text-cream/55">
      No status recorded yet.
    </p>

    <ol v-else class="relative border-l border-cream/[0.14] ml-2">
      <li
        v-for="(entry, index) in history"
        :key="entry.id"
        class="ml-6"
        :class="index === history.length - 1 ? '' : 'pb-6'"
      >
        <span
          class="absolute -left-1.5 w-3 h-3 rounded-full border-2 border-ink-800"
          :class="index === history.length - 1 ? 'bg-ember-500' : 'bg-cream/20'"
        ></span>

        <DeliveryStatusBadge :status="entry.status" />

        <p class="mt-1.5 text-sm text-cream/65">
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
