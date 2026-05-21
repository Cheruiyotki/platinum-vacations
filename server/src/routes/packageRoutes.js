const express = require("express");
const {
  createPackage,
  deletePackage,
  getAdminPackages,
  getPackages,
  togglePackageVisibility,
  updatePackage
} = require("../controllers/packageController");
const { requireAdminAuth } = require("../middleware/adminAuth");

const router = express.Router();

router.get("/", getPackages);
router.get("/admin", requireAdminAuth, getAdminPackages);
router.post("/", requireAdminAuth, createPackage);
router.put("/:id", requireAdminAuth, updatePackage);
router.patch("/:id/visibility", requireAdminAuth, togglePackageVisibility);
router.delete("/:id", requireAdminAuth, deletePackage);

module.exports = router;
