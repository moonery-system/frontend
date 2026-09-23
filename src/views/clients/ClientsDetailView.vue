<template>
  <div class="max-w-4xl animate-rise">
    <LoadingAnimation :loading="loading" />
    <ErrorLoading :error="error" @retry="loadClient" />

    <div v-if="client">
      <PageHeader
        back
        eyebrow="Client"
        :title="client.name"
        lead="Profile, activation status and the addresses parcels can be sent to."
      >
        <EditButton :id="client.id" redirect="clients" />
        <DeleteButton
          :id="client.id"
          redirect="clients"
          :name="client.name"
          @deleted="handleItemDeleted"
        />
      </PageHeader>

      <ClientCard
        :id="client.id"
        :name="client.name"
        :email="client.email"
        :activated_at="client.activated_at"
        :created_at="client.created_at"
        :updated_at="client.updated_at"
      />

      <div class="surface">
        <div class="p-6 sm:p-8">
          <div class="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2
                class="font-display text-xl font-bold tracking-tight text-cream"
              >
                Addresses
              </h2>
              <p class="mt-1 text-sm text-cream/55">
                Where this client can receive parcels.
              </p>
            </div>

            <PermissionGuard permission="clients.update">
              <button
                class="inline-flex items-center gap-2 rounded-lg border border-cream/[0.14] bg-cream/[0.03] px-3 py-2 text-sm font-semibold text-cream/85 transition-colors duration-200 hover:bg-cream/[0.07] active:bg-cream/10"
              >
                <AppIcon name="plus" :size="16" />
                Add address
              </button>
            </PermissionGuard>
          </div>

          <div
            v-if="client.client_address && client.client_address.length > 0"
            class="space-y-3"
          >
            <div
              v-for="address in client.client_address"
              :key="address.id"
              class="rounded-lg border border-cream/10 bg-ink-900/60 p-4 transition-colors duration-200 hover:border-cream/20"
            >
              <p class="text-sm leading-6 text-cream/80">
                {{ address.address_line }}, {{ address.city }},
                {{ address.state }}, {{ address.zip_code }}
              </p>
            </div>
          </div>

          <EmptyState
            v-else
            icon="compass"
            title="No address on file"
            text="Add one so deliveries to this client have somewhere to go."
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/services/api";
import PageHeader from "@/components/layout/PageHeader.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import PermissionGuard from "@/components/PermissionGuard.vue";
import EditButton from "@/components/buttons/EditButton.vue";
import DeleteButton from "@/components/buttons/DeleteButton.vue";
import ClientCard from "@/components/clients/ClientCard.vue";
import ErrorLoading from "@/components/ErrorLoading.vue";
import LoadingAnimation from "@/components/LoadingAnimation.vue";

export default {
  name: "ClientDetailView",
  components: {
    PageHeader,
    EmptyState,
    AppIcon,
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
