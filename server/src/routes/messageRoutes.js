const express = require("express");
const { createAssistantMessage } = require("../controllers/messageController");

const router = express.Router();

router.post("/", createAssistantMessage);

module.exports = router;
