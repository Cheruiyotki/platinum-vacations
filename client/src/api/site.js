import { API_BASE } from "./base";

function normalizeGalleryItem(item, index) {
  const safeItem = typeof item === "object" && item !== null ? item : {};

  return {
    id: safeItem.id ?? index + 1,
    src:
      typeof safeItem.src === "string" && safeItem.src.trim() ? safeItem.src.trim() : "/assets/image_1.png",
    location:
      typeof safeItem.location === "string" && safeItem.location.trim()
        ? safeItem.location.trim()
        : "Location"
  };
}

export async function fetchVisibleGalleryItems() {
  const response = await fetch(`${API_BASE}/api/site/gallery`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to load gallery items.");
  }

  if (!Array.isArray(data)) {
    throw new Error("Invalid gallery data received.");
  }

  return data.map(normalizeGalleryItem);
}
