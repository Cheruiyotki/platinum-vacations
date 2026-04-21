const express = require("express");
const {
  createReview,
  deleteReview,
  getAdminReviews,
  getApprovedReviews,
  toggleReviewApproval
} = require("../controllers/reviewController");

const router = express.Router();

router.get("/", getApprovedReviews);
router.get("/admin", getAdminReviews);
router.post("/", createReview);
router.patch("/:id/approval", toggleReviewApproval);
router.delete("/:id", deleteReview);

module.exports = router;
