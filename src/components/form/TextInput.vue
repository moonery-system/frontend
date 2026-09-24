<!-- eslint-disable prettier/prettier -->
<template>
  <div class="space-y-1">
    <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {{ label }}
    </label>

    <input
        :type="inputType"
        :autocomplete="autocomplete"
        :placeholder="placeholder"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        :disabled="disabled"
    />

    <p v-if="fieldErrors" class="text-xs text-red-600">{{ fieldErrors }}</p>
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
