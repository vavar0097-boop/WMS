import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "";

const normalizedBaseUrl = rawBaseUrl.replace(/\/$/, "");

const baseURL = normalizedBaseUrl
  ? `${normalizedBaseUrl}/api`
  : "/api";

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const currentPath = window.location.pathname;

    if (status === 401 && currentPath !== "/login") {
      window.dispatchEvent(
        new CustomEvent("wms:auth-expired"),
      );
    }

    return Promise.reject(error);
  },
);