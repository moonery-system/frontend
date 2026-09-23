<template>
  <div class="surface">
    <div class="p-6">
      <div class="flex items-start justify-between">
        <div>
          <p class="font-mono text-sm text-cream/65">
            {{ delivery.tracking_code ?? `#${delivery.id}` }}
          </p>
          <div class="mt-2">
            <DeliveryStatusBadge :status="delivery.status" />
          </div>
        </div>

        <div class="text-right text-sm text-cream/65">
          <p>Created {{ formatDateTime(delivery.created_at) }}</p>
          <p v-if="delivery.delivered_at">
            Delivered {{ formatDateTime(delivery.delivered_at) }}
          </p>
        </div>
      </div>

      <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <div>
            <label
              class="text-[11px] font-semibold uppercase tracking-[0.12em] text-cream/50"
            >
              Client
            </label>
            <p class="mt-1 text-cream">
              {{ delivery.client?.name ?? "—" }}
            </p>
            <p v-if="delivery.client" class="text-sm text-cream/65">
              {{ delivery.client.email }}
            </p>
          </div>

          <div>
            <label
              class="text-[11px] font-semibold uppercase tracking-[0.12em] text-cream/50"
            >
              Delivery man
            </label>
            <p class="mt-1 text-cream">
              {{ delivery.deliveryman?.name ?? "Not assigned yet" }}
            </p>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label
              class="text-[11px] font-semibold uppercase tracking-[0.12em] text-cream/50"
            >
              Address
            </label>
            <p v-if="delivery.address" class="mt-1 text-cream text-sm">
              {{ delivery.address.address_line }},
              {{ delivery.address.neighborhood }}<br />
              {{ delivery.address.city }}/{{ delivery.address.state }} —
              {{ delivery.address.zip_code }}
              <template v-if="delivery.address.complement">
                <br />{{ delivery.address.complement }}
              </template>
            </p>
            <p v-else class="mt-1 text-cream/55 text-sm">—</p>
          </div>
        </div>
      </div>

      <div class="mt-6 pt-5 border-t border-cream/10">
        <label
          class="text-[11px] font-semibold uppercase tracking-[0.12em] text-cream/50"
        >
          Items
        </label>

        <ul class="mt-2 divide-y divide-cream/10">
          <li
            v-for="item in delivery.items ?? []"
            :key="item.id"
            class="py-2 flex items-center justify-between text-sm"
          >
            <div>
              <p class="text-cream">{{ item.name }}</p>
              <p v-if="item.description" class="text-cream/65 text-xs">
                {{ item.description }}
              </p>
            </div>
            <span class="text-cream/65">
              {{ item.quantity }}x · {{ Number(item.weight).toFixed(2) }} kg
            </span>
          </li>
        </ul>

        <p class="mt-2 text-xs text-cream/55">
          Total weight: {{ totalWeight.toFixed(2) }} kg
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Delivery } from "@/types/api";
import DeliveryStatusBadge from "@/components/deliveries/DeliveryStatusBadge.vue";
import { formatDateTime } from "@/utils/date";

const props = defineProps<{ delivery: Delivery }>();

// weight is decimal(10,2) and arrives as a string -- Number() before adding,
// otherwise the total comes out concatenated.
const totalWeight = computed(() =>
  (props.delivery.items ?? []).reduce(
    (sum, item) => sum + Number(item.weight) * Number(item.quantity),
    0
  )
);
</script>
