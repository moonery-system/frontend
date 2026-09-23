<!-- eslint-disable prettier/prettier -->
<template>
  <div class="space-y-2">
    <label
      class="block text-xs font-semibold uppercase tracking-wider text-cream/60"
    >
      {{ label }}
    </label>

    <input
      :type="inputType"
      :autocomplete="autocomplete"
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="w-full rounded-lg border border-cream/[0.14] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ember-500/30 disabled:opacity-50"
      :disabled="disabled"
    />

    <p v-if="fieldErrors" class="text-xs text-rust-400">{{ fieldErrors }}</p>
  </div>
</template>

<script>
export default {
  name: "TextInput",
  props: {
    label: String,
    modelValue: String,
    inputType: {
      type: String,
      default: "text",
    },
    placeholder: {
      type: String,
      required: true,
    },
    disabled: Boolean,
    autocomplete: String,
    fieldErrors: {
      type: String,
      default: "",
    },
  },
};
</script>
