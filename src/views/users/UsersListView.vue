<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-5xl mx-auto px-4 py-8">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-light text-gray-900 tracking-tight">
            Users
          </h1>
          <p class="text-sm text-gray-500 mt-1">
            Accounts and what each one can do
          </p>
        </div>

        <PermissionGuard permission="users.create">
          <CreateButton text="Create User" redirect="users" />
        </PermissionGuard>
      </div>

      <div class="mb-6">
        <input
          v-model="searchQuery"
          @input="debouncedSearch"
          type="text"
          placeholder="Search users by name or email..."
          class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all duration-200 text-sm text-gray-700"
        />
      </div>

      <LoadingAnimation :loading="loading" />

      <div v-if="users.length > 0" class="space-y-3">
        <div
          v-for="user in users"
          :key="user.id"
          class="bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-sm"
        >
          <div class="p-6 flex items-center justify-between">
            <div class="flex items-center space-x-4 min-w-0">
              <div
                class="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center flex-shrink-0"
              >
                <span class="text-gray-600 font-medium text-lg">
                  {{ user.name.charAt(0).toUpperCase() }}
                </span>
              </div>

              <div class="min-w-0">
                <h3 class="text-lg font-medium text-gray-900">
                  {{ user.name }}
                </h3>
                <p class="text-sm text-gray-500">{{ user.email }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <span
                    v-for="role in user.roles ?? []"
                    :key="role.id"
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                  >
                    {{ role.name }}
                  </span>
                  <span
                    class="text-xs"
                    :class="
                      user.activated_at ? 'text-green-600' : 'text-gray-400'
                    "
                  >
                    {{ user.activated_at ? "Active" : "Pending activation" }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <EditButton :id="user.id" redirect="users" />
              <DeleteButton
                :id="user.id"
                redirect="users"
                :name="user.name"
                @deleted="handleDeleted"
              />
            </div>
          </div>
        </div>
      </div>

      <p v-else-if="!loading" class="text-sm text-gray-400 py-10 text-center">
        No user here.
      </p>

      <PaginationItems
        :total="total"
        :current-page="currentPage"
        :per-page="perPage"
        :last-page="lastPage"
        :loading="loading"
        item-label="users"
        @go-to-page="(page: number) => goToPage(page, { search: searchQuery })"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import PermissionGuard from "@/components/PermissionGuard.vue";
import CreateButton from "@/components/buttons/CreateButton.vue";
import EditButton from "@/components/buttons/EditButton.vue";
import DeleteButton from "@/components/buttons/DeleteButton.vue";
import PaginationItems from "@/components/PaginationItems.vue";
import LoadingAnimation from "@/components/LoadingAnimation.vue";
import { usePaginatedFetch } from "@/types/api";
import type { SystemUser } from "@/types/api";

const {
  data: users,
  total,
  currentPage,
  lastPage,
  perPage,
  loading,
  fetch: loadUsers,
  goToPage,
} = usePaginatedFetch<SystemUser>("/users");

const searchQuery = ref("");
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

function debouncedSearch() {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadUsers(1, { search: searchQuery.value });
  }, 300);
}

function handleDeleted(id: number) {
  users.value = users.value.filter((user) => user.id !== id);
}

onMounted(() => loadUsers());
</script>
