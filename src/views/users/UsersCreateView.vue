<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-xl mx-auto px-4 py-8">
      <div class="mb-8 flex items-center justify-between">
        <h1 class="text-3xl font-light text-gray-900 tracking-tight">
          Create User
        </h1>
        <BackButton redirect="users" />
      </div>

      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <UserForm
          v-model:form="form"
          :roles="roles"
          :field-errors="fieldErrors"
          :loading="loading"
          @submit="submit"
        />

        <p class="mt-4 text-xs text-gray-400">
          The account is created without a password. An invite email is sent so
          the person can set it.
        </p>

        <p v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import api from "@/services/api";
import BackButton from "@/components/buttons/BackButton.vue";
import UserForm from "@/components/users/UserForm.vue";
import type { UserFormModel } from "@/components/users/UserForm.vue";
import type { Role } from "@/types/api";

const router = useRouter();

const form = ref<UserFormModel>({ name: "", email: "", role_id: "" });
const roles = ref<Role[]>([]);
const fieldErrors = ref<Record<string, string>>({});
const error = ref("");
const loading = ref(false);

onMounted(async () => {
  try {
    const response = await api.get("/roles");
    roles.value = response.data.data;
  } catch (err) {
    roles.value = [];
  }
});

async function submit() {
  loading.value = true;
  error.value = "";
  fieldErrors.value = {};

  try {
    await api.post("/users", {
      name: form.value.name,
      email: form.value.email,
      role_id: form.value.role_id || null,
    });

    router.push("/users");
  } catch (err: any) {
    if (err.status === 422) {
      fieldErrors.value = Object.fromEntries(
        Object.entries(err.errors ?? {}).map(([field, messages]) => [
          field,
          (messages as string[])[0],
        ])
      );
    } else if (!err.status) {
      error.value = "Network error or server is unreachable.";
    } else {
      error.value = err.message;
    }
  } finally {
    loading.value = false;
  }
}
</script>
