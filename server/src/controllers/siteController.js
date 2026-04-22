const { getPool, hasDatabaseConfig } = require("../db/pool");

function formatGalleryRow(row) {
  return {
    id: row.id,
    src: row.src,
    location: row.location,
    visible: Boolean(row.visible),
    sortOrder: Number(row.sort_order) || 0
  };
}

async function getVisibleGalleryItems(_req, res) {
  if (!hasDatabaseConfig()) {
    return res.status(503).json({
      message: "Gallery is temporarily unavailable. Configure DATABASE_URL and try again."
    });
  }

  try {
    const result = await getPool().query(`
      SELECT id, src, location, visible, sort_order
      FROM gallery_items
      WHERE visible = TRUE
      ORDER BY sort_order ASC, id ASC;
    `);

    return res.status(200).json(result.rows.map(formatGalleryRow));
  } catch (error) {
    console.error("Error fetching public gallery items:", error);
    return res.status(500).json({ message: "Failed to fetch gallery items." });
  }
}

module.exports = {
  getVisibleGalleryItems
};
