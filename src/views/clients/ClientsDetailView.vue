<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 py-8">
      <LoadingAnimation :loading="loading" />
      <ErrorLoading :error="error" @retry="loadClient" />

      <div v-if="client">
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <button
                @click="$router.go(-1)"
                class="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <svg
                  class="w-5 h-5 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back
              </button>
              <div>
                <h1 class="text-3xl font-light text-gray-900 tracking-tight">
                  {{ client.name }}
                </h1>
                <p class="text-sm text-gray-500 mt-1">Client Details</p>
              </div>
            </div>

            <div class="flex items-center space-x-3">
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

        <ClientCard
          :id="client.id"
          :name="client.name"
          :email="client.email"
          :activated_at="client.activated_at"
          :created_at="client.created_at"
          :updated_at="client.updated_at"
        />

        <div class="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-xl font-medium text-gray-900">Addresses</h2>
                <p class="text-sm text-gray-500 mt-1">
                  Client address information
                </p>
              </div>

              <PermissionGuard permission="clients.update">
                <button
                  class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150"
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
                  Add Address
                </button>
              </PermissionGuard>
            </div>

            <div
              v-if="client.client_address && client.client_address.length > 0"
              class="space-y-4"
            >
              <div
                v-for="address in client.client_address"
                :key="address.id"
                class="p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors duration-200"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <p class="text-gray-600 mt-1">
                      {{ address.address_line }}, {{ address.city }},
                      {{ address.state }}, {{ address.zip_code }}
                    </p>
                  </div>
                  <div class="flex items-center space-x-2 ml-4">
                    <button
                      class="text-gray-400 hover:text-gray-600 transition-colors duration-150"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      class="text-gray-400 hover:text-red-600 transition-colors duration-150"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty Addresses State -->
            <div v-else class="text-center py-12">
              <div
                class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <svg
                  class="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 class="text-sm font-medium text-gray-900 mb-1">
                No addresses
              </h3>
              <p class="text-sm text-gray-500">
                This client doesn't have any addresses yet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/services/api";
import PermissionGuard from "@/components/PermissionGuard.vue";
import EditButton from "@/components/buttons/EditButton.vue";
import DeleteButton from "@/components/buttons/DeleteButton.vue";
import ClientCard from "@/components/clients/ClientCard.vue";
import ErrorLoading from "@/components/ErrorLoading.vue";
import LoadingAnimation from "@/components/LoadingAnimation.vue";

export default {
  name: "ClientDetailView",
  components: {
    PermissionGuard,
    EditButton,
    DeleteButton,
    ClientCard,
    ErrorLoading,
    LoadingAnimation,
  },
  data() {
    return {
      client: null,
      loading: true,
      error: null,
    };
  },
  computed: {
    clientId() {
      return this.$route.params.id;
    },
  },
  async created() {
    await this.loadClient();
  },
  watch: {
    "$route.params.id": {
      handler() {
        this.loadClient();
      },
    },
  },
  methods: {
    async loadClient() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get(`/clients/${this.clientId}`);
        this.client = response.data.data;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    formatDateTime(dateString) {
      if (!dateString) return "Not available";

      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    editClient() {
      this.$router.push(`/clients/${this.clientId}/edit`);
    },

    async handleItemDeleted() {
      window.location.replace("/clients");
    },
  },
};
</script>

<style scoped>
/* Custom animations */
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

.bg-white {
  animation: fadeIn 0.3s ease-out;
}

/* Focus states for accessibility */
button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Smooth transitions */
* {
  transition-property: color, background-color, border-color,
    text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter,
    backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
