const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? "http://localhost:5000" : "");

export const API_BASE = apiBaseUrl.replace(/\/$/, "");
