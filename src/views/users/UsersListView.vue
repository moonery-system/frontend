<template>
  <div class="animate-rise">
    <PageHeader
      eyebrow="Registry"
      title="Team"
      lead="Everyone with a login, and what each account is allowed to do. New members are activated by email."
    >
      <PermissionGuard permission="users.create">
        <CreateButton text="Add member" redirect="users" />
      </PermissionGuard>
    </PageHeader>

    <div class="mb-6 max-w-md">
      <SearchInput
        v-model="searchQuery"
        placeholder="Search by name or email"
        @input="debouncedSearch"
      />
    </div>

    <ListSkeleton v-if="loading" />

    <div
      v-else-if="users.length > 0"
      class="surface divide-y divide-cream/10 overflow-hidden"
    >
      <div
        v-for="user in users"
        :key="user.id"
        class="flex flex-wrap items-center justify-between gap-4 px-5 py-4 transition-colors duration-200 hover:bg-cream/[0.03] sm:px-6"
      >
        <div class="flex min-w-0 items-center gap-4">
          <div
            class="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gold-400/15 font-display text-sm font-bold text-gold-400"
          >
            {{ user.name.charAt(0).toUpperCase() }}
          </div>

          <div class="min-w-0">
            <h3 class="truncate font-semibold text-cream">{{ user.name }}</h3>
            <p class="truncate text-sm text-cream/55">{{ user.email }}</p>
            <div class="mt-2 flex flex-wrap items-center gap-2">
              <span
                v-for="role in user.roles ?? []"
                :key="role.id"
                class="rounded-md bg-cream/[0.06] px-2 py-1 text-[11px] font-semibold leading-none text-cream/80 ring-1 ring-inset ring-cream/10"
              >
                {{ role.name }}
              </span>
              <span
                class="text-xs"
                :class="user.activated_at ? 'text-moss-400' : 'text-gold-400'"
              >
                {{ user.activated_at ? "Active" : "Waiting for activation" }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
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

    <div v-else class="surface">
      <EmptyState
        icon="user"
        :title="searchQuery ? 'No one matches that search' : 'Nobody here yet'"
        :text="
          searchQuery
            ? 'Try a shorter name, or search by the email address instead.'
            : 'Add the first team member. They get an email to set a password and activate the account.'
        "
      />
    </div>

    <PaginationItems
      :total="total"
      :current-page="currentPage"
      :per-page="perPage"
      :last-page="lastPage"
      :loading="loading"
      item-label="members"
      @go-to-page="(page: number) => goToPage(page, { search: searchQuery })"
    />
  </div>
</template>

<script setup lang="ts">
import PageHeader from "@/components/layout/PageHeader.vue";
import SearchInput from "@/components/ui/SearchInput.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import ListSkeleton from "@/components/ui/ListSkeleton.vue";
import { onMounted, ref } from "vue";
import PermissionGuard from "@/components/PermissionGuard.vue";
import CreateButton from "@/components/buttons/CreateButton.vue";
import EditButton from "@/components/buttons/EditButton.vue";
import DeleteButton from "@/components/buttons/DeleteButton.vue";
import PaginationItems from "@/components/PaginationItems.vue";
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
