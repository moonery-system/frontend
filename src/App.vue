<template>
  <div id="app">
    <NavbarLayout />
  </div>
</template>

<script>
import NavbarLayout from "./components/NavBar.vue";

export default {
  name: "App",
  components: {
    NavbarLayout,
  },
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
  line-height: 1.6;
  color: #374151;
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
</style>
