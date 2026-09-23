<template>
  <AuthLayout>
    <p class="eyebrow">Sign in</p>
    <h1 class="page-title mt-3">Welcome back</h1>
    <p class="page-lead">Pick up where the last shift left off.</p>

    <form @submit.prevent="login" class="mt-10 space-y-5">
      <div>
        <label
          for="email"
          class="mb-2 block text-xs font-semibold uppercase tracking-wider text-cream/60"
          >Email</label
        >
        <input
          id="email"
          name="email"
          type="email"
          autocomplete="email"
          required
          v-model="email"
          @input="clearError"
          class="block w-full appearance-none rounded-lg border border-cream/[0.14] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ember-500/30"
          placeholder="you@company.com"
        />
      </div>
      <div>
        <div class="mb-2 flex items-center justify-between">
          <label
            for="password"
            class="block text-xs font-semibold uppercase tracking-wider text-cream/60"
            >Password</label
          >
          <a
            href="#"
            class="text-xs font-semibold text-ember-400 transition-colors duration-200 hover:text-ember-300"
          >
            Forgot it?
          </a>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autocomplete="current-password"
          required
          v-model="password"
          @input="clearError"
          class="block w-full appearance-none rounded-lg border border-cream/[0.14] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ember-500/30"
          placeholder="Your password"
        />
      </div>

      <div
        v-if="error"
        role="alert"
        class="rounded-lg border border-rust-500/30 bg-rust-500/10 p-3 text-sm text-rust-400"
      >
        {{ error }}
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="flex w-full items-center justify-center gap-2 rounded-lg bg-ember-500 px-4 py-3 text-sm font-bold text-ink-950 transition-colors duration-200 hover:bg-ember-400 active:bg-ember-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span v-if="loading">Checking credentials</span>
        <template v-else>
          Sign in
          <AppIcon name="arrow-right" :size="16" :stroke-width="2.25" />
        </template>
      </button>
    </form>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "@/services/api";
import AuthLayout from "@/components/auth/AuthLayout.vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import { clearAuthCache } from "@/services/auth";

const router = useRouter();

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

const login = async () => {
  loading.value = true;
  error.value = "";

  try {
    clearAuthCache();

    await api.post("/auth/login", {
      email: email.value,
      password: password.value,
    });

    router.push("/");
  } catch (err: any) {
    password.value = ""; // Clear password on error for security
    if (err.errors?.email) {
      error.value = err.errors.email[0];
    } else if (!err.status) {
      error.value = "Network error or server is unreachable.";
    } else {
      error.value = err.message;
    }
  } finally {
    loading.value = false;
  }
};

const clearError = () => {
  error.value = ""; // Clear error message when user starts typing
};
</script>
