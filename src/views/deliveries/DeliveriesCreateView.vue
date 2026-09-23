<template>
  <div class="max-w-2xl animate-rise">
    <PageHeader
      back
      eyebrow="Dispatch"
      title="New delivery"
      lead="Choose who receives it, where it goes and what is inside. It lands in the pool for drivers right away."
    />

    <form @submit.prevent="submit" class="surface p-6 space-y-8">
      <ClientPicker @change="onClientChange" />

      <DeliveryItemsForm v-model="items" :field-errors="fieldErrors" />

      <div class="pt-4 border-t border-cream/10 flex items-center gap-3">
        <ProcessButton
          :loading="loading"
          default-text="Create delivery"
          loading-text="Creating..."
        />
        <span v-if="!canSubmit" class="text-xs text-cream/55">
          Pick a client, an address and fill at least one item.
        </span>
      </div>

      <p v-if="error" class="text-sm text-rust-400">{{ error }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import api from "@/services/api";
import PageHeader from "@/components/layout/PageHeader.vue";
import ProcessButton from "@/components/buttons/ProcessButton.vue";
import ClientPicker from "@/components/deliveries/ClientPicker.vue";
import DeliveryItemsForm from "@/components/deliveries/DeliveryItemsForm.vue";
import type { DeliveryItemDraft } from "@/components/deliveries/DeliveryItemsForm.vue";

const router = useRouter();

const clientId = ref<number | null>(null);
const addressId = ref<number | null>(null);
const items = ref<DeliveryItemDraft[]>([
  { name: "", description: "", quantity: "", weight: "" },
]);
const loading = ref(false);
const error = ref("");
const fieldErrors = ref<Record<string, string>>({});

const canSubmit = computed(
  () =>
    clientId.value !== null &&
    addressId.value !== null &&
    items.value.some((item) => item.name && item.quantity && item.weight)
);

function onClientChange(selection: {
  clientId: number | null;
  addressId: number | null;
}) {
  clientId.value = selection.clientId;
  addressId.value = selection.addressId;
}

async function submit() {
  if (!canSubmit.value) return;

  loading.value = true;
  error.value = "";
  fieldErrors.value = {};

  try {
    const response = await api.post("/deliveries", {
      client_id: clientId.value,
      client_address_id: addressId.value,
      items: items.value
        .filter((item) => item.name)
        .map((item) => ({
          name: item.name,
          description: item.description || null,
          quantity: Number(item.quantity),
          weight: Number(item.weight),
        })),
    });

    router.push(`/deliveries/${response.data.data.delivery.id}`);
  } catch (err: any) {
    if (err.status === 422) {
      fieldErrors.value = Object.fromEntries(
        Object.entries(err.errors ?? {}).map(([field, messages]) => [
          field,
          (messages as string[])[0],
        ])
      );
      error.value = "Check the highlighted fields.";
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
