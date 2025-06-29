<template>
  <div>
    <input v-model="email" placeholder="Email" />
    <input v-model="password" placeholder="Senha" type="password" />
    <button @click="login">Entrar</button>
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script>
import api from "../../services/api";

export default {
  name: "AuthLogin",
  data() {
    return {
      email: "",
      password: "",
      error: "",
    };
  },
  methods: {
    async login() {
      try {
        const response = await api.post("/auth/login", {
          email: this.email,
          password: this.password,
        });
        const token = response.data.data;
        console.log(response);
        localStorage.setItem("token", token);
        this.$router.push("/dashboard");
      } catch (err) {
        if (err.response && err.response.data) {
          const data = err.response.data;

          if (data.errors && data.errors.email) {
            this.error = data.errors.email[0];
          } else if (data.message) {
            this.error = data.message;
          } else {
            this.error = "Erro desconhecido.";
          }
        } else {
          this.error = "Erro de rede ou do servidor.";
        }
      }
    },
  },
};
</script>
