const express = require("express");
const {
  createAnnouncement,
  createPromoCode,
  getDashboard,
  reorderGalleryItems,
  toggleGalleryVisibility,
  updateSiteContent
} = require("../controllers/adminController");
const { createAdminSession, requireAdminAuth } = require("../middleware/adminAuth");

const router = express.Router();

router.post("/session", createAdminSession);
router.use(requireAdminAuth);

router.get("/dashboard", getDashboard);
router.post("/announcements", createAnnouncement);
router.post("/promos", createPromoCode);
router.put("/content", updateSiteContent);
router.patch("/gallery/:id/visibility", toggleGalleryVisibility);
router.post("/gallery/reorder", reorderGalleryItems);

module.exports = router;
