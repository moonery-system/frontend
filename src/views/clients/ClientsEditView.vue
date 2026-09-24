<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 py-8">
      <LoadingAnimation :loading="loading" />
      <ErrorLoading :error="error" @retry="loadClient" />
      <div v-if="client" class="mb-8">
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
                Edit Client
              </h1>
              <p class="text-sm text-gray-500 mt-1">
                Update client information
              </p>
            </div>
          </div>
        </div>
      </div>

      <ClientForm
        v-if="client"
        :form="form"
        :client="client"
        @submit="submit"
      />
    </div>
  </div>
</template>

<script>
import api from "@/services/api";
import ClientForm from "@/components/clients/ClientForm.vue";
import LoadingAnimation from "@/components/LoadingAnimation.vue";
import ErrorLoading from "@/components/ErrorLoading.vue";

export default {
  name: "ClientsEditView",
  components: {
    ClientForm,
    LoadingAnimation,
    ErrorLoading,
  },
  data() {
    return {
      loading: false,
      error: null,
      fieldErrors: {},
      client: null,
      form: {
        name: "",
        email: "",
      },
    };
  },
  computed: {
    clientId() {
      return this.$route.params.id;
    },
  },
  mounted() {
    if (this.clientId) {
      this.loadClient();
    }
  },
  methods: {
    async submit(payload) {
      this.error = null;
      this.fieldErrors = {};

      this.loading = true;

      try {
        await api.put(`/clients/${this.clientId}`, {
          name: payload.form.name,
          email: payload.form.email,
        });

        this.$router.push(`/clients/${this.clientId}`);
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
    async loadClient() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get(`/clients/${this.clientId}`);

        this.client = response.data.data;
        this.form.name = this.client.name;
        this.form.email = this.client.email;
      } catch (error) {
        this.error = error.message;

        if (error.status === 422) {
          this.fieldErrors = error.errors;
        }
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
