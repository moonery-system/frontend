<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8"
  >
    <div
      class="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6 border border-gray-100"
    >
      <div class="text-center">
        <div class="flex items-center justify-center mb-4">
          <h1 class="text-3xl font-extrabold text-gray-900 ml-2">Moonery</h1>
        </div>
        <h2 class="text-2xl font-bold text-gray-900">Set your password</h2>
      </div>

      <!-- Validando o token -->
      <div v-if="validating" class="text-center text-sm text-gray-500 py-6">
        Checking your invite...
      </div>

      <!-- Token invalido ou expirado -->
      <div v-else-if="!tokenValid" class="space-y-5">
        <div
          class="text-sm text-red-600 text-center p-3 bg-red-50 rounded-lg border border-red-200"
        >
          This invite is invalid or has expired. Ask for a new one to continue.
        </div>

        <router-link
          to="/login"
          class="block w-full text-center py-2.5 px-4 text-sm font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800 transition-all duration-200"
        >
          Back to sign in
        </router-link>
      </div>

      <!-- Definicao de senha -->
      <form v-else @submit.prevent="submit" class="space-y-5">
        <TextInput
          v-model="password"
          label="Password"
          input-type="password"
          autocomplete="new-password"
          placeholder="Your new password"
          :field-errors="fieldErrors.password"
          :disabled="loading"
        />

        <TextInput
          v-model="passwordConfirmation"
          label="Confirm password"
          input-type="password"
          autocomplete="new-password"
          placeholder="Repeat your new password"
          :field-errors="confirmationError"
          :disabled="loading"
        />

        <ul class="text-xs text-gray-500 space-y-1 pl-1">
          <li :class="rules.length ? 'text-green-600' : ''">
            At least 8 characters
          </li>
          <li :class="rules.upper ? 'text-green-600' : ''">
            One uppercase letter
          </li>
          <li :class="rules.lower ? 'text-green-600' : ''">
            One lowercase letter
          </li>
          <li :class="rules.digit ? 'text-green-600' : ''">One number</li>
          <li :class="rules.special ? 'text-green-600' : ''">
            One special character (@ $ ! % * ? &amp; - _)
          </li>
        </ul>

        <button
          type="submit"
          :disabled="loading || !canSubmit"
          class="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading">Saving...</span>
          <span v-else>Activate my account</span>
        </button>
      </form>

      <div
        v-if="error"
        class="mt-4 text-red-600 text-sm text-center p-3 bg-red-50 rounded-lg border border-red-200"
      >
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/services/api";
import TextInput from "@/components/form/TextInput.vue";

const route = useRoute();
const router = useRouter();

const token = String(route.query.token ?? "");

const password = ref("");
const passwordConfirmation = ref("");
const error = ref("");
const fieldErrors = ref<Record<string, string>>({});
const loading = ref(false);
const validating = ref(true);
const tokenValid = ref(false);

// Espelha o regex de ChangePasswordRequest no backend
const rules = computed(() => ({
  length: password.value.length >= 8,
  upper: /[A-Z]/.test(password.value),
  lower: /[a-z]/.test(password.value),
  digit: /\d/.test(password.value),
  special: /[@$!%*?&\-_]/.test(password.value),
}));

const confirmationError = computed(() =>
  passwordConfirmation.value && password.value !== passwordConfirmation.value
    ? "The passwords do not match."
    : ""
);

const canSubmit = computed(
  () =>
    Object.values(rules.value).every(Boolean) &&
    password.value === passwordConfirmation.value
);

onMounted(async () => {
  if (!token) {
    validating.value = false;
    return;
  }

  try {
    await api.get("/invite", { params: { token } });
    tokenValid.value = true;
  } catch (err) {
    tokenValid.value = false;
  } finally {
    validating.value = false;
  }
});

const submit = async () => {
  loading.value = true;
  error.value = "";
  fieldErrors.value = {};

  try {
    await api.post(
      "/changePassword",
      { password: password.value },
      { params: { token } }
    );

    router.push("/login");
  } catch (err: any) {
    if (err.status === 422) {
      fieldErrors.value = Object.fromEntries(
        Object.entries(err.errors ?? {}).map(([field, messages]) => [
          field,
          (messages as string[])[0],
        ])
      );
    } else if (err.status === 404) {
      tokenValid.value = false;
    } else if (!err.status) {
      error.value = "Network error or server is unreachable.";
    } else {
      error.value = err.message;
    }
  } finally {
    loading.value = false;
  }
};
</script>
