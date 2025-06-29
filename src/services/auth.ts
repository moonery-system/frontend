import api from "./api";

export async function isTokenValid() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    await api.get("/auth/user");
    return true;
  } catch (error) {
    localStorage.removeItem("token");
    return false;
  }
}
