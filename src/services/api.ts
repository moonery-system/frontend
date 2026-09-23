import axios from "axios";

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Endpoints that must never trigger a refresh attempt. /auth/user is called by the
 * router guard on every navigation, so letting its 401 kick off a refresh that calls
 * /auth/user again would hang the app.
 */
const NO_REFRESH = ["/auth/refresh", "/auth/user", "/auth/login"];

function skipsRefresh(url?: string): boolean {
  return !!url && NO_REFRESH.some((path) => url.includes(path));
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config;
    const status = error?.response?.status;

    // The token lives 60 minutes. On the first 401, trade it for a fresh one and
    // replay the request once -- never more than once, or a persistent 401 loops.
    if (
      status === 401 &&
      config &&
      !config._retried &&
      !skipsRefresh(config.url)
    ) {
      config._retried = true;

      try {
        await api.post("/auth/refresh");
        return await api(config);
      } catch (refreshFailed) {
        // Falls through: the router guard sends the user to /login on the next check.
      }
    }

    return Promise.reject({
      status,
      message: error?.response?.data?.message || "Unexpected error",
      errors: error?.response?.data?.errors || null,
    });
  }
);

export default api;
