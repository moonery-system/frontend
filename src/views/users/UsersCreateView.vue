<template>
  <div class="max-w-xl animate-rise">
    <PageHeader
      back
      eyebrow="Team"
      title="Add a team member"
      lead="They receive an email to set their own password."
    />

    <div class="surface p-6">
      <UserForm
        v-model:form="form"
        :roles="roles"
        :field-errors="fieldErrors"
        :loading="loading"
        @submit="submit"
      />

      <p class="mt-4 text-xs text-cream/55">
        The account is created without a password. An invite email is sent so
        the person can set it.
      </p>

      <p v-if="error" class="mt-4 text-sm text-rust-400">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import api from "@/services/api";
import PageHeader from "@/components/layout/PageHeader.vue";
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
