const { getPool, hasDatabaseConfig } = require("../db/pool");

async function createAssistantMessage(req, res) {
  if (!hasDatabaseConfig()) {
    return res.status(503).json({
      message: "Message logging is temporarily unavailable. Configure DATABASE_URL and try again."
    });
  }

  const source = typeof req.body?.source === "string" ? req.body.source.trim() : "Website AI";
  const topic = typeof req.body?.topic === "string" ? req.body.topic.trim() : "";
  const summary = typeof req.body?.summary === "string" ? req.body.summary.trim() : "";
  const unanswered = Boolean(req.body?.unanswered);

  if (!topic) {
    return res.status(400).json({ message: "Message topic is required." });
  }

  if (!summary) {
    return res.status(400).json({ message: "Message summary is required." });
  }

  try {
    const result = await getPool().query(
      `
        INSERT INTO assistant_messages (source, topic, summary, unanswered)
        VALUES ($1, $2, $3, $4)
        RETURNING id, source, topic, summary, unanswered;
      `,
      [source, topic, summary, unanswered]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating assistant message:", error);
    return res.status(500).json({ message: "Failed to save assistant message." });
  }
}

module.exports = {
  createAssistantMessage
};
