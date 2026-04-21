const express = require("express");
const {
  createPackage,
  deletePackage,
  getAdminPackages,
  getPackages,
  togglePackageVisibility,
  updatePackage
} = require("../controllers/packageController");

const router = express.Router();

router.get("/", getPackages);
router.get("/admin", getAdminPackages);
router.post("/", createPackage);
router.put("/:id", updatePackage);
router.patch("/:id/visibility", togglePackageVisibility);
router.delete("/:id", deletePackage);

module.exports = router;
