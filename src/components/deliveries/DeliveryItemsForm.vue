<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2
        class="text-[11px] font-semibold uppercase tracking-[0.12em] text-cream/50"
      >
        Items
      </h2>
      <button
        type="button"
        @click="addItem"
        class="text-sm font-medium text-ember-400 hover:text-ember-400"
      >
        + Add item
      </button>
    </div>

    <div
      v-for="(item, index) in modelValue"
      :key="index"
      class="rounded-lg border border-cream/[0.14] p-4 space-y-3"
    >
      <div class="flex items-center justify-between">
        <span class="text-xs font-medium text-cream/55">
          Item {{ index + 1 }}
        </span>
        <button
          v-if="modelValue.length > 1"
          type="button"
          @click="removeItem(index)"
          class="text-xs font-medium text-rust-400 hover:text-rust-400"
        >
          Remove
        </button>
      </div>

      <TextInput
        :model-value="item.name"
        @update:model-value="(v: string) => update(index, 'name', v)"
        label="Name"
        placeholder="At least 5 characters"
        :field-errors="errorFor(index, 'name')"
      />

      <TextInput
        :model-value="item.description"
        @update:model-value="(v: string) => update(index, 'description', v)"
        label="Description"
        placeholder="Optional"
      />

      <div class="grid grid-cols-2 gap-3">
        <TextInput
          :model-value="item.quantity"
          @update:model-value="(v: string) => update(index, 'quantity', v)"
          label="Quantity"
          input-type="number"
          placeholder="1"
          :field-errors="errorFor(index, 'quantity')"
        />
        <TextInput
          :model-value="item.weight"
          @update:model-value="(v: string) => update(index, 'weight', v)"
          label="Weight (kg)"
          input-type="number"
          placeholder="0.00"
          :field-errors="errorFor(index, 'weight')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TextInput from "@/components/form/TextInput.vue";

export interface DeliveryItemDraft {
  name: string;
  description: string;
  quantity: string;
  weight: string;
}

const props = defineProps<{
  modelValue: DeliveryItemDraft[];
  fieldErrors?: Record<string, string>;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: DeliveryItemDraft[]): void;
}>();

// Fully controlled: never mutate the prop, always emit a new array.
function update(index: number, field: keyof DeliveryItemDraft, value: string) {
  const next = props.modelValue.map((item, i) =>
    i === index ? { ...item, [field]: value } : item
  );
  emit("update:modelValue", next);
}

function addItem() {
  emit("update:modelValue", [
    ...props.modelValue,
    { name: "", description: "", quantity: "", weight: "" },
  ]);
}

function removeItem(index: number) {
  emit(
    "update:modelValue",
    props.modelValue.filter((_, i) => i !== index)
  );
}

// The API reports item errors as "items.0.name"
function errorFor(index: number, field: string): string {
  return props.fieldErrors?.[`items.${index}.${field}`] ?? "";
}
</script>
