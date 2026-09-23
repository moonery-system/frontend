<template>
  <div class="max-w-5xl animate-rise">
    <PageHeader back eyebrow="Deliveries" title="Delivery details" />

    <LoadingAnimation :loading="loading" />

    <ErrorLoading v-if="error" :error="error" @retry="loadDelivery" />

    <div v-else-if="delivery" class="space-y-6 animate-rise">
      <DeliveryCard :delivery="delivery" />

      <div
        class="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]"
      >
        <DeliveryStatusActions
          :delivery="delivery"
          @done="loadDelivery"
          @gone="onGone"
        />
        <DeliveryTimeline :history="delivery.status_history ?? []" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/services/api";
import PageHeader from "@/components/layout/PageHeader.vue";
import LoadingAnimation from "@/components/LoadingAnimation.vue";
import ErrorLoading from "@/components/ErrorLoading.vue";
import DeliveryCard from "@/components/deliveries/DeliveryCard.vue";
import DeliveryTimeline from "@/components/deliveries/DeliveryTimeline.vue";
import DeliveryStatusActions from "@/components/deliveries/DeliveryStatusActions.vue";
import type { Delivery } from "@/types/api";
import { onNotification } from "@/services/websocket";

const route = useRoute();
const router = useRouter();

const deliveryId = route.params.id as string;
const delivery = ref<Delivery | null>(null);
const loading = ref(false);
const error = ref("");

async function loadDelivery() {
  loading.value = true;
  error.value = "";

  try {
    const response = await api.get(`/deliveries/${deliveryId}`);
    delivery.value = response.data.data;
  } catch (err: any) {
    error.value = err.status
      ? err.message
      : "Network error or server is unreachable.";
  } finally {
    loading.value = false;
  }
}

// A entrega saiu do escopo do usuario -- normalmente outro entregador a pegou.
function onGone() {
  router.push("/deliveries");
}

let unsubscribe: (() => void) | null = null;

onMounted(() => {
  loadDelivery();

  // O payload é genérico (título e descrição), então recarregamos em vez de
  // aplicar o novo status às cegas. Um caminho de dados só.
  unsubscribe = onNotification((payload) => {
    if (payload.type === "notification") loadDelivery();
  });
});

onUnmounted(() => unsubscribe?.());
</script>
