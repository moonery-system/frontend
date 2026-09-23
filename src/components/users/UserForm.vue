<template>
  <form @submit.prevent="$emit('submit')" class="space-y-5">
    <TextInput
      :model-value="form.name"
      @update:model-value="(v: string) => update('name', v)"
      label="Name"
      placeholder="Full name"
      :field-errors="fieldErrors.name"
      :disabled="loading"
    />

    <TextInput
      :model-value="form.email"
      @update:model-value="(v: string) => update('email', v)"
      label="Email"
      input-type="email"
      placeholder="name@example.com"
      :field-errors="fieldErrors.email"
      :disabled="editing"
    />
    <p v-if="editing" class="text-xs text-cream/55 -mt-3">
      The email cannot be changed after the account is created.
    </p>

    <div v-if="!editing" class="space-y-1">
      <label
        class="text-[11px] font-semibold uppercase tracking-[0.12em] text-cream/50"
      >
        Role
      </label>
      <select
        :value="form.role_id"
        @change="update('role_id', ($event.target as HTMLSelectElement).value)"
        class="w-full rounded-lg border border-cream/[0.14] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ember-500/60"
        :disabled="loading"
      >
        <option value="">No role</option>
        <option v-for="role in roles" :key="role.id" :value="role.id">
          {{ role.name }}
        </option>
      </select>
      <p v-if="fieldErrors.role_id" class="text-xs text-rust-400">
        {{ fieldErrors.role_id }}
      </p>
    </div>

    <div class="pt-4 border-t border-cream/10">
      <ProcessButton
        :loading="loading"
        :default-text="editing ? 'Save changes' : 'Create user'"
        :loading-text="editing ? 'Saving...' : 'Creating...'"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import TextInput from "@/components/form/TextInput.vue";
import ProcessButton from "@/components/buttons/ProcessButton.vue";
import type { Role } from "@/types/api";

export interface UserFormModel {
  name: string;
  email: string;
  role_id: string;
}

const props = defineProps<{
  form: UserFormModel;
  roles: Role[];
  fieldErrors: Record<string, string>;
  loading: boolean;
  editing?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:form", value: UserFormModel): void;
  (e: "submit"): void;
}>();

function update(field: keyof UserFormModel, value: string) {
  emit("update:form", { ...props.form, [field]: value });
}
</script>
