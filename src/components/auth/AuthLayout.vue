<template>
  <div
    class="min-h-screen bg-ink-950 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
  >
    <!-- Brand panel -->
    <aside
      class="relative flex flex-col justify-between overflow-hidden border-b border-cream/10 bg-ink-900 px-6 py-8 sm:px-10 lg:min-h-screen lg:border-b-0 lg:border-r lg:px-14 lg:py-14"
    >
      <img
        :src="logoFull"
        alt="Moonery"
        class="relative h-24 w-24 select-none lg:h-40 lg:w-40"
        draggable="false"
      />

      <div class="relative mt-8 hidden lg:block">
        <p class="eyebrow">Night logistics</p>
        <h2
          class="mt-4 max-w-sm font-display text-4xl font-extrabold leading-[1.08] text-cream"
          style="letter-spacing: -0.03em"
        >
          Every parcel accounted for, from the last pickup to the doorstep.
        </h2>
        <ul class="mt-10 space-y-4 text-[15px] leading-6 text-cream/60">
          <li class="flex gap-3">
            <span class="mt-2.5 h-px w-5 shrink-0 bg-ember-500" />
            Status changes reach you the moment a driver moves a parcel.
          </li>
          <li class="flex gap-3">
            <span class="mt-2.5 h-px w-5 shrink-0 bg-ember-500" />
            One open thread with the support desk, always a message away.
          </li>
        </ul>
      </div>

      <p class="relative mt-10 hidden text-xs text-cream/40 lg:block">
        Moonery Logistics
      </p>
    </aside>

    <!-- Form side -->
    <main class="flex items-center px-6 py-12 sm:px-10 lg:px-16 xl:px-24">
      <div class="mx-auto w-full max-w-sm animate-rise">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import logoFull from "@/assets/logo-full.png";
</script>
