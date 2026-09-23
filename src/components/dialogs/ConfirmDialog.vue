<template>
  <!-- Backdrop -->
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-ink-950/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click="handleBackdropClick"
  >
    <!-- Dialog -->
    <div
      class="w-full max-w-md transform rounded-xl border border-cream/[0.14] bg-ink-800 shadow-float transition-all duration-200"
      :class="{
        'scale-100 opacity-100': isOpen,
        'scale-95 opacity-0': !isOpen,
      }"
      @click.stop
    >
      <!-- Header -->
      <div class="p-6 pb-4">
        <div class="flex items-center space-x-3">
          <!-- Icon -->
          <div class="flex-shrink-0">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-lg"
              :class="iconClasses"
            >
              <svg
                class="w-6 h-6"
                :class="iconColorClasses"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  v-if="type === 'danger'"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                />
                <path
                  v-else-if="type === 'warning'"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                <path
                  v-else
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <!-- Title and Description -->
          <div class="flex-1 min-w-0">
            <h3
              class="font-display text-lg font-bold tracking-tight text-cream"
            >
              {{ title }}
            </h3>
            <p v-if="description" class="text-sm text-cream/65 mt-1">
              {{ description }}
            </p>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div v-if="$slots.default" class="px-6 pb-4">
        <slot />
      </div>

      <!-- Actions -->
      <div
        class="flex items-center justify-end gap-3 rounded-b-xl border-t border-cream/10 bg-ink-900/60 px-6 py-4"
      >
        <button
          @click="cancel"
          :disabled="loading"
          class="px-4 py-2 text-sm font-medium text-cream/85 bg-transparent border border-cream/20 rounded-lg hover:bg-cream/[0.06] active:bg-cream/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-ink-800 focus:ring-cream/40 transition-colors duration-200 disabled:opacity-50"
        >
          {{ cancelText }}
        </button>

        <button
          @click="confirm"
          :disabled="loading"
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-ink-950 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-ink-800 transition-colors duration-200 disabled:opacity-50"
          :class="confirmButtonClasses"
        >
          <svg
            v-if="loading"
            class="animate-spin -ml-1 mr-2 h-4 w-4 text-ink-950"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {{ loading ? loadingText : confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ConfirmDialog",
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: "danger", // danger, warning, info
      validator: (value) => ["danger", "warning", "info"].includes(value),
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    confirmText: {
      type: String,
      default: "Confirm",
    },
    cancelText: {
      type: String,
      default: "Cancel",
    },
    loadingText: {
      type: String,
      default: "Processing...",
    },
    loading: {
      type: Boolean,
      default: false,
    },
    closeOnBackdrop: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["confirm", "cancel", "close"],
  computed: {
    iconClasses() {
      const classes = {
        danger: "bg-rust-500/15",
        warning: "bg-gold-400/15",
        info: "bg-ember-500/15",
      };
      return classes[this.type];
    },
    iconColorClasses() {
      const classes = {
        danger: "text-rust-400",
        warning: "text-gold-400",
        info: "text-ember-400",
      };
      return classes[this.type];
    },
    confirmButtonClasses() {
      const classes = {
        danger:
          "bg-rust-500 hover:bg-rust-400 active:bg-rust-500 focus:ring-rust-500/60",
        warning: "bg-gold-400 hover:bg-gold-300 focus:ring-gold-400/60",
        info: "bg-ember-500 hover:bg-ember-400 active:bg-ember-600 focus:ring-ember-500/60",
      };
      return classes[this.type];
    },
  },
  methods: {
    confirm() {
      this.$emit("confirm");
    },
    cancel() {
      this.$emit("cancel");
      this.$emit("close");
    },
    handleBackdropClick() {
      if (this.closeOnBackdrop && !this.loading) {
        this.cancel();
      }
    },
  },
  mounted() {
    // Prevent body scroll when dialog is open
    if (this.isOpen) {
      document.body.style.overflow = "hidden";
    }
  },
  beforeUnmount() {
    // Restore body scroll
    document.body.style.overflow = "";
  },
  watch: {
    isOpen(newVal) {
      if (newVal) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    },
  },
};
</script>
