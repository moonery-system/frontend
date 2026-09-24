<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 py-8">
      <!-- Header -->
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
                New Client
              </h1>
              <p class="text-sm text-gray-500 mt-1">Create a new client user</p>
            </div>
          </div>
        </div>
      </div>

      <ClientForm @submit="submit" />
    </div>
  </div>
</template>

<script>
import api from "@/services/api";
import ClientForm from "@/components/clients/ClientForm.vue";

export default {
  name: "ClientsCreateView",
  components: {
    ClientForm,
  },
  data() {
    return {
      loading: false,
      error: null,
      success: null,
      fieldErrors: {},
      form: {
        name: "",
        email: "",
      },
      address: {
        address_line: "",
        neighborhood: "",
        city: "",
        state: "",
        zip_code: "",
        complement: "",
      },
    };
  },
  methods: {
    async submit(payload) {
      this.error = null;
      this.success = null;
      this.fieldErrors = {};

      this.loading = true;

      try {
        const clientResp = await api.post("/clients", {
          name: payload.form.name,
          email: payload.form.email,
        });

        const created = clientResp?.data?.data;

        if (!created?.id) {
          throw new Error("Client created but missing id in response.");
        }

        if (this.hasAnyAddressField()) {
          await api.post(`/clients/${created.id}/addresses`, {
            address_line: payload.address.address_line,
            neighborhood: payload.address.neighborhood,
            city: payload.address.city,
            state: payload.address.state,
            zip_code: payload.address.zip_code,
            complement: payload.address.complement || null,
          });
        }

        this.success = "Client created successfully!";
        this.$router.push(`/clients/${created.id}`);
      } catch (err) {
        this.error = err.message;

        if (err.status === 422) {
          const newErrors = {};

          for (const [field, fieldErrors] of Object.entries(err.errors || {})) {
            newErrors[field] = fieldErrors[0];
          }

          this.fieldErrors = newErrors;
        }
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
