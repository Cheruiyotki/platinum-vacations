import { API_BASE } from "./base";
import { JSON_HEADERS, readJson } from "./http";

export async function logAssistantMessage(payload) {
  const response = await fetch(`${API_BASE}/api/messages`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload)
  });

  return readJson(response, "Failed to log assistant message.");
}
