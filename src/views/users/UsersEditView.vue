<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-xl mx-auto px-4 py-8">
      <div class="mb-8 flex items-center justify-between">
        <h1 class="text-3xl font-light text-gray-900 tracking-tight">
          Edit User
        </h1>
        <BackButton redirect="users" />
      </div>

      <LoadingAnimation :loading="loadingUser" />

      <ErrorLoading
        v-if="error && !loadingUser"
        :error="error"
        @retry="loadUser"
      />

      <div
        v-else-if="!loadingUser"
        class="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
      >
        <UserForm
          v-model:form="form"
          :roles="[]"
          :field-errors="fieldErrors"
          :loading="saving"
          editing
          @submit="submit"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/services/api";
import BackButton from "@/components/buttons/BackButton.vue";
import LoadingAnimation from "@/components/LoadingAnimation.vue";
import ErrorLoading from "@/components/ErrorLoading.vue";
import UserForm from "@/components/users/UserForm.vue";
import type { UserFormModel } from "@/components/users/UserForm.vue";

const route = useRoute();
const router = useRouter();

const userId = route.params.id as string;
const form = ref<UserFormModel>({ name: "", email: "", role_id: "" });
const fieldErrors = ref<Record<string, string>>({});
const error = ref("");
const loadingUser = ref(false);
const saving = ref(false);

async function loadUser() {
  loadingUser.value = true;
  error.value = "";

  try {
    const response = await api.get(`/users/${userId}`);
    const user = response.data.data;
    form.value = { name: user.name, email: user.email, role_id: "" };
  } catch (err: any) {
    error.value = err.status
      ? err.message
      : "Network error or server is unreachable.";
  } finally {
    loadingUser.value = false;
  }
}

async function submit() {
  saving.value = true;
  fieldErrors.value = {};

  try {
    await api.put(`/users/${userId}`, { name: form.value.name });
    router.push("/users");
  } catch (err: any) {
    if (err.status === 422) {
      fieldErrors.value = Object.fromEntries(
        Object.entries(err.errors ?? {}).map(([field, messages]) => [
          field,
          (messages as string[])[0],
        ])
      );
    } else {
      error.value = err.status
        ? err.message
        : "Network error or server is unreachable.";
    }
  } finally {
    saving.value = false;
  }
}

onMounted(loadUser);
</script>
