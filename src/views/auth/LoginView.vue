<template>
  <div class="home">
    <AuthLogin />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import AuthLogin from "@/components/auth/AuthLogin.vue";

export default defineComponent({
  name: "LoginView",
  components: {
    AuthLogin,
  },
});
</script>
