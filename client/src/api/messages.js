import { API_BASE } from "./base";

export async function logAssistantMessage(payload) {
  const response = await fetch(`${API_BASE}/api/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to log assistant message.");
  }

  return data;
}
