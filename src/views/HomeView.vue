<template>
  <div class="animate-rise">
    <PageHeader
      :eyebrow="today"
      :title="`${greeting}, ${firstName}`"
      lead="Here is what is moving right now, and the quickest ways to get something done."
    />

    <div class="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
      <!-- Latest deliveries -->
      <section class="surface overflow-hidden">
        <div
          class="flex items-center justify-between border-b border-cream/10 px-6 py-5"
        >
          <div>
            <h2
              class="font-display text-lg font-bold tracking-tight text-cream"
            >
              Latest deliveries
            </h2>
            <p class="mt-0.5 text-sm text-cream/55">
              {{ total }} in total on your account
            </p>
          </div>
          <router-link
            v-if="canSeeDeliveries"
            to="/deliveries"
            class="inline-flex items-center gap-1.5 text-sm font-semibold text-ember-400 transition-colors duration-200 hover:text-ember-300"
          >
            View all
            <AppIcon name="arrow-right" :size="15" />
          </router-link>
        </div>

        <div
          v-if="loading || !booted"
          class="divide-y divide-cream/10"
          aria-busy="true"
        >
          <div
            v-for="n in 4"
            :key="n"
            class="flex items-center justify-between px-6 py-5"
          >
            <div class="space-y-2">
              <div class="skeleton h-4 w-36"></div>
              <div class="skeleton h-3 w-24"></div>
            </div>
            <div class="skeleton h-6 w-20"></div>
          </div>
        </div>

        <ul v-else-if="deliveries.length" class="divide-y divide-cream/10">
          <li v-for="delivery in deliveries" :key="delivery.id">
            <router-link
              :to="`/deliveries/${delivery.id}`"
              class="flex items-center justify-between gap-4 px-6 py-5 transition-colors duration-200 hover:bg-cream/[0.03] active:bg-cream/[0.05]"
            >
              <div class="min-w-0">
                <p class="font-mono text-sm font-medium text-gold-400">
                  {{ delivery.tracking_code ?? `#${delivery.id}` }}
                </p>
                <p class="mt-1 truncate text-sm text-cream/60">
                  {{ delivery.client?.name ?? "Unknown recipient" }}
                </p>
              </div>
              <DeliveryStatusBadge :status="delivery.status" />
            </router-link>
          </li>
        </ul>

        <EmptyState
          v-else
          icon="truck"
          title="No parcels on the road yet"
          text="Once a delivery is created it appears here with its current status, ready to follow."
        />
      </section>

      <!-- Shortcuts -->
      <aside class="space-y-3 lg:pt-10">
        <p class="eyebrow px-1">Shortcuts</p>

        <PermissionGuard permission="deliveries.create" :show-fallback="false">
          <router-link to="/deliveries/create" class="shortcut">
            <AppIcon name="plus" :size="18" class="text-gold-400" />
            <span>
              <strong>Create a delivery</strong>
              <small>Pick a recipient, an address and the items.</small>
            </span>
          </router-link>
        </PermissionGuard>

        <PermissionGuard permission="deliveries.viewAny" :show-fallback="false">
          <router-link to="/deliveries" class="shortcut">
            <AppIcon name="package" :size="18" class="text-gold-400" />
            <span>
              <strong>Browse deliveries</strong>
              <small>Search by tracking code or recipient.</small>
            </span>
          </router-link>
        </PermissionGuard>

        <PermissionGuard permission="chat.viewAll" :show-fallback="false">
          <router-link to="/support" class="shortcut">
            <AppIcon name="headset" :size="18" class="text-gold-400" />
            <span>
              <strong>Open the support desk</strong>
              <small>Answer people who are waiting on a reply.</small>
            </span>
          </router-link>
        </PermissionGuard>

        <div class="shortcut cursor-default hover:bg-transparent">
          <AppIcon name="message" :size="18" class="text-gold-400" />
          <span>
            <strong>Need a hand?</strong>
            <small
              >The chat button, bottom corner, reaches the support desk.</small
            >
          </span>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import PageHeader from "@/components/layout/PageHeader.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import PermissionGuard from "@/components/PermissionGuard.vue";
import DeliveryStatusBadge from "@/components/deliveries/DeliveryStatusBadge.vue";
import { usePaginatedFetch } from "@/types/api";
import type { Delivery } from "@/types/api";
import { getCurrentUser, hasPermission } from "@/services/auth";

const {
  data: deliveries,
  total,
  perPage,
  loading,
  fetch: loadDeliveries,
} = usePaginatedFetch<Delivery>("/deliveries");

const canSeeDeliveries = ref(false);
const booted = ref(false);
const firstName = ref("");

const hour = new Date().getHours();
const greeting =
  hour < 5
    ? "Working late"
    : hour < 12
    ? "Good morning"
    : hour < 18
    ? "Good afternoon"
    : "Good evening";

const today = computed(() =>
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
);

onMounted(async () => {
  firstName.value = (getCurrentUser()?.name ?? "").split(" ")[0];
  canSeeDeliveries.value = await hasPermission("deliveries.viewAny");

  if (canSeeDeliveries.value) {
    perPage.value = 5;
    await loadDeliveries();
  }

  booted.value = true;
});
</script>

<style scoped>
.shortcut {
  @apply flex items-start gap-4 rounded-xl border border-cream/10 bg-ink-800/60 p-4 transition-colors duration-200 hover:bg-cream/[0.05] active:bg-cream/[0.08];
}
.shortcut strong {
  @apply block text-sm font-semibold text-cream;
}
.shortcut small {
  @apply mt-0.5 block text-[13px] leading-5 text-cream/55;
}
.shortcut > svg {
  @apply mt-0.5 shrink-0;
}
</style>
