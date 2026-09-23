<template>
  <div class="max-w-3xl animate-rise">
    <LoadingAnimation :loading="loading" />
    <ErrorLoading :error="error" @retry="loadClient" />
    <PageHeader
      v-if="client"
      back
      eyebrow="Clients"
      title="Edit client"
      lead="Changes apply to future deliveries. Past ones keep the address they were sent to."
    />

    <ClientForm v-if="client" :form="form" :client="client" @submit="submit" />
  </div>
</template>

<script>
import api from "@/services/api";
import ClientForm from "@/components/clients/ClientForm.vue";
import PageHeader from "@/components/layout/PageHeader.vue";
import LoadingAnimation from "@/components/LoadingAnimation.vue";
import ErrorLoading from "@/components/ErrorLoading.vue";

export default {
  name: "ClientsEditView",
  components: {
    PageHeader,
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
