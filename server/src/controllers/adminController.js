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

function mapPaymentOption(value) {
  return value === "full" ? "Full amount" : "Book space";
}

function formatBookingRow(row) {
  return {
    id: row.booking_code,
    customer: row.customer_name,
    adventure: row.adventure_title,
    option: mapPaymentOption(row.payment_option),
    amountPaid: Number(row.amount_paid) || 0,
    balance: Number(row.balance) || 0,
    phone: row.phone,
    status: row.status
  };
}

function formatPaymentRow(row) {
  return {
    id: row.payment_code,
    phone: row.phone,
    amount: Number(row.amount) || 0,
    reference: row.reference,
    stkStatus: row.stk_status,
    balance: Number(row.balance) || 0
  };
}

function formatCustomerRow(row) {
  return {
    id: `CUS-${row.id}`,
    name: row.name,
    phone: row.phone,
    bookedAdventure: row.booked_adventure || "No booking yet",
    progress: row.progress || "Lead",
    notes: row.notes || "No customer notes yet."
  };
}

function formatMessageRow(row) {
  return {
    id: `MSG-${row.id}`,
    source: row.source,
    topic: row.topic,
    summary: row.summary,
    unanswered: Boolean(row.unanswered)
  };
}

function formatGalleryRow(row) {
  return {
    id: `GAL-${row.id}`,
    dbId: row.id,
    src: row.src,
    location: row.location,
    visible: Boolean(row.visible),
    sortOrder: Number(row.sort_order) || 0
  };
}

function formatAnnouncementRow(row) {
  return {
    id: `ANN-${row.id}`,
    dbId: row.id,
    title: row.title,
    status: row.status,
    body: row.body
  };
}

function formatPromoRow(row) {
  return {
    id: `PROMO-${row.id}`,
    dbId: row.id,
    code: row.code,
    discount: row.discount,
    status: row.status
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

function buildReports(rawBookings) {
  const now = new Date();
  const sameMonthBookings = rawBookings.filter((booking) => {
    const createdAt = new Date(booking.created_at);
    return createdAt.getFullYear() === now.getFullYear() && createdAt.getMonth() === now.getMonth();
  });
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  const thisWeekBookings = rawBookings.filter((booking) => new Date(booking.created_at) >= weekAgo);

  const bookingsByAdventure = rawBookings.reduce((accumulator, booking) => {
    accumulator[booking.adventure_title] = (accumulator[booking.adventure_title] || 0) + 1;
    return accumulator;
  }, {});

  const [bestAdventure = "No bookings yet"] =
    Object.entries(bookingsByAdventure).sort((left, right) => right[1] - left[1])[0] || [];

  const completedBookings = rawBookings.filter((booking) => Number(booking.balance) === 0).length;
  const pendingBalances = rawBookings.filter((booking) => Number(booking.balance) > 0).length;
  const completionRate = rawBookings.length
    ? `${Math.round((completedBookings / rawBookings.length) * 100)}%`
    : "0%";

  return [
    {
      title: "Monthly bookings",
      value: sameMonthBookings.length,
      note: `${thisWeekBookings.length} added this week`
    },
    {
      title: "Best performing adventure",
      value: bestAdventure,
      note: rawBookings.length ? "Highest booking volume on record" : "Waiting for the first booking"
    },
    {
      title: "Payment completion rate",
      value: completionRate,
      note: `${pendingBalances} customers still clearing balances`
    }
  ];
}

async function getDashboard(_req, res) {
  if (!hasDatabaseConfig()) {
    return res.status(503).json({
      message: "Admin data is temporarily unavailable. Configure DATABASE_URL and try again."
    });
  }

  try {
    const pool = getPool();
    const [
      bookingResult,
      paymentResult,
      customerResult,
      messageResult,
      galleryResult,
      announcementResult,
      promoResult,
      contentResult
    ] = await Promise.all([
      pool.query(`
        SELECT
          bookings.id,
          bookings.booking_code,
          bookings.payment_option,
          bookings.amount_paid,
          bookings.balance,
          bookings.status,
          bookings.created_at,
          customers.name AS customer_name,
          customers.phone,
          packages.title AS adventure_title
        FROM bookings
        JOIN customers ON customers.id = bookings.customer_id
        JOIN packages ON packages.id = bookings.package_id
        ORDER BY bookings.created_at DESC, bookings.id DESC;
      `),
      pool.query(`
        SELECT
          payments.id,
          payments.payment_code,
          payments.phone,
          payments.amount,
          payments.reference,
          payments.stk_status,
          payments.created_at,
          COALESCE(bookings.balance, 0) AS balance
        FROM payments
        LEFT JOIN bookings ON bookings.id = payments.booking_id
        ORDER BY payments.created_at DESC, payments.id DESC;
      `),
      pool.query(`
        SELECT
          customers.id,
          customers.name,
          customers.phone,
          customers.notes,
          latest_booking.status AS progress,
          packages.title AS booked_adventure
        FROM customers
        LEFT JOIN LATERAL (
          SELECT
            bookings.package_id,
            bookings.status
          FROM bookings
          WHERE bookings.customer_id = customers.id
          ORDER BY bookings.updated_at DESC, bookings.id DESC
          LIMIT 1
        ) AS latest_booking ON TRUE
        LEFT JOIN packages ON packages.id = latest_booking.package_id
        ORDER BY customers.updated_at DESC, customers.id DESC;
      `),
      pool.query(`
        SELECT id, source, topic, summary, unanswered
        FROM assistant_messages
        ORDER BY created_at DESC, id DESC;
      `),
      pool.query(`
        SELECT id, src, location, visible, sort_order
        FROM gallery_items
        ORDER BY sort_order ASC, id ASC;
      `),
      pool.query(`
        SELECT id, title, status, body
        FROM announcements
        ORDER BY created_at DESC, id DESC;
      `),
      pool.query(`
        SELECT id, code, discount, status
        FROM promo_codes
        ORDER BY created_at DESC, id DESC;
      `),
      pool.query(`
        SELECT about_text, contact_phones, footer_email, payment_instructions, footer_links
        FROM site_content
        WHERE id = 1;
      `)
    ]);

    return res.status(200).json({
      bookings: bookingResult.rows.map(formatBookingRow),
      payments: paymentResult.rows.map(formatPaymentRow),
      customers: customerResult.rows.map(formatCustomerRow),
      messages: messageResult.rows.map(formatMessageRow),
      galleryItems: galleryResult.rows.map(formatGalleryRow),
      announcements: announcementResult.rows.map(formatAnnouncementRow),
      promoCodes: promoResult.rows.map(formatPromoRow),
      contentState: formatContentRow(contentResult.rows[0]),
      reports: buildReports(bookingResult.rows)
    });
  } catch (error) {
    console.error("Error loading admin dashboard:", error);
    return res.status(500).json({ message: "Failed to load admin dashboard." });
  }
}

async function toggleGalleryVisibility(req, res) {
  if (!hasDatabaseConfig()) {
    return res.status(503).json({
      message: "Gallery data is temporarily unavailable. Configure DATABASE_URL and try again."
    });
  }

  const galleryId = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(galleryId)) {
    return res.status(400).json({ message: "A valid gallery id is required." });
  }

  try {
    const pool = getPool();
    const existingItem = await pool.query(
      "SELECT id, src, location, visible, sort_order FROM gallery_items WHERE id = $1 LIMIT 1;",
      [galleryId]
    );

    if (!existingItem.rows.length) {
      return res.status(404).json({ message: "Gallery item not found." });
    }

    const result = await pool.query(
      `
        UPDATE gallery_items
        SET
          visible = $1,
          updated_at = NOW()
        WHERE id = $2
        RETURNING id, src, location, visible, sort_order;
      `,
      [!existingItem.rows[0].visible, galleryId]
    );

    return res.status(200).json(formatGalleryRow(result.rows[0]));
  } catch (error) {
    console.error("Error toggling gallery visibility:", error);
    return res.status(500).json({ message: "Failed to update gallery item." });
  }
}

async function reorderGalleryItems(req, res) {
  if (!hasDatabaseConfig()) {
    return res.status(503).json({
      message: "Gallery data is temporarily unavailable. Configure DATABASE_URL and try again."
    });
  }

  const galleryId = Number.parseInt(req.body?.itemId, 10);
  const direction = req.body?.direction;

  if (!Number.isFinite(galleryId)) {
    return res.status(400).json({ message: "A valid gallery id is required." });
  }

  if (direction !== "up" && direction !== "down") {
    return res.status(400).json({ message: "Direction must be either up or down." });
  }

  const client = await getPool().connect();

  try {
    await client.query("BEGIN");
    const orderedItems = await client.query(`
      SELECT id, sort_order
      FROM gallery_items
      ORDER BY sort_order ASC, id ASC;
    `);

    const currentIndex = orderedItems.rows.findIndex((item) => item.id === galleryId);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex < 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Gallery item not found." });
    }

    if (targetIndex < 0 || targetIndex >= orderedItems.rows.length) {
      await client.query("COMMIT");
      const unchangedItems = await client.query(`
        SELECT id, src, location, visible, sort_order
        FROM gallery_items
        ORDER BY sort_order ASC, id ASC;
      `);
      return res.status(200).json(unchangedItems.rows.map(formatGalleryRow));
    }

    const currentItem = orderedItems.rows[currentIndex];
    const targetItem = orderedItems.rows[targetIndex];

    await client.query(
      "UPDATE gallery_items SET sort_order = $1, updated_at = NOW() WHERE id = $2;",
      [targetItem.sort_order, currentItem.id]
    );
    await client.query(
      "UPDATE gallery_items SET sort_order = $1, updated_at = NOW() WHERE id = $2;",
      [currentItem.sort_order, targetItem.id]
    );

    await client.query("COMMIT");

    const updatedItems = await client.query(`
      SELECT id, src, location, visible, sort_order
      FROM gallery_items
      ORDER BY sort_order ASC, id ASC;
    `);

    return res.status(200).json(updatedItems.rows.map(formatGalleryRow));
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error reordering gallery items:", error);
    return res.status(500).json({ message: "Failed to reorder gallery items." });
  } finally {
    client.release();
  }
}

async function createAnnouncement(req, res) {
  if (!hasDatabaseConfig()) {
    return res.status(503).json({
      message: "Announcement data is temporarily unavailable. Configure DATABASE_URL and try again."
    });
  }

  const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
  const status = typeof req.body?.status === "string" ? req.body.status.trim() : "Draft";
  const body = typeof req.body?.body === "string" ? req.body.body.trim() : "";

  if (!title) {
    return res.status(400).json({ message: "Announcement title is required." });
  }

  if (!body) {
    return res.status(400).json({ message: "Announcement message is required." });
  }

  try {
    const result = await getPool().query(
      `
        INSERT INTO announcements (title, status, body)
        VALUES ($1, $2, $3)
        RETURNING id, title, status, body;
      `,
      [title, status || "Draft", body]
    );

    return res.status(201).json(formatAnnouncementRow(result.rows[0]));
  } catch (error) {
    console.error("Error creating announcement:", error);
    return res.status(500).json({ message: "Failed to create announcement." });
  }
}

async function createPromoCode(req, res) {
  if (!hasDatabaseConfig()) {
    return res.status(503).json({
      message: "Promo code data is temporarily unavailable. Configure DATABASE_URL and try again."
    });
  }

  const code = typeof req.body?.code === "string" ? req.body.code.trim().toUpperCase() : "";
  const discount = typeof req.body?.discount === "string" ? req.body.discount.trim() : "";
  const status = typeof req.body?.status === "string" ? req.body.status.trim() : "Active";

  if (!code) {
    return res.status(400).json({ message: "Promo code is required." });
  }

  if (!discount) {
    return res.status(400).json({ message: "Promo discount is required." });
  }

  try {
    const result = await getPool().query(
      `
        INSERT INTO promo_codes (code, discount, status)
        VALUES ($1, $2, $3)
        RETURNING id, code, discount, status;
      `,
      [code, discount, status || "Active"]
    );

    return res.status(201).json(formatPromoRow(result.rows[0]));
  } catch (error) {
    console.error("Error creating promo code:", error);

    if (error.code === "23505") {
      return res.status(409).json({ message: "That promo code already exists." });
    }

    return res.status(500).json({ message: "Failed to create promo code." });
  }
}

async function updateSiteContent(req, res) {
  if (!hasDatabaseConfig()) {
    return res.status(503).json({
      message: "Site content is temporarily unavailable. Configure DATABASE_URL and try again."
    });
  }

  const payload = {
    aboutText: typeof req.body?.aboutText === "string" ? req.body.aboutText.trim() : "",
    contactPhones:
      typeof req.body?.contactPhones === "string" ? req.body.contactPhones.trim() : "",
    footerEmail: typeof req.body?.footerEmail === "string" ? req.body.footerEmail.trim() : "",
    paymentInstructions:
      typeof req.body?.paymentInstructions === "string"
        ? req.body.paymentInstructions.trim()
        : "",
    footerLinks: typeof req.body?.footerLinks === "string" ? req.body.footerLinks.trim() : ""
  };

  if (
    !payload.aboutText ||
    !payload.contactPhones ||
    !payload.footerEmail ||
    !payload.paymentInstructions ||
    !payload.footerLinks
  ) {
    return res.status(400).json({ message: "All content fields are required." });
  }

  try {
    const result = await getPool().query(
      `
        INSERT INTO site_content (
          id,
          about_text,
          contact_phones,
          footer_email,
          payment_instructions,
          footer_links,
          updated_at
        )
        VALUES (1, $1, $2, $3, $4, $5, NOW())
        ON CONFLICT (id) DO UPDATE
        SET
          about_text = EXCLUDED.about_text,
          contact_phones = EXCLUDED.contact_phones,
          footer_email = EXCLUDED.footer_email,
          payment_instructions = EXCLUDED.payment_instructions,
          footer_links = EXCLUDED.footer_links,
          updated_at = NOW()
        RETURNING about_text, contact_phones, footer_email, payment_instructions, footer_links;
      `,
      [
        payload.aboutText,
        payload.contactPhones,
        payload.footerEmail,
        payload.paymentInstructions,
        payload.footerLinks
      ]
    );

    return res.status(200).json(formatContentRow(result.rows[0]));
  } catch (error) {
    console.error("Error updating site content:", error);
    return res.status(500).json({ message: "Failed to save site content." });
  }
}

module.exports = {
  createAnnouncement,
  createPromoCode,
  getDashboard,
  reorderGalleryItems,
  toggleGalleryVisibility,
  updateSiteContent
};
