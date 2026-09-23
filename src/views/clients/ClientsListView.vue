<template>
  <div class="animate-rise">
    <PageHeader
      eyebrow="Registry"
      title="Clients"
      lead="The people and businesses who receive your parcels. Each one signs in to follow their own deliveries."
    >
      <CreateButton text="New client" redirect="clients" />
    </PageHeader>

    <div class="mb-6 max-w-md">
      <SearchInput
        v-model="searchQuery"
        placeholder="Search by name or email"
        @input="debouncedSearch"
      />
    </div>

    <PermissionGuard
      :permissions="['clients.view', 'clients.viewAny']"
      :require-all="false"
    >
      <ListSkeleton v-if="loading" />

      <div
        v-else-if="clients.length > 0"
        class="surface divide-y divide-cream/10 overflow-hidden"
      >
        <div
          v-for="client in clients"
          :key="client.id"
          class="flex flex-wrap items-center justify-between gap-4 px-5 py-4 transition-colors duration-200 hover:bg-cream/[0.03] sm:px-6"
        >
          <div class="flex min-w-0 items-center gap-4">
            <div
              class="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gold-400/15 font-display text-sm font-bold text-gold-400"
            >
              {{ client.name.charAt(0).toUpperCase() }}
            </div>

            <div class="min-w-0">
              <h3 class="truncate font-semibold text-cream">
                {{ client.name }}
              </h3>
              <p class="truncate text-sm text-cream/55">
                {{ client.email }}
                <span class="mx-1.5 text-cream/25">/</span>
                <span class="font-mono text-xs">#{{ client.id }}</span>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <ViewButton :id="client.id" redirect="clients" />
            <EditButton :id="client.id" redirect="clients" />
            <DeleteButton
              :id="client.id"
              redirect="clients"
              :name="client.name"
              @deleted="handleItemDeleted"
            />
          </div>
        </div>
      </div>

      <div v-else class="surface">
        <EmptyState
          icon="users"
          :title="searchQuery ? 'No one matches that search' : 'No clients yet'"
          :text="
            searchQuery
              ? 'Try a shorter name, or search by the email address instead.'
              : 'Add the first person who will receive a parcel. They get an email invite to set their own password.'
          "
        >
          <PermissionGuard v-if="!searchQuery" permission="clients.create">
            <CreateButton text="Add first client" redirect="clients" />
          </PermissionGuard>
        </EmptyState>
      </div>

      <PaginationItems
        :total="totalClients"
        :currentPage="currentPage"
        :perPage="perPage"
        :lastPage="lastPage"
        :loading="loading"
        item-label="clients"
        @go-to-page="goToPage"
      />
    </PermissionGuard>
  </div>
</template>

<script setup lang="ts">
import PageHeader from "@/components/layout/PageHeader.vue";
import SearchInput from "@/components/ui/SearchInput.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import ListSkeleton from "@/components/ui/ListSkeleton.vue";
import { ref, onMounted } from "vue";
import PermissionGuard from "@/components/PermissionGuard.vue";
import ViewButton from "@/components/buttons/ViewButton.vue";
import EditButton from "@/components/buttons/EditButton.vue";
import DeleteButton from "@/components/buttons/DeleteButton.vue";
import { Client, usePaginatedFetch } from "@/types/api";
import PaginationItems from "@/components/PaginationItems.vue";
import CreateButton from "@/components/buttons/CreateButton.vue";

const {
  data: clients,
  total: totalClients,
  currentPage,
  lastPage,
  perPage,
  loading,
  fetch: loadClients,
  goToPage,
} = usePaginatedFetch<Client>("/clients");

const searchQuery = ref("");
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

function debouncedSearch() {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadClients(1, { search: searchQuery.value });
  }, 300);
}

function handleItemDeleted(id: number) {
  clients.value = clients.value.filter((client) => client.id !== id);
}

onMounted(() => {
  loadClients();
});
</script>
