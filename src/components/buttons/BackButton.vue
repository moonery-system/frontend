<template>
  <button
    type="button"
    @click="$router.push('/clients')"
    class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-cream/[0.03] text-cream/85 hover:bg-cream/[0.06] transition-colors duration-200"
  >
    Cancel
  </button>
</template>

<script>
export default {
  name: "BackButton",
  props: {
    redirect: {
      type: String,
      required: true,
    },
  },
};
</script>
