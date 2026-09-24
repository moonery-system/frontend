<template>
  <!-- One live region whose content changes, so each change is announced once. -->
  <div role="status" aria-live="polite" class="px-4">
    <p
      v-if="handedOff"
      class="mb-2 flex items-start gap-2 rounded-lg border border-cream/10 bg-cream/[0.04] px-3 py-2 text-xs leading-5 text-cream/75"
    >
      <AppIcon name="headset" :size="14" class="mt-[3px] shrink-0" />
      <span>
        This conversation was handed over to support. A person will reply here
        soon.
      </span>
    </p>

    <p
      v-else-if="phase === 'waiting'"
      class="mb-2 flex items-center gap-2 text-xs text-cream/65"
    >
      <span class="flex gap-1" aria-hidden="true">
        <span
          class="h-1.5 w-1.5 rounded-full bg-gold-400 motion-safe:animate-pulse"
        ></span>
        <span
          class="h-1.5 w-1.5 rounded-full bg-gold-400 motion-safe:animate-pulse [animation-delay:200ms]"
        ></span>
        <span
          class="h-1.5 w-1.5 rounded-full bg-gold-400 motion-safe:animate-pulse [animation-delay:400ms]"
        ></span>
      </span>
      The assistant is replying…
    </p>

    <p
      v-else-if="phase === 'timed_out'"
      class="mb-2 flex items-start gap-2 rounded-lg border border-gold-400/25 bg-gold-400/10 px-3 py-2 text-xs leading-5 text-cream/80"
    >
      <AppIcon
        name="alert"
        :size="14"
        class="mt-[3px] shrink-0 text-gold-300"
      />
      <span>
        This is taking longer than usual. Your message was received; if the
        assistant can't answer, support takes over.
      </span>
    </p>
  </div>
</template>

<script setup lang="ts">
import AppIcon from "@/components/ui/AppIcon.vue";
import type { WaitingPhase } from "@/composables/useAssistantWaiting";

defineProps<{
  phase: WaitingPhase;
  handedOff: boolean;
}>();
</script>
