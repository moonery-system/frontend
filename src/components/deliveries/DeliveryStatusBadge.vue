<template>
  <span
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    :class="tone.badge"
    :title="status.label"
  >
    <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="tone.dot"></span>
    {{ humanizeStatus(status.name) }}
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { DeliveryStatus } from "@/types/api";
import { humanizeStatus } from "@/utils/status";

const props = defineProps<{ status: DeliveryStatus }>();

// Classes are written out in full on purpose: Tailwind scans the source for
// literal class names, so strings built at runtime would be purged away.
const palette: Record<string, { badge: string; dot: string }> = {
  pending: { badge: "bg-gray-100 text-gray-800", dot: "bg-gray-400" },
  attached: { badge: "bg-blue-100 text-blue-800", dot: "bg-blue-500" },
  picked_up: { badge: "bg-indigo-100 text-indigo-800", dot: "bg-indigo-500" },
  in_transit: { badge: "bg-amber-100 text-amber-800", dot: "bg-amber-500" },
  delivered: { badge: "bg-green-100 text-green-800", dot: "bg-green-500" },
  client_address_not_found: {
    badge: "bg-orange-100 text-orange-800",
    dot: "bg-orange-500",
  },
  client_not_found: {
    badge: "bg-orange-100 text-orange-800",
    dot: "bg-orange-500",
  },
  canceled_by_client: { badge: "bg-red-100 text-red-800", dot: "bg-red-500" },
  canceled_by_admin: { badge: "bg-red-100 text-red-800", dot: "bg-red-500" },
  return_to_sender: {
    badge: "bg-purple-100 text-purple-800",
    dot: "bg-purple-500",
  },
};

const tone = computed(
  () =>
    palette[props.status?.name] ?? {
      badge: "bg-gray-100 text-gray-800",
      dot: "bg-gray-400",
    }
);
</script>
