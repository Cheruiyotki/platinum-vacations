const express = require("express");
const {
  createAnnouncement,
  createPromoCode,
  getDashboard,
  reorderGalleryItems,
  toggleGalleryVisibility,
  updateSiteContent
} = require("../controllers/adminController");

const router = express.Router();

router.get("/dashboard", getDashboard);
router.post("/announcements", createAnnouncement);
router.post("/promos", createPromoCode);
router.put("/content", updateSiteContent);
router.patch("/gallery/:id/visibility", toggleGalleryVisibility);
router.post("/gallery/reorder", reorderGalleryItems);

module.exports = router;
