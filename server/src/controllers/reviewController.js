const { getPool, hasDatabaseConfig } = require("../db/pool");

const REVIEW_FIELDS = `
  id,
  name,
  review_text,
  rating,
  approved,
  created_at,
  updated_at
`;

function normalizeReviewPayload(body = {}) {
  return {
    name: typeof body.name === "string" ? body.name.trim() : "",
    review_text: typeof body.review_text === "string" ? body.review_text.trim() : "",
    rating: Number.parseInt(body.rating, 10) || 5
  };
}

function validateReviewPayload(payload) {
  if (!payload.name) {
    return "Name is required.";
  }

  if (!payload.review_text) {
    return "Review text is required.";
  }

  if (!Number.isFinite(payload.rating) || payload.rating < 1 || payload.rating > 5) {
    return "Rating must be between 1 and 5.";
  }

  return "";
}

async function getReviewsQuery({ approvedOnly }) {
  const query = `
    SELECT
      ${REVIEW_FIELDS}
    FROM reviews
    ${approvedOnly ? "WHERE approved = TRUE" : ""}
    ORDER BY created_at DESC, id DESC;
  `;

  const { rows } = await getPool().query(query);
  return rows;
}

async function fetchReviewById(reviewId) {
  const query = `
    SELECT
      ${REVIEW_FIELDS}
    FROM reviews
    WHERE id = $1
    LIMIT 1;
  `;

  const { rows } = await getPool().query(query, [reviewId]);
  return rows[0] || null;
}

async function getApprovedReviews(_req, res) {
  if (!hasDatabaseConfig()) {
    return res.status(503).json({
      message: "Reviews are temporarily unavailable. Configure DATABASE_URL and try again."
    });
  }

  try {
    const rows = await getReviewsQuery({ approvedOnly: true });
    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return res.status(500).json({ message: "Failed to fetch reviews." });
  }
}

async function getAdminReviews(_req, res) {
  if (!hasDatabaseConfig()) {
    return res.status(503).json({
      message: "Reviews are temporarily unavailable. Configure DATABASE_URL and try again."
    });
  }

  try {
    const rows = await getReviewsQuery({ approvedOnly: false });
    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching admin reviews:", error);
    return res.status(500).json({ message: "Failed to fetch admin reviews." });
  }
}

async function createReview(req, res) {
  if (!hasDatabaseConfig()) {
    return res.status(503).json({
      message: "Reviews are temporarily unavailable. Configure DATABASE_URL and try again."
    });
  }

  const payload = normalizeReviewPayload(req.body);
  const validationError = validateReviewPayload(payload);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const query = `
      INSERT INTO reviews (name, review_text, rating, approved)
      VALUES ($1, $2, $3, FALSE)
      RETURNING ${REVIEW_FIELDS};
    `;

    const { rows } = await getPool().query(query, [
      payload.name,
      payload.review_text,
      payload.rating
    ]);

    return res.status(201).json({
      message: "Thanks for your feedback. Your review has been received and is awaiting approval.",
      review: rows[0]
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return res.status(500).json({ message: "Failed to submit review." });
  }
}

async function toggleReviewApproval(req, res) {
  if (!hasDatabaseConfig()) {
    return res.status(503).json({
      message: "Reviews are temporarily unavailable. Configure DATABASE_URL and try again."
    });
  }

  const reviewId = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(reviewId)) {
    return res.status(400).json({ message: "A valid review id is required." });
  }

  try {
    const existingReview = await fetchReviewById(reviewId);
    if (!existingReview) {
      return res.status(404).json({ message: "Review not found." });
    }

    const query = `
      UPDATE reviews
      SET
        approved = $1,
        updated_at = NOW()
      WHERE id = $2
      RETURNING ${REVIEW_FIELDS};
    `;

    const { rows } = await getPool().query(query, [!existingReview.approved, reviewId]);
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error toggling review approval:", error);
    return res.status(500).json({ message: "Failed to update review approval." });
  }
}

async function deleteReview(req, res) {
  if (!hasDatabaseConfig()) {
    return res.status(503).json({
      message: "Reviews are temporarily unavailable. Configure DATABASE_URL and try again."
    });
  }

  const reviewId = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(reviewId)) {
    return res.status(400).json({ message: "A valid review id is required." });
  }

  try {
    const query = `
      DELETE FROM reviews
      WHERE id = $1
      RETURNING id;
    `;

    const { rows } = await getPool().query(query, [reviewId]);
    if (!rows.length) {
      return res.status(404).json({ message: "Review not found." });
    }

    return res.status(200).json({ message: "Review deleted successfully." });
  } catch (error) {
    console.error("Error deleting review:", error);
    return res.status(500).json({ message: "Failed to delete review." });
  }
}

module.exports = {
  createReview,
  deleteReview,
  getAdminReviews,
  getApprovedReviews,
  toggleReviewApproval
};
