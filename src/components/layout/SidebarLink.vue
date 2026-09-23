<template>
  <router-link
    :to="to"
    custom
    v-slot="{ href, navigate, isActive, isExactActive }"
  >
    <a
      :href="href"
      @click="navigate"
      class="group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-semibold transition-colors duration-200 active:bg-cream/[0.09]"
      :class="
        (exact ? isExactActive : isActive)
          ? 'bg-cream/[0.06] text-cream'
          : 'text-cream/60 hover:bg-cream/[0.04] hover:text-cream'
      "
    >
      <!-- Accent bar: grows in on the active item, previews on hover -->
      <span
        class="absolute left-0 top-1/2 w-[3px] -translate-y-1/2 rounded-r-full bg-ember-500 transition-all duration-200"
        :class="
          (exact ? isExactActive : isActive)
            ? 'h-5 opacity-100'
            : 'h-2 opacity-0 group-hover:opacity-60'
        "
      />
      <AppIcon
        :name="icon"
        :size="18"
        class="shrink-0 transition-colors duration-200"
        :class="
          (exact ? isExactActive : isActive)
            ? 'text-gold-400'
            : 'text-cream/45 group-hover:text-gold-400'
        "
      />
      <span class="truncate">{{ label }}</span>
    </a>
  </router-link>
</template>

<script setup lang="ts">
import AppIcon from "@/components/ui/AppIcon.vue";

defineProps({
  to: { type: String, required: true },
  label: { type: String, required: true },
  icon: { type: String, required: true },
  exact: { type: Boolean, default: false },
});
</script>
