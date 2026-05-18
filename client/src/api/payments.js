import { API_BASE } from "./base";
import { JSON_HEADERS, readJson } from "./http";

export async function requestStkPush(payload) {
  const response = await fetch(`${API_BASE}/api/payments/stk-push`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload)
  });

  return readJson(response, "Failed to send the M-Pesa prompt.");
}
