const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export async function fetchPackages() {
  const response = await fetch(`${API_BASE}/api/packages`);

  if (!response.ok) {
    throw new Error("Could not load packages at this time.");
  }

  return response.json();
}
