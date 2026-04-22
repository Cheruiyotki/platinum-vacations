const express = require("express");
const { getVisibleGalleryItems } = require("../controllers/siteController");

const router = express.Router();

router.get("/gallery", getVisibleGalleryItems);

module.exports = router;
