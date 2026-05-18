const { getPool, hasDatabaseConfig } = require("../db/pool");

const DEFAULT_CONTENT_STATE = {
  aboutText:
    "Platinum Vacations is based in Nyeri and specializes in carefully planned travel adventures across Kenya.",
  contactPhones: "0740629899, 0768070634, 0711757863",
  footerEmail: "platinumvacationske@gmail.com",
  paymentInstructions:
    "Customers can pay in full or reserve a space with at least half upfront and clear the balance the day before the trip.",
  footerLinks: "Instagram, TikTok, WhatsApp"
};

function formatGalleryRow(row) {
  return {
    id: row.id,
    src: row.src,
    location: row.location,
    visible: Boolean(row.visible),
    sortOrder: Number(row.sort_order) || 0
  };
}

function formatContentRow(row) {
  if (!row) {
    return { ...DEFAULT_CONTENT_STATE };
  }

  return {
    aboutText: row.about_text || DEFAULT_CONTENT_STATE.aboutText,
    contactPhones: row.contact_phones || DEFAULT_CONTENT_STATE.contactPhones,
    footerEmail: row.footer_email || DEFAULT_CONTENT_STATE.footerEmail,
    paymentInstructions: row.payment_instructions || DEFAULT_CONTENT_STATE.paymentInstructions,
    footerLinks: row.footer_links || DEFAULT_CONTENT_STATE.footerLinks
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
