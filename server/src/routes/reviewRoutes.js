const express = require("express");
const {
  createReview,
  deleteReview,
  getAdminReviews,
  getApprovedReviews,
  toggleReviewApproval
} = require("../controllers/reviewController");
const { requireAdminAuth } = require("../middleware/adminAuth");

const router = express.Router();

router.get("/", getApprovedReviews);
router.get("/admin", requireAdminAuth, getAdminReviews);
router.post("/", createReview);
router.patch("/:id/approval", requireAdminAuth, toggleReviewApproval);
router.delete("/:id", requireAdminAuth, deleteReview);

module.exports = router;
