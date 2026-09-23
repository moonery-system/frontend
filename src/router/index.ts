import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import NotFoundView from "@/views/NotFoundView.vue";
import UnauthorizedView from "@/views/UnauthorizedView.vue";
import { isTokenValid, hasPermission, hasAnyPermission } from "@/services/auth";
import ClientsListView from "@/views/clients/ClientsListView.vue";
import LoginView from "@/views/auth/LoginView.vue";
import InviteView from "@/views/auth/InviteView.vue";
import ClientsDetailView from "@/views/clients/ClientsDetailView.vue";
import ClientsCreateView from "@/views/clients/ClientsCreateView.vue";
import ClientsEditView from "@/views/clients/ClientsEditView.vue";
import DeliveriesListView from "@/views/deliveries/DeliveriesListView.vue";
import DeliveriesCreateView from "@/views/deliveries/DeliveriesCreateView.vue";
import DeliveriesDetailView from "@/views/deliveries/DeliveriesDetailView.vue";
import UsersListView from "@/views/users/UsersListView.vue";
import UsersCreateView from "@/views/users/UsersCreateView.vue";
import UsersEditView from "@/views/users/UsersEditView.vue";

const routes = [
  { path: "/login", component: LoginView, meta: { guestOnly: true } },
  { path: "/invite", component: InviteView, meta: { guestOnly: true } },
  {
    path: "/",
    component: HomeView,
    meta: { requiresAuth: true },
  },
  {
    path: "/clients",
    component: ClientsListView,
    meta: {
      requiresAuth: true,
      requiredPermissions: ["clients.viewAny"],
    },
  },
  {
    path: "/clients/:id",
    component: ClientsDetailView,
    meta: {
      requiresAuth: true,
      requiredPermissions: ["clients.view"],
    },
  },
  {
    path: "/clients/create",
    component: ClientsCreateView,
    meta: {
      requiresAuth: true,
      requiredPermissions: ["clients.create"],
    },
  },
  {
    path: "/clients/:id/edit",
    component: ClientsEditView,
    meta: {
      requiresAuth: true,
      requiredPermissions: ["clients.update"],
    },
  },
  {
    path: "/deliveries",
    component: DeliveriesListView,
    meta: {
      requiresAuth: true,
      requiredPermissions: ["deliveries.viewAny"],
    },
  },
  {
    path: "/deliveries/create",
    component: DeliveriesCreateView,
    meta: {
      requiresAuth: true,
      requiredPermissions: ["deliveries.create"],
    },
  },
  {
    path: "/deliveries/:id",
    component: DeliveriesDetailView,
    meta: {
      requiresAuth: true,
      requiredPermissions: ["deliveries.view"],
    },
  },
  {
    path: "/users",
    component: UsersListView,
    meta: {
      requiresAuth: true,
      requiredPermissions: ["users.viewAny"],
    },
  },
  {
    path: "/users/create",
    component: UsersCreateView,
    meta: {
      requiresAuth: true,
      requiredPermissions: ["users.create"],
    },
  },
  {
    path: "/users/:id/edit",
    component: UsersEditView,
    meta: {
      requiresAuth: true,
      requiredPermissions: ["users.update"],
    },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFoundView,
  },
  {
    path: "/unauthorized",
    component: UnauthorizedView,
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
    return next("/");
  }

  if (to.meta.requiredPermissions && isLoggedIn) {
    const permissions = to.meta.requiredPermissions as string[];

    const hasRequiredPermission = await hasAnyPermission(permissions);

    if (!hasRequiredPermission) {
      return next("/unauthorized");
    }
  }

  if (to.meta.requiredAllPermissions && isLoggedIn) {
    const permissions = to.meta.requiredAllPermissions as string[];

    const hasAllPermissions = await Promise.all(
      permissions.map((permission) => hasPermission(permission))
    );

    if (!hasAllPermissions.every(Boolean)) {
      return next("/unauthorized");
    }
  }

  next();
});

export default router;
