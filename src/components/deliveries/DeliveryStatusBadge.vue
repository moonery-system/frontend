<template>
  <span
    class="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold leading-none ring-1 ring-inset ring-cream/10"
    :class="tone.badge"
    :title="status.label"
  >
    <span class="mr-1.5 h-1.5 w-1.5 rounded-full" :class="tone.dot"></span>
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
  pending: { badge: "bg-cream/[0.06] text-cream/85", dot: "bg-cream/45" },
  attached: { badge: "bg-gold-400/15 text-gold-300", dot: "bg-gold-400" },
  picked_up: { badge: "bg-ember-500/10 text-ember-300", dot: "bg-ember-300" },
  in_transit: { badge: "bg-ember-500/15 text-ember-400", dot: "bg-ember-500" },
  delivered: { badge: "bg-moss-500/15 text-moss-400", dot: "bg-moss-500" },
  client_address_not_found: {
    badge: "bg-gold-500/15 text-gold-300",
    dot: "bg-rust-400",
  },
  client_not_found: {
    badge: "bg-gold-500/15 text-gold-300",
    dot: "bg-rust-400",
  },
  canceled_by_client: {
    badge: "bg-rust-500/15 text-rust-400",
    dot: "bg-rust-500",
  },
  canceled_by_admin: {
    badge: "bg-rust-500/15 text-rust-400",
    dot: "bg-rust-500",
  },
  canceled_by_support: {
    badge: "bg-rust-500/15 text-rust-400",
    dot: "bg-rust-500",
  },
  return_to_sender: {
    badge: "bg-cream/[0.06] text-cream/85",
    dot: "bg-gold-400",
  },
};

const tone = computed(
  () =>
    palette[props.status?.name] ?? {
      badge: "bg-cream/[0.06] text-cream/85",
      dot: "bg-cream/45",
    }
);
</script>
