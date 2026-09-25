<template>
  <span
    class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold"
    :class="toneClass"
  >
    <AppIcon name="bot" :size="12" />
    {{ label.text }}
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import { handoffLabel } from "@/utils/handoff";
import type { HandoffTone } from "@/utils/handoff";

const props = defineProps<{ reason?: string | null }>();

const label = computed(() => handoffLabel(props.reason));

// Written out in full, one string per tone: Tailwind purges classes it cannot find in the
// source, so they must not be assembled at runtime. The text says the same as the colour.
const TONES: Record<HandoffTone, string> = {
  attention: "border-gold-400/30 bg-gold-400/10 text-gold-300",
  problem: "border-rust-400/30 bg-rust-500/10 text-rust-400",
  neutral: "border-cream/15 bg-cream/[0.05] text-cream/65",
};

const toneClass = computed(() => TONES[label.value.tone]);
</script>
