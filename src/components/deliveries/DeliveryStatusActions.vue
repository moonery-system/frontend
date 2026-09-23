<template>
  <div class="surface p-6">
    <h2
      class="text-[11px] font-semibold uppercase tracking-[0.12em] text-cream/50 mb-4"
    >
      Actions
    </h2>

    <p v-if="!hasAnyAction" class="text-sm text-cream/55">
      Nothing to do on this delivery.
    </p>

    <div v-else class="flex flex-wrap gap-2">
      <!-- entregador assume uma livre -->
      <button
        v-if="canAttach"
        type="button"
        :disabled="loading"
        @click="run('attach')"
        class="px-4 py-2 text-sm font-medium rounded-lg bg-ember-500 text-ink-950 hover:bg-ember-400 active:bg-ember-600 transition-colors duration-200 disabled:opacity-50"
      >
        Take this delivery
      </button>

      <!-- entregador desiste -->
      <button
        v-if="canDetach"
        type="button"
        :disabled="loading"
        @click="run('detach')"
        class="px-4 py-2 text-sm font-medium rounded-lg border border-cream/[0.14] text-cream/85 hover:bg-cream/[0.03] transition-colors duration-200 disabled:opacity-50"
      >
        Drop it
      </button>

      <!-- um botao por transicao que o backend autoriza -->
      <button
        v-for="target in transitions"
        :key="target"
        type="button"
        :disabled="loading"
        @click="onTransition(target)"
        class="px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50"
        :class="
          isDestructive(target)
            ? 'border border-rust-500/30 text-rust-400 hover:bg-rust-500/10'
            : 'bg-ember-500 text-ink-950 hover:bg-ember-400'
        "
      >
        {{ humanizeStatus(target) }}
      </button>
    </div>

    <!-- admin atribui ou reatribui -->
    <div v-if="canAssign" class="mt-6 pt-5 border-t border-cream/10">
      <label
        class="text-[11px] font-semibold uppercase tracking-[0.12em] text-cream/50"
      >
        Assign a delivery man
      </label>

      <div class="mt-2 flex gap-2">
        <select
          v-model="selectedDeliveryman"
          class="flex-1 rounded-lg border border-cream/[0.14] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ember-500/60"
        >
          <option :value="null">Choose...</option>
          <option v-for="man in deliverymen" :key="man.id" :value="man.id">
            {{ man.name }}
          </option>
        </select>

        <button
          type="button"
          :disabled="loading || !selectedDeliveryman"
          @click="assign"
          class="px-4 py-2 text-sm font-medium rounded-lg bg-ember-500 text-ink-950 hover:bg-ember-400 active:bg-ember-600 transition-colors duration-200 disabled:opacity-50"
        >
          Assign
        </button>
      </div>
    </div>

    <p v-if="error" class="mt-4 text-sm text-rust-400">{{ error }}</p>

    <ConfirmDialog
      :is-open="confirming !== null"
      type="danger"
      title="Confirm this change"
      :description="confirmDescription"
      confirm-text="Yes, continue"
      :loading="loading"
      @confirm="confirmTransition"
      @cancel="confirming = null"
      @close="confirming = null"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import api from "@/services/api";
import ConfirmDialog from "@/components/dialogs/ConfirmDialog.vue";
import type { Delivery } from "@/types/api";
import { humanizeStatus } from "@/utils/status";
import { getCurrentUser, hasPermission } from "@/services/auth";

const props = defineProps<{ delivery: Delivery }>();

const emit = defineEmits<{
  (e: "done"): void;
  (e: "gone"): void;
}>();

const loading = ref(false);
const error = ref("");
const confirming = ref<string | null>(null);
const deliverymen = ref<{ id: number; name: string }[]>([]);
const selectedDeliveryman = ref<number | null>(null);
const canAttachPermission = ref(false);
const canAssignPermission = ref(false);

const transitions = computed(() => props.delivery.available_transitions ?? []);
const currentUserId = computed(() => getCurrentUser()?.id ?? null);

const canAttach = computed(
  () =>
    canAttachPermission.value &&
    props.delivery.delivery_man_id === null &&
    props.delivery.status.name === "pending"
);

const canDetach = computed(
  () =>
    canAttachPermission.value &&
    props.delivery.delivery_man_id === currentUserId.value &&
    props.delivery.status.name === "attached"
);

const canAssign = computed(() => canAssignPermission.value);

const hasAnyAction = computed(
  () => canAttach.value || canDetach.value || transitions.value.length > 0
);

const confirmDescription = computed(() =>
  confirming.value
    ? `This will move the delivery to "${humanizeStatus(confirming.value)}".`
    : ""
);

function isDestructive(target: string): boolean {
  return target.startsWith("canceled_") || target === "return_to_sender";
}

onMounted(async () => {
  canAttachPermission.value = await hasPermission("deliveries.attach");
  canAssignPermission.value = await hasPermission("deliveries.assign");

  if (canAssignPermission.value) {
    try {
      const response = await api.get("/users", {
        params: { role: "Delivery Man", per_page: 100 },
      });
      deliverymen.value = response.data.data.data;
    } catch (err) {
      deliverymen.value = [];
    }
  }
});

function onTransition(target: string) {
  if (isDestructive(target)) {
    confirming.value = target;
    return;
  }

  moveTo(target);
}

function confirmTransition() {
  const target = confirming.value;
  confirming.value = null;

  if (target) moveTo(target);
}

async function moveTo(target: string) {
  // O cliente cancela por endpoint proprio: ele nao tem deliveries.update
  if (target === "canceled_by_client") {
    await call(() => api.post(`/deliveries/${props.delivery.id}/cancel`));
    return;
  }

  await call(() =>
    api.put(`/deliveries/${props.delivery.id}/status`, { status: target })
  );
}

async function run(action: "attach" | "detach") {
  if (action === "attach") {
    await call(() => api.post(`/deliveries/${props.delivery.id}/attach`));
    return;
  }

  await call(() => api.delete(`/deliveries/${props.delivery.id}/attach`));
}

async function assign() {
  await call(() =>
    api.put(`/deliveries/${props.delivery.id}/deliveryman`, {
      delivery_man_id: selectedDeliveryman.value,
    })
  );
}

async function call(request: () => Promise<unknown>) {
  loading.value = true;
  error.value = "";

  try {
    await request();
    emit("done");
  } catch (err: any) {
    // 404 aqui quase sempre significa que a entrega saiu do escopo do usuario
    // -- tipicamente outro entregador a pegou primeiro.
    if (err.status === 404) {
      emit("gone");
      return;
    }

    error.value = err.status
      ? err.message
      : "Network error or server is unreachable.";
  } finally {
    loading.value = false;
  }
}
</script>
