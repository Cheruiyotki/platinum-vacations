import { API_BASE } from "./base";

function normalizeReview(review, index = 0) {
  const safeReview = typeof review === "object" && review !== null ? review : {};

  return {
    id: safeReview.id ?? `review-${index + 1}`,
    name:
      typeof safeReview.name === "string" && safeReview.name.trim()
        ? safeReview.name.trim()
        : "Anonymous",
    review_text:
      typeof safeReview.review_text === "string" && safeReview.review_text.trim()
        ? safeReview.review_text.trim()
        : "",
    rating: Number.isFinite(Number(safeReview.rating)) ? Number(safeReview.rating) : 5,
    approved: Boolean(safeReview.approved)
  };
}

async function readJson(response, fallbackMessage) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
}

export async function fetchApprovedReviews() {
  const response = await fetch(`${API_BASE}/api/reviews`);
  const data = await readJson(response, "Could not load reviews at this time.");

  if (!Array.isArray(data)) {
    throw new Error("Invalid review data received.");
  }

  return data.map(normalizeReview);
}

export async function fetchAdminReviews() {
  const response = await fetch(`${API_BASE}/api/reviews/admin`);
  const data = await readJson(response, "Could not load admin reviews at this time.");

  if (!Array.isArray(data)) {
    throw new Error("Invalid admin review data received.");
  }

  return data.map(normalizeReview);
}

export async function createReview(payload) {
  const response = await fetch(`${API_BASE}/api/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await readJson(response, "Failed to submit review.");

  return {
    message: data.message || "Review submitted successfully.",
    review: normalizeReview(data.review, 0)
  };
}

export async function toggleReviewApproval(reviewId) {
  const response = await fetch(`${API_BASE}/api/reviews/${reviewId}/approval`, {
    method: "PATCH"
  });

  const data = await readJson(response, "Failed to update review approval.");
  return normalizeReview(data, 0);
}

export async function deleteReview(reviewId) {
  const response = await fetch(`${API_BASE}/api/reviews/${reviewId}`, {
    method: "DELETE"
  });

  return readJson(response, "Failed to delete review.");
}
