<template>
  <AuthLayout>
    <p class="eyebrow">Invitation</p>
    <h1 class="page-title mt-3">Set your password</h1>
    <p class="page-lead">One last step before you can see your deliveries.</p>

    <!-- Checking the token -->
    <div
      v-if="validating"
      class="mt-10 space-y-3"
      role="status"
      aria-busy="true"
    >
      <div class="skeleton h-11 w-full"></div>
      <div class="skeleton h-11 w-full"></div>
      <span class="sr-only">Checking your invite</span>
    </div>

    <!-- Invalid or expired token -->
    <div v-else-if="!tokenValid" class="mt-10 space-y-6">
      <div
        role="alert"
        class="rounded-lg border border-rust-500/30 bg-rust-500/10 p-4 text-sm leading-6 text-rust-400"
      >
        This invite link is invalid or has expired. Ask for a new one to
        continue.
      </div>

      <router-link
        to="/login"
        class="flex w-full items-center justify-center gap-2 rounded-lg bg-ember-500 px-4 py-3 text-sm font-bold text-ink-950 transition-colors duration-200 hover:bg-ember-400 active:bg-ember-600"
      >
        <AppIcon name="arrow-left" :size="16" :stroke-width="2.25" />
        Back to sign in
      </router-link>
    </div>

    <!-- Password definition -->
    <form v-else @submit.prevent="submit" class="mt-10 space-y-5">
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

      <ul
        class="space-y-1.5 rounded-lg border border-cream/10 bg-ink-900 p-4 text-xs"
      >
        <li
          v-for="rule in ruleList"
          :key="rule.key"
          class="flex items-center gap-2 transition-colors duration-200"
          :class="rules[rule.key] ? 'text-moss-400' : 'text-cream/50'"
        >
          <AppIcon
            :name="rules[rule.key] ? 'check' : 'x'"
            :size="13"
            :stroke-width="2.25"
          />
          {{ rule.label }}
        </li>
      </ul>

      <button
        type="submit"
        :disabled="loading || !canSubmit"
        class="flex w-full items-center justify-center rounded-lg bg-ember-500 px-4 py-3 text-sm font-bold text-ink-950 transition-colors duration-200 hover:bg-ember-400 active:bg-ember-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {{ loading ? "Saving" : "Activate my account" }}
      </button>
    </form>

    <div
      v-if="error"
      role="alert"
      class="mt-5 rounded-lg border border-rust-500/30 bg-rust-500/10 p-3 text-sm text-rust-400"
    >
      {{ error }}
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/services/api";
import TextInput from "@/components/form/TextInput.vue";
import AuthLayout from "@/components/auth/AuthLayout.vue";
import AppIcon from "@/components/ui/AppIcon.vue";

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

const ruleList = [
  { key: "length", label: "At least 8 characters" },
  { key: "upper", label: "One uppercase letter" },
  { key: "lower", label: "One lowercase letter" },
  { key: "digit", label: "One number" },
  { key: "special", label: "One special character (@ $ ! % * ? & - _)" },
] as const;

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
