<template>
  <div class="surface mb-6">
    <div class="p-6 sm:p-8">
      <div class="flex items-start gap-6 sm:gap-8">
        <div class="flex-shrink-0">
          <div
            class="grid h-20 w-20 place-items-center rounded-xl bg-gold-400/15"
          >
            <span class="font-display text-3xl font-extrabold text-gold-400">
              {{ name.charAt(0).toUpperCase() }}
            </span>
          </div>
          <div class="mt-3 text-center">
            <span
              class="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold leading-none ring-1 ring-inset ring-cream/10"
              :class="statusClasses"
            >
              <div
                class="w-1.5 h-1.5 rounded-full mr-1.5"
                :class="statusDotClasses"
              ></div>
              {{ clientStatus }}
            </span>
          </div>
        </div>

        <div class="flex-1 min-w-0">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div>
                <label
                  class="text-[11px] font-semibold uppercase tracking-[0.12em] text-cream/50"
                  >Full Name</label
                >
                <p class="mt-1.5 font-display text-lg font-bold text-cream">
                  {{ name }}
                </p>
              </div>

              <div>
                <label
                  class="text-[11px] font-semibold uppercase tracking-[0.12em] text-cream/50"
                  >Email Address</label
                >
                <p class="mt-1.5 text-cream">
                  <a
                    :href="`mailto:${email}`"
                    class="hover:text-ember-400 transition-colors duration-200"
                    >{{ email }}</a
                  >
                </p>
              </div>

              <div>
                <label
                  class="text-[11px] font-semibold uppercase tracking-[0.12em] text-cream/50"
                  >Client ID</label
                >
                <p class="mt-1 text-cream font-mono text-sm">#{{ id }}</p>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <label
                  class="text-[11px] font-semibold uppercase tracking-[0.12em] text-cream/50"
                  >Activated</label
                >
                <p class="mt-1.5 text-cream">{{ formatDate(activated_at) }}</p>
              </div>

              <div>
                <label
                  class="text-[11px] font-semibold uppercase tracking-[0.12em] text-cream/50"
                  >Created</label
                >
                <p class="mt-1.5 text-cream">{{ formatDate(created_at) }}</p>
              </div>

              <div>
                <label
                  class="text-[11px] font-semibold uppercase tracking-[0.12em] text-cream/50"
                  >Last Updated</label
                >
                <p class="mt-1.5 text-cream">{{ formatDate(updated_at) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatDateTime } from "@/utils/date";

export default {
  name: "ClientCard",
  props: {
    id: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    activated_at: {
      type: [String, Date],
      required: true,
    },
    created_at: {
      type: [String, Date],
      required: true,
    },
    updated_at: {
      type: [String, Date],
      required: true,
    },
  },
  computed: {
    clientStatus() {
      return this.activated_at ? "Active" : "Inactive";
    },
    statusClasses() {
      const isActive = this.activated_at;
      return isActive
        ? "bg-moss-500/15 text-moss-400"
        : "bg-cream/[0.06] text-cream";
    },
    statusDotClasses() {
      const isActive = this.activated_at;
      return isActive ? "bg-moss-400" : "bg-cream/40";
    },
  },
  methods: {
    formatDate(date) {
      return formatDateTime(date);
    },
  },
};
</script>
