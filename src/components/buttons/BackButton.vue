<template>
  <button
    type="button"
    @click="$router.push('/clients')"
    class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition"
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
