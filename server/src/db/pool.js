const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;
const sslMode = process.env.PGSSLMODE || "";
const isNeon = connectionString && connectionString.includes("neon.tech");
const shouldUseSsl = isNeon || sslMode.toLowerCase() === "require";

if (!connectionString) {
  throw new Error(
    "Missing DATABASE_URL environment variable. Copy server/.env.example to server/.env and configure your Postgres connection."
  );
}

const pool = new Pool({
  connectionString,
  ssl: shouldUseSsl
    ? {
        rejectUnauthorized: false
      }
    : false
});

module.exports = pool;
