const express = require("express");
const { getSiteContent, getVisibleGalleryItems } = require("../controllers/siteController");

const router = express.Router();

router.get("/content", getSiteContent);
router.get("/gallery", getVisibleGalleryItems);

module.exports = router;
