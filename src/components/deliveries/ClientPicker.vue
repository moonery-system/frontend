<template>
  <div class="space-y-4">
    <div>
      <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">
        Client
      </label>

      <div v-if="selected" class="mt-1 flex items-center justify-between">
        <div>
          <p class="text-gray-900 font-medium">{{ selected.name }}</p>
          <p class="text-sm text-gray-500">{{ selected.email }}</p>
        </div>
        <button
          type="button"
          @click="clear"
          class="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Change
        </button>
      </div>

      <template v-else>
        <input
          v-model="query"
          @input="debouncedSearch"
          type="text"
          placeholder="Search a client by name..."
          class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <p v-if="searching" class="mt-2 text-xs text-gray-400">Searching...</p>

        <ul
          v-else-if="results.length"
          class="mt-2 border border-gray-100 rounded-lg divide-y divide-gray-100 overflow-hidden"
        >
          <li v-for="client in results" :key="client.id">
            <button
              type="button"
              @click="select(client)"
              class="w-full text-left px-3 py-2 hover:bg-gray-50"
            >
              <span class="text-sm text-gray-900">{{ client.name }}</span>
              <span class="ml-2 text-xs text-gray-400">{{ client.email }}</span>
            </button>
          </li>
        </ul>

        <p v-else-if="query && !searching" class="mt-2 text-xs text-gray-400">
          No client found.
        </p>
      </template>
    </div>

    <div v-if="selected">
      <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">
        Delivery address
      </label>

      <p
        v-if="!selected.client_address?.length"
        class="mt-1 text-sm text-red-600"
      >
        This client has no address registered. Add one before creating a
        delivery.
      </p>

      <div v-else class="mt-2 space-y-2">
        <label
          v-for="address in selected.client_address"
          :key="address.id"
          class="flex items-start gap-3 rounded-lg border p-3 cursor-pointer"
          :class="
            addressId === address.id
              ? 'border-blue-300 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          "
        >
          <input
            type="radio"
            class="mt-1"
            :value="address.id"
            :checked="addressId === address.id"
            @change="selectAddress(address.id)"
          />
          <span class="text-sm text-gray-700">
            {{ address.address_line }}, {{ address.neighborhood }}<br />
            {{ address.city }}/{{ address.state }} — {{ address.zip_code }}
            <template v-if="address.complement">
              <br />{{ address.complement }}
            </template>
          </span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import api from "@/services/api";
import type { Client } from "@/types/api";

const emit = defineEmits<{
  (
    e: "change",
    value: { clientId: number | null; addressId: number | null }
  ): void;
}>();

const query = ref("");
const results = ref<Client[]>([]);
const searching = ref(false);
const selected = ref<Client | null>(null);
const addressId = ref<number | null>(null);

let searchTimeout: ReturnType<typeof setTimeout> | null = null;

function debouncedSearch() {
  if (searchTimeout) clearTimeout(searchTimeout);

  searchTimeout = setTimeout(async () => {
    if (!query.value) {
      results.value = [];
      return;
    }

    searching.value = true;

    try {
      const response = await api.get("/clients", {
        params: { search: query.value, per_page: 5 },
      });
      results.value = response.data.data.data;
    } finally {
      searching.value = false;
    }
  }, 300);
}

function select(client: Client) {
  selected.value = client;
  results.value = [];
  query.value = "";

  // A single address is the common case -- preselect it.
  addressId.value =
    client.client_address?.length === 1 ? client.client_address[0].id : null;

  emit("change", { clientId: client.id, addressId: addressId.value });
}

function selectAddress(id: number) {
  addressId.value = id;
  emit("change", { clientId: selected.value?.id ?? null, addressId: id });
}

function clear() {
  selected.value = null;
  addressId.value = null;
  emit("change", { clientId: null, addressId: null });
}
</script>
