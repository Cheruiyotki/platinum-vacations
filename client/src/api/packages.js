const FALLBACK_IMAGE = "/assets/image_6.webp";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? "http://localhost:5000" : "");
const API_BASE = apiBaseUrl.replace(/\/$/, "");

function normalizeList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => typeof item === "string" && item.trim())
    .map((item) => item.trim());
}

function normalizeDeposit(value) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : 0;
}

function normalizePackage(travelPackage, index) {
  const safePackage = typeof travelPackage === "object" && travelPackage !== null ? travelPackage : {};
  const safeSlug = typeof safePackage.slug === "string" && safePackage.slug.trim() ? safePackage.slug.trim() : `package-${index + 1}`;

  return {
    id: safePackage.id ?? safeSlug,
    slug: safeSlug,
    title:
      typeof safePackage.title === "string" && safePackage.title.trim()
        ? safePackage.title.trim()
        : "Untitled Adventure",
    cost:
      typeof safePackage.cost === "string" && safePackage.cost.trim()
        ? safePackage.cost.trim()
        : "Price available on request",
    dates:
      typeof safePackage.dates === "string" && safePackage.dates.trim()
        ? safePackage.dates.trim()
        : "Dates to be confirmed",
    duration_banner:
      typeof safePackage.duration_banner === "string" && safePackage.duration_banner.trim()
        ? safePackage.duration_banner.trim()
        : "",
    date_pill:
      typeof safePackage.date_pill === "string" && safePackage.date_pill.trim()
        ? safePackage.date_pill.trim()
        : "",
    description:
      typeof safePackage.description === "string" && safePackage.description.trim()
        ? safePackage.description.trim()
        : "",
    includes_json: normalizeList(safePackage.includes_json),
    excludes_json: normalizeList(safePackage.excludes_json),
    pickup_point:
      typeof safePackage.pickup_point === "string" && safePackage.pickup_point.trim()
        ? safePackage.pickup_point.trim()
        : "",
    note:
      typeof safePackage.note === "string" && safePackage.note.trim() ? safePackage.note.trim() : "",
    image_url:
      typeof safePackage.image_url === "string" && safePackage.image_url.trim()
        ? safePackage.image_url.trim()
        : FALLBACK_IMAGE,
    deposit_required: normalizeDeposit(safePackage.deposit_required)
  };
}

export async function fetchPackages() {
  const response = await fetch(`${API_BASE}/api/packages`);

  if (!response.ok) {
    throw new Error("Could not load packages at this time.");
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("Invalid package data received.");
  }

  return data.map(normalizePackage);
}
