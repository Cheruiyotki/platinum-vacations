export const JSON_HEADERS = {
  "Content-Type": "application/json"
};

export async function readJson(response, fallbackMessage) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
}
