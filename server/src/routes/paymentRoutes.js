const express = require("express");
const { handleStkCallback, requestStkPush } = require("../controllers/paymentController");

const router = express.Router();

router.post("/stk-push", requestStkPush);
router.post("/callback", handleStkCallback);

module.exports = router;
