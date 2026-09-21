<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-5xl mx-auto px-4 py-8">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-light text-gray-900 tracking-tight">
            Deliveries
          </h1>
          <p class="text-sm text-gray-500 mt-1">
            Track and move packages through the flow
          </p>
        </div>

        <PermissionGuard permission="deliveries.create">
          <CreateButton text="Create Delivery" redirect="deliveries" />
        </PermissionGuard>
      </div>

      <!-- abas so para quem pode pegar entrega -->
      <div v-if="showTabs" class="mb-6 flex gap-1 border-b border-gray-200">
        <button
          v-for="option in tabs"
          :key="option.key"
          type="button"
          @click="tab = option.key"
          class="px-4 py-2 text-sm font-medium border-b-2 -mb-px transition"
          :class="
            tab === option.key
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          "
        >
          {{ option.label }}
        </button>
      </div>

      <div class="mb-6">
        <input
          v-model="searchQuery"
          @input="debouncedSearch"
          type="text"
          placeholder="Search by tracking code or client name..."
          class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all duration-200 text-sm text-gray-700"
        />
      </div>

      <LoadingAnimation :loading="loading" />

      <div v-if="visible.length > 0" class="space-y-3">
        <div
          v-for="delivery in visible"
          :key="delivery.id"
          class="bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-sm"
        >
          <div class="p-6 flex items-center justify-between">
            <div class="min-w-0">
              <div class="flex items-center gap-3">
                <p class="font-mono text-sm text-gray-500">
                  {{ delivery.tracking_code ?? `#${delivery.id}` }}
                </p>
                <DeliveryStatusBadge :status="delivery.status" />
              </div>

              <p class="mt-2 text-gray-900 font-medium">
                {{ delivery.client?.name ?? "—" }}
              </p>
              <p class="text-sm text-gray-500">
                {{ delivery.items?.length ?? 0 }} item(s) ·
                {{
                  delivery.delivery_man_id
                    ? delivery.deliveryman?.name ?? "assigned"
                    : "unassigned"
                }}
              </p>
            </div>

            <ViewButton :id="delivery.id" redirect="deliveries" />
          </div>
        </div>
      </div>

      <p v-else-if="!loading" class="text-sm text-gray-400 py-10 text-center">
        No delivery here.
      </p>

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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import PermissionGuard from "@/components/PermissionGuard.vue";
import CreateButton from "@/components/buttons/CreateButton.vue";
import ViewButton from "@/components/buttons/ViewButton.vue";
import PaginationItems from "@/components/PaginationItems.vue";
import LoadingAnimation from "@/components/LoadingAnimation.vue";
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
