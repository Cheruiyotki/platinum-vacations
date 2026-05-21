export const JSON_HEADERS = {
  "Content-Type": "application/json"
};

const ADMIN_TOKEN_KEY = "platinumVacationsAdminToken";

export function getAdminToken() {
  return window.localStorage.getItem(ADMIN_TOKEN_KEY) || "";
}

export function setAdminToken(token) {
  window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function adminHeaders(headers = {}) {
  const token = getAdminToken();

  return token
    ? {
        ...headers,
        Authorization: `Bearer ${token}`
      }
    : headers;
}

export async function readJson(response, fallbackMessage) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || fallbackMessage);
    error.status = response.status;
    throw error;
  }

  return data;
}
