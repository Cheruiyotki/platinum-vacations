const { getPool, hasDatabaseConfig } = require("../db/pool");
const { formatContentRow } = require("../utils/siteContent");

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

async function getSiteContent(_req, res) {
  if (!hasDatabaseConfig()) {
    return res.status(503).json({
      message: "Site content is temporarily unavailable. Configure DATABASE_URL and try again."
    });
  }

  try {
    const result = await getPool().query(`
      SELECT about_text, contact_phones, footer_email, payment_instructions, footer_links
      FROM site_content
      WHERE id = 1;
    `);

    return res.status(200).json(formatContentRow(result.rows[0]));
  } catch (error) {
    console.error("Error fetching site content:", error);
    return res.status(500).json({ message: "Failed to fetch site content." });
  }
}

module.exports = {
  getSiteContent,
  getVisibleGalleryItems
};
