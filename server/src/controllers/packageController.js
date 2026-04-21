const { getPool, hasDatabaseConfig } = require("../db/pool");

const SELECT_FIELDS = `
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
  deposit_required,
  hidden
`;

function normalizeList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function normalizeAdventurePayload(body = {}) {
  const normalizedPayload = {
    slug: typeof body.slug === "string" ? body.slug.trim() : "",
    title: typeof body.title === "string" ? body.title.trim() : "",
    cost: typeof body.cost === "string" ? body.cost.trim() : "",
    dates: typeof body.dates === "string" ? body.dates.trim() : "",
    duration_banner: typeof body.duration_banner === "string" ? body.duration_banner.trim() : "",
    date_pill: typeof body.date_pill === "string" ? body.date_pill.trim() : "",
    description: typeof body.description === "string" ? body.description.trim() : "",
    includes_json: normalizeList(body.includes_json),
    excludes_json: normalizeList(body.excludes_json),
    pickup_point: typeof body.pickup_point === "string" ? body.pickup_point.trim() : "",
    note: typeof body.note === "string" ? body.note.trim() : "",
    image_url: typeof body.image_url === "string" ? body.image_url.trim() : "",
    deposit_required: Number.parseInt(body.deposit_required, 10) || 0,
    hidden: Boolean(body.hidden)
  };

  return normalizedPayload;
}

function validateAdventurePayload(payload) {
  if (!payload.slug) {
    return "Slug is required.";
  }

  if (!payload.title) {
    return "Title is required.";
  }

  if (!payload.cost) {
    return "Price is required.";
  }

  if (!payload.dates) {
    return "Dates are required.";
  }

  if (!payload.image_url) {
    return "Image URL is required.";
  }

  if (!Number.isFinite(payload.deposit_required) || payload.deposit_required < 0) {
    return "Deposit must be zero or greater.";
  }

  return "";
}

async function queryPackages({ includeHidden }) {
  const query = `
    SELECT
      ${SELECT_FIELDS}
    FROM packages
    ${includeHidden ? "" : "WHERE hidden = FALSE"}
    ORDER BY id ASC;
  `;

  const { rows } = await getPool().query(query);
  return rows;
}

async function fetchPackageById(id) {
  const query = `
    SELECT
      ${SELECT_FIELDS}
    FROM packages
    WHERE id = $1
    LIMIT 1;
  `;

  const { rows } = await getPool().query(query, [id]);
  return rows[0] || null;
}

const getPackages = async (_req, res) => {
  if (!hasDatabaseConfig()) {
    return res.status(503).json({
      message: "Packages are temporarily unavailable. Configure DATABASE_URL and try again."
    });
  }

  try {
    const rows = await queryPackages({ includeHidden: false });
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching packages:", error);
    res
      .status(error.message.includes("Missing DATABASE_URL") ? 503 : 500)
      .json({ message: "Failed to fetch packages." });
  }
};

const getAdminPackages = async (_req, res) => {
  if (!hasDatabaseConfig()) {
    return res.status(503).json({
      message: "Packages are temporarily unavailable. Configure DATABASE_URL and try again."
    });
  }

  try {
    const rows = await queryPackages({ includeHidden: true });
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching admin packages:", error);
    res.status(500).json({ message: "Failed to fetch admin adventures." });
  }
};

const createPackage = async (req, res) => {
  if (!hasDatabaseConfig()) {
    return res.status(503).json({
      message: "Packages are temporarily unavailable. Configure DATABASE_URL and try again."
    });
  }

  const payload = normalizeAdventurePayload(req.body);
  const validationError = validateAdventurePayload(payload);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const query = `
      INSERT INTO packages (
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
        deposit_required,
        hidden
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8::jsonb, $9::jsonb, $10, $11, $12, $13, $14
      )
      RETURNING ${SELECT_FIELDS};
    `;

    const values = [
      payload.slug,
      payload.title,
      payload.cost,
      payload.dates,
      payload.duration_banner || null,
      payload.date_pill || null,
      payload.description || null,
      JSON.stringify(payload.includes_json),
      JSON.stringify(payload.excludes_json),
      payload.pickup_point || null,
      payload.note || null,
      payload.image_url,
      payload.deposit_required,
      payload.hidden
    ];

    const { rows } = await getPool().query(query, values);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error creating adventure:", error);

    if (error.code === "23505") {
      return res.status(409).json({ message: "That slug already exists." });
    }

    res.status(500).json({ message: "Failed to create adventure." });
  }
};

const updatePackage = async (req, res) => {
  if (!hasDatabaseConfig()) {
    return res.status(503).json({
      message: "Packages are temporarily unavailable. Configure DATABASE_URL and try again."
    });
  }

  const packageId = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(packageId)) {
    return res.status(400).json({ message: "A valid adventure id is required." });
  }

  const payload = normalizeAdventurePayload(req.body);
  const validationError = validateAdventurePayload(payload);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const query = `
      UPDATE packages
      SET
        slug = $1,
        title = $2,
        cost = $3,
        dates = $4,
        duration_banner = $5,
        date_pill = $6,
        description = $7,
        includes_json = $8::jsonb,
        excludes_json = $9::jsonb,
        pickup_point = $10,
        note = $11,
        image_url = $12,
        deposit_required = $13,
        hidden = $14,
        updated_at = NOW()
      WHERE id = $15
      RETURNING ${SELECT_FIELDS};
    `;

    const values = [
      payload.slug,
      payload.title,
      payload.cost,
      payload.dates,
      payload.duration_banner || null,
      payload.date_pill || null,
      payload.description || null,
      JSON.stringify(payload.includes_json),
      JSON.stringify(payload.excludes_json),
      payload.pickup_point || null,
      payload.note || null,
      payload.image_url,
      payload.deposit_required,
      payload.hidden,
      packageId
    ];

    const { rows } = await getPool().query(query, values);

    if (!rows.length) {
      return res.status(404).json({ message: "Adventure not found." });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error updating adventure:", error);

    if (error.code === "23505") {
      return res.status(409).json({ message: "That slug already exists." });
    }

    res.status(500).json({ message: "Failed to update adventure." });
  }
};

const togglePackageVisibility = async (req, res) => {
  if (!hasDatabaseConfig()) {
    return res.status(503).json({
      message: "Packages are temporarily unavailable. Configure DATABASE_URL and try again."
    });
  }

  const packageId = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(packageId)) {
    return res.status(400).json({ message: "A valid adventure id is required." });
  }

  try {
    const existingPackage = await fetchPackageById(packageId);

    if (!existingPackage) {
      return res.status(404).json({ message: "Adventure not found." });
    }

    const query = `
      UPDATE packages
      SET
        hidden = $1,
        updated_at = NOW()
      WHERE id = $2
      RETURNING ${SELECT_FIELDS};
    `;

    const { rows } = await getPool().query(query, [!existingPackage.hidden, packageId]);
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error toggling adventure visibility:", error);
    res.status(500).json({ message: "Failed to update adventure visibility." });
  }
};

const deletePackage = async (req, res) => {
  if (!hasDatabaseConfig()) {
    return res.status(503).json({
      message: "Packages are temporarily unavailable. Configure DATABASE_URL and try again."
    });
  }

  const packageId = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(packageId)) {
    return res.status(400).json({ message: "A valid adventure id is required." });
  }

  try {
    const query = `
      DELETE FROM packages
      WHERE id = $1
      RETURNING id;
    `;
    const { rows } = await getPool().query(query, [packageId]);

    if (!rows.length) {
      return res.status(404).json({ message: "Adventure not found." });
    }

    res.status(200).json({ message: "Adventure deleted successfully." });
  } catch (error) {
    console.error("Error deleting adventure:", error);
    res.status(500).json({ message: "Failed to delete adventure." });
  }
};

module.exports = {
  createPackage,
  deletePackage,
  getAdminPackages,
  getPackages,
  togglePackageVisibility,
  updatePackage
};
