import { API_BASE } from "./base";

export async function requestStkPush(payload) {
  const response = await fetch(`${API_BASE}/api/payments/stk-push`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to send the M-Pesa prompt.");
  }

  return data;
}
