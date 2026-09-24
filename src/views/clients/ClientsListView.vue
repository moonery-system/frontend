<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-5xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-light text-gray-900 tracking-tight">
              Clients
            </h1>
            <p class="text-sm text-gray-500 mt-1">
              Manage your client relationships
            </p>
          </div>

          <CreateButton text="Create Client" redirect="clients" />
        </div>
      </div>

      <div class="mb-6">
        <input
          v-model="searchQuery"
          @input="debouncedSearch"
          type="text"
          placeholder="Search clients by name or email..."
          class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all duration-200 text-sm text-gray-700"
        />
      </div>

      <PermissionGuard
        :permissions="['clients.view', 'clients.viewAny']"
        :require-all="false"
      >
        <LoadingAnimation :loading="loading" />

        <div v-if="clients.length > 0" class="space-y-3">
          <div
            v-for="client in clients"
            :key="client.id"
            class="bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-sm"
          >
            <div class="p-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div
                    class="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center"
                  >
                    <span class="text-gray-600 font-medium text-lg">
                      {{ client.name.charAt(0).toUpperCase() }}
                    </span>
                  </div>

                  <div>
                    <h3 class="text-lg font-medium text-gray-900">
                      {{ client.name }}
                    </h3>
                    <p class="text-sm text-gray-500">{{ client.email }}</p>
                    <div
                      class="flex items-center mt-1 space-x-4 text-xs text-gray-400"
                    >
                      <span>ID: {{ client.id }}</span>
                      <span>•</span>
                      <span>Active</span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center space-x-2">
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
          </div>
        </div>

        <div v-else class="text-center py-16">
          <div
            class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg
              class="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM9 3a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            No clients found
          </h3>
          <p class="text-gray-500 mb-6">
            {{
              searchQuery
                ? "No clients match your search criteria."
                : "Get started by creating your first client."
            }}
          </p>

          <PermissionGuard permission="clients.create">
            <button
              class="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200"
            >
              <svg
                class="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Create First Client
            </button>
          </PermissionGuard>
        </div>

        <PaginationItems
          :total="totalClients"
          :currentPage="currentPage"
          :perPage="perPage"
          :lastPage="lastPage"
          :loading="loading"
          @go-to-page="goToPage"
        />
      </PermissionGuard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import PermissionGuard from "@/components/PermissionGuard.vue";
import ViewButton from "@/components/buttons/ViewButton.vue";
import EditButton from "@/components/buttons/EditButton.vue";
import DeleteButton from "@/components/buttons/DeleteButton.vue";
import { Client, usePaginatedFetch } from "@/types/api";
import PaginationItems from "@/components/PaginationItems.vue";
import CreateButton from "@/components/buttons/CreateButton.vue";
import LoadingAnimation from "@/components/LoadingAnimation.vue";

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

<style scoped>
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Smooth transitions for all interactive elements */
* {
  transition-property: color, background-color, border-color,
    text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter,
    backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Focus states for accessibility */
button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Subtle animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.space-y-3 > * {
  animation: fadeIn 0.3s ease-out;
}
</style>
