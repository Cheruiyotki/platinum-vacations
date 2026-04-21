const { getPool, hasDatabaseConfig } = require("../db/pool");

const getPackages = async (_req, res) => {
  if (!hasDatabaseConfig()) {
    return res.status(503).json({
      message: "Packages are temporarily unavailable. Configure DATABASE_URL and try again."
    });
  }

  try {
    const query = `
      SELECT
        id,
        slug,
        title,
        cost,
        dates,
        duration_banner,
        date_pill,
        description,
        includes_json,
        excludes_json,
        pickup_point,
        note,
        image_url,
        deposit_required
      FROM packages
      ORDER BY id ASC;
    `;
    const { rows } = await getPool().query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching packages:", error);
    res
      .status(error.message.includes("Missing DATABASE_URL") ? 503 : 500)
      .json({ message: "Failed to fetch packages." });
  }
};

module.exports = {
  getPackages
};
