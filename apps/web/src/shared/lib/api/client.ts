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
  (error) => Promise.reject(error),
);