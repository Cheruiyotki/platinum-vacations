const pool = require("../db/pool");

const getPackages = async (_req, res) => {
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
    const { rows } = await pool.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching packages:", error);
    res.status(500).json({ message: "Failed to fetch packages." });
  }
};

module.exports = {
  getPackages
};
