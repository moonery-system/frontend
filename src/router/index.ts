// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import DashboardView from "../views/DashboardView.vue";
import { isTokenValid } from "../services/auth";

const routes = [
  {
    path: "/login",
    component: LoginView,
    meta: { guestOnly: true },
  },
  {
    path: "/dashboard",
    component: DashboardView,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const isLoggedIn = await isTokenValid();

  if (to.meta.requiresAuth && !isLoggedIn) {
    return next("/login");
  }

  if (to.meta.guestOnly && isLoggedIn) {
    return next("/dashboard");
  }

  return next();
});

export default router;
