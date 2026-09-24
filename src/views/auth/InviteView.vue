<template>
  <div class="invite">
    <AuthInvite />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import AuthInvite from "@/components/auth/AuthInvite.vue";

export default defineComponent({
  name: "InviteView",
  components: {
    AuthInvite,
  },
});
</script>
