<template>
  <div v-if="error" class="mx-auto max-w-sm py-20 text-center">
    <div
      class="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-xl border border-rust-500/30 bg-rust-500/10 text-rust-400"
    >
      <AppIcon name="alert" :size="22" />
    </div>
    <h3 class="font-display text-lg font-bold tracking-tight text-cream">
      We could not load this page
    </h3>
    <p class="mt-2 text-sm leading-6 text-cream/60">{{ error }}</p>
    <button
      @click="tryAgain"
      class="mt-7 inline-flex items-center rounded-lg bg-ember-500 px-4 py-2 text-sm font-semibold text-ink-950 transition-colors duration-200 hover:bg-ember-400 active:bg-ember-600"
    >
      Try again
    </button>
  </div>
</template>

<script>
import AppIcon from "@/components/ui/AppIcon.vue";

export default {
  name: "ErrorLoading",
  components: { AppIcon },
  props: {
    error: String,
    retry: Function,
  },
  methods: {
    tryAgain() {
      this.$emit("retry");
    },
  },
};
</script>
