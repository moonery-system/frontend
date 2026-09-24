<template>
  <PermissionGuard permission="clients.create" :show-fallback="true">
    <template #fallback>
      <div class="text-center py-16">
        <div
          class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <svg
            class="w-8 h-8 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          Access Restricted
        </h3>
        <p class="text-gray-500">
          You don't have permission to create clients.
        </p>
      </div>
    </template>

    <div class="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div
        v-if="error"
        class="rounded-lg bg-red-50 border border-red-100 p-4 text-sm text-red-700"
      >
        {{ error }}
      </div>
      <form v-if="!error" class="p-6 space-y-8" @submit.prevent="submit">
        <div>
          <h2 class="text-sm font-semibold text-gray-900">Client Info</h2>
          <p class="text-xs text-gray-500 mt-1">Basic account data</p>

          <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextInput
              v-model="localForm.name"
              label="Name"
              placeholder="Client name"
              :fieldErrors="fieldErrors.name"
            />

            <TextInput
              v-model="localForm.email"
              label="Email"
              type="email"
              placeholder="client@email.com"
              :fieldErrors="fieldErrors.email"
              :disabled="client == null"
            />
          </div>
        </div>

        <div v-if="client == null" class="pt-6 border-t border-gray-100">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-sm font-semibold text-gray-900">
                Client Address (optional)
              </h2>
              <p class="text-xs text-gray-500 mt-1">
                If you fill any field below, we’ll create the address after
                creating the client.
              </p>
            </div>

            <button
              type="button"
              class="text-xs font-medium text-gray-600 hover:text-gray-900"
              @click="clearAddress"
            >
              Clear
            </button>
          </div>

          <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextInput
              v-model="address.zip_code"
              label="Zip code"
              placeholder="Zip code"
              :fieldErrors="fieldErrors.zip_code"
            />

            <div class="space-y-1 md:col-span-2">
              <TextInput
                v-model="address.address_line"
                label="Address line"
                placeholder="Street, number"
                :fieldErrors="fieldErrors.address_line"
              />
            </div>

            <TextInput
              v-model="address.neighborhood"
              label="Neighborhood"
              placeholder="Neighborhood"
              :fieldErrors="fieldErrors.neighborhood"
            />

            <TextInput
              v-model="address.city"
              label="City"
              placeholder="City"
              :fieldErrors="fieldErrors.city"
            />

            <TextInput
              v-model="address.state"
              label="State"
              placeholder="State"
              :fieldErrors="fieldErrors.state"
            />

            <TextInput
              v-model="address.complement"
              label="Complement"
              placeholder="Complement"
              :fieldErrors="fieldErrors.complement"
            />
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <BackButton redirect="clients" />

          <ProcessButton
            :loading="loading"
            loading-text="Processing..."
            default-text="Save"
          />
        </div>
      </form>
    </div>
  </PermissionGuard>
</template>

<script>
import BackButton from "../buttons/BackButton.vue";
import ProcessButton from "../buttons/ProcessButton.vue";
import TextInput from "../form/TextInput.vue";
import PermissionGuard from "../PermissionGuard.vue";

export default {
  name: "ClientForm",
  components: { PermissionGuard, TextInput, ProcessButton, BackButton },
  props: {
    client: {
      type: Object,
      default: null,
    },
    form: {
      type: Object,
      required: false,
    },
  },
  data() {
    return {
      loading: false,
      error: null,
      fieldErrors: {},
      localForm: {
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
      lastZipCodeSearched: null,
    };
  },
  watch: {
    async "address.zip_code"(newZipCode) {
      if (!newZipCode) return;

      const cleanZipCode = newZipCode.replace(/\D/g, "");

      if (cleanZipCode.length !== 8) return;

      if (cleanZipCode === this.lastZipCodeSearched) return;

      this.lastZipCodeSearched = cleanZipCode;

      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cleanZipCode}/json/`
        );
        const data = await response.json();

        if (data.erro) return;

        this.address.address_line = data.logradouro || "";
        this.address.neighborhood = data.bairro || "";
        this.address.city = data.localidade || "";
        this.address.state = data.uf || "";
        this.address.complement = data.complemento || "";
      } catch (e) {
        console.error(e);
      }
    },
    form: {
      immediate: true,
      handler(newForm) {
        if (!newForm) return;
        this.localForm = { ...newForm };
      },
    },
  },
  methods: {
    clearAddress() {
      this.address = {
        address_line: "",
        neighborhood: "",
        city: "",
        state: "",
        zip_code: "",
        complement: "",
      };
    },

    hasAnyAddressField() {
      const a = this.address;
      return !!(
        a.address_line ||
        a.neighborhood ||
        a.city ||
        a.state ||
        a.zip_code ||
        a.complement
      );
    },
    submit() {
      this.$emit("submit", {
        form: this.localForm,
        address: this.address,
      });
    },
  },
};
</script>
