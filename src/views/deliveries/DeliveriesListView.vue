<template>
  <div class="animate-rise">
    <PageHeader
      eyebrow="Dispatch"
      title="Deliveries"
      lead="Every parcel and where it stands. Open one to move it along, reassign it or read its full trail."
    >
      <PermissionGuard permission="deliveries.create">
        <CreateButton text="New delivery" redirect="deliveries" />
      </PermissionGuard>
    </PageHeader>

    <!-- Tabs only for people who can pick up a delivery -->
    <div v-if="showTabs" class="mb-6 flex gap-1 border-b border-cream/10">
      <button
        v-for="option in tabs"
        :key="option.key"
        type="button"
        @click="tab = option.key"
        class="-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors duration-200"
        :class="
          tab === option.key
            ? 'border-ember-500 text-cream'
            : 'border-transparent text-cream/55 hover:text-cream/85'
        "
      >
        {{ option.label }}
      </button>
    </div>

    <div class="mb-6 max-w-md">
      <SearchInput
        v-model="searchQuery"
        placeholder="Tracking code or client name"
        @input="debouncedSearch"
      />
    </div>

    <ListSkeleton v-if="loading" />

    <div
      v-else-if="visible.length > 0"
      class="surface divide-y divide-cream/10 overflow-hidden"
    >
      <div
        v-for="delivery in visible"
        :key="delivery.id"
        class="flex flex-wrap items-center justify-between gap-4 px-5 py-5 transition-colors duration-200 hover:bg-cream/[0.03] sm:px-6"
      >
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-3">
            <p
              class="font-mono text-sm font-medium tracking-tight text-gold-400"
            >
              {{ delivery.tracking_code ?? `#${delivery.id}` }}
            </p>
            <DeliveryStatusBadge :status="delivery.status" />
          </div>

          <p class="mt-2.5 font-semibold text-cream">
            {{ delivery.client?.name ?? "Unknown recipient" }}
          </p>
          <p class="mt-0.5 text-sm text-cream/55">
            {{ delivery.items?.length ?? 0 }}
            {{ (delivery.items?.length ?? 0) === 1 ? "item" : "items" }}
            <span class="mx-1.5 text-cream/25">/</span>
            {{
              delivery.delivery_man_id
                ? delivery.deliveryman?.name ?? "Driver assigned"
                : "Waiting for a driver"
            }}
          </p>
        </div>

        <ViewButton :id="delivery.id" redirect="deliveries" />
      </div>
    </div>

    <div v-else class="surface">
      <EmptyState icon="package" :title="emptyTitle" :text="emptyText" />
    </div>

    <PaginationItems
      :total="total"
      :current-page="currentPage"
      :per-page="perPage"
      :last-page="lastPage"
      :loading="loading"
      item-label="deliveries"
      @go-to-page="(page: number) => goToPage(page, { search: searchQuery })"
    />
  </div>
</template>

<script setup lang="ts">
import PageHeader from "@/components/layout/PageHeader.vue";
import SearchInput from "@/components/ui/SearchInput.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import ListSkeleton from "@/components/ui/ListSkeleton.vue";
import { computed, onMounted, ref } from "vue";
import PermissionGuard from "@/components/PermissionGuard.vue";
import CreateButton from "@/components/buttons/CreateButton.vue";
import ViewButton from "@/components/buttons/ViewButton.vue";
import PaginationItems from "@/components/PaginationItems.vue";
import DeliveryStatusBadge from "@/components/deliveries/DeliveryStatusBadge.vue";
import { usePaginatedFetch } from "@/types/api";
import type { Delivery } from "@/types/api";
import { getCurrentUser, hasPermission } from "@/services/auth";

const {
  data: deliveries,
  total,
  currentPage,
  lastPage,
  perPage,
  loading,
  fetch: loadDeliveries,
  goToPage,
} = usePaginatedFetch<Delivery>("/deliveries");

const searchQuery = ref("");
const showTabs = ref(false);
const tab = ref<"available" | "mine">("available");

const tabs = [
  { key: "available" as const, label: "Available" },
  { key: "mine" as const, label: "Mine" },
];

// A API devolve "as minhas + o pool livre" numa consulta so; as abas filtram aqui.
const visible = computed(() => {
  if (!showTabs.value) return deliveries.value;

  const myId = getCurrentUser()?.id ?? null;

  return deliveries.value.filter((delivery) =>
    tab.value === "mine"
      ? delivery.delivery_man_id === myId
      : delivery.delivery_man_id === null
  );
});

const emptyTitle = computed(() => {
  if (searchQuery.value) return "Nothing matches that search";
  if (showTabs.value && tab.value === "available") return "The pool is clear";
  if (showTabs.value) return "No parcels on your route";
  return "No deliveries yet";
});

const emptyText = computed(() => {
  if (searchQuery.value)
    return "Check the tracking code, or try the recipient's first name.";
  if (showTabs.value && tab.value === "available")
    return "New parcels appear here the moment they are created. Check back shortly.";
  if (showTabs.value)
    return "Pick one from the Available tab and it will show up here.";
  return "Deliveries you create or receive will be listed here with their full status trail.";
});

let searchTimeout: ReturnType<typeof setTimeout> | null = null;

function debouncedSearch() {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadDeliveries(1, { search: searchQuery.value });
  }, 300);
}

onMounted(async () => {
  showTabs.value = await hasPermission("deliveries.attach");
  loadDeliveries();
});
</script>
