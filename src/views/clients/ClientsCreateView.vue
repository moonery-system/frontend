<template>
  <div class="max-w-3xl animate-rise">
    <PageHeader
      back
      eyebrow="Clients"
      title="New client"
      lead="A client is the person who receives deliveries. They get an invite by email."
    />

    <ClientForm @submit="submit" />
  </div>
</template>

<script>
import api from "@/services/api";
import PageHeader from "@/components/layout/PageHeader.vue";
import ClientForm from "@/components/clients/ClientForm.vue";

export default {
  name: "ClientsCreateView",
  components: {
    PageHeader,
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
