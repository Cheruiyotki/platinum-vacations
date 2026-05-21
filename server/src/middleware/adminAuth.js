const crypto = require("crypto");

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || getAdminPassword();
}

function signPayload(payload) {
  return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

function createAdminToken() {
  const payload = Buffer.from(
    JSON.stringify({
      exp: Date.now() + TOKEN_TTL_MS
    })
  ).toString("base64url");
  const signature = signPayload(payload);

  return `${payload}.${signature}`;
}

function verifyAdminToken(token) {
  if (!getAdminPassword() || !token || !token.includes(".")) {
    return false;
  }

  const [payload, signature] = token.split(".");
  const expectedSignature = signPayload(payload);

  if (
    signature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  ) {
    return false;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return Number(session.exp) > Date.now();
  } catch (_error) {
    return false;
  }
}

function getBearerToken(req) {
  const authorizationHeader = req.get("authorization") || "";
  const [scheme, token] = authorizationHeader.split(" ");

  return scheme === "Bearer" ? token : "";
}

function requireAdminAuth(req, res, next) {
  if (!getAdminPassword()) {
    return res.status(503).json({
      message: "Admin authentication is not configured. Set ADMIN_PASSWORD on the server."
    });
  }

  if (!verifyAdminToken(getBearerToken(req))) {
    return res.status(401).json({ message: "Admin login is required." });
  }

  return next();
}

function createAdminSession(req, res) {
  const adminPassword = getAdminPassword();

  if (!adminPassword) {
    return res.status(503).json({
      message: "Admin authentication is not configured. Set ADMIN_PASSWORD on the server."
    });
  }

  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const passwordBuffer = Buffer.from(password);
  const adminPasswordBuffer = Buffer.from(adminPassword);

  if (
    passwordBuffer.length !== adminPasswordBuffer.length ||
    !crypto.timingSafeEqual(passwordBuffer, adminPasswordBuffer)
  ) {
    return res.status(401).json({ message: "Invalid admin password." });
  }

  return res.status(200).json({
    token: createAdminToken(),
    expiresInMs: TOKEN_TTL_MS
  });
}

module.exports = {
  createAdminSession,
  requireAdminAuth
};
