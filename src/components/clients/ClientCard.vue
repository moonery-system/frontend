<template>
  <div class="bg-white rounded-xl border border-gray-100 shadow-sm mb-6">
    <div class="p-6">
      <div class="flex items-start space-x-6">
        <div class="flex-shrink-0">
          <div
            class="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center"
          >
            <span class="text-gray-600 font-medium text-2xl">
              {{ name.charAt(0).toUpperCase() }}
            </span>
          </div>
          <div class="mt-3 text-center">
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
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
                  class="text-xs font-medium text-gray-500 uppercase tracking-wide"
                  >Full Name</label
                >
                <p class="mt-1 text-lg font-medium text-gray-900">{{ name }}</p>
              </div>

              <div>
                <label
                  class="text-xs font-medium text-gray-500 uppercase tracking-wide"
                  >Email Address</label
                >
                <p class="mt-1 text-gray-900">
                  <a
                    :href="`mailto:${email}`"
                    class="hover:text-blue-600 transition-colors duration-200"
                    >{{ email }}</a
                  >
                </p>
              </div>

              <div>
                <label
                  class="text-xs font-medium text-gray-500 uppercase tracking-wide"
                  >Client ID</label
                >
                <p class="mt-1 text-gray-900 font-mono text-sm">#{{ id }}</p>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <label
                  class="text-xs font-medium text-gray-500 uppercase tracking-wide"
                  >Activated</label
                >
                <p class="mt-1 text-gray-900">{{ formatDate(activated_at) }}</p>
              </div>

              <div>
                <label
                  class="text-xs font-medium text-gray-500 uppercase tracking-wide"
                  >Created</label
                >
                <p class="mt-1 text-gray-900">{{ formatDate(created_at) }}</p>
              </div>

              <div>
                <label
                  class="text-xs font-medium text-gray-500 uppercase tracking-wide"
                  >Last Updated</label
                >
                <p class="mt-1 text-gray-900">{{ formatDate(updated_at) }}</p>
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
        ? "bg-green-100 text-green-800"
        : "bg-gray-100 text-gray-800";
    },
    statusDotClasses() {
      const isActive = this.activated_at;
      return isActive ? "bg-green-400" : "bg-gray-400";
    },
  },
  methods: {
    formatDate(date) {
      return formatDateTime(date);
    },
  },
};
</script>
