const { Pool } = require("pg");

let pool;

function hasDatabaseConfig() {
  return Boolean(process.env.DATABASE_URL);
}

function getPool() {
  if (pool) {
    return pool;
  }

  const connectionString = process.env.DATABASE_URL;
  const sslMode = process.env.PGSSLMODE || "";
  const isNeon = connectionString && connectionString.includes("neon.tech");
  const shouldUseSsl = isNeon || sslMode.toLowerCase() === "require";

  if (!connectionString) {
    throw new Error(
      "Missing DATABASE_URL environment variable. Copy server/.env.example to server/.env and configure your Postgres connection."
    );
  }

  pool = new Pool({
    connectionString,
    ssl: shouldUseSsl
      ? {
          rejectUnauthorized: false
        }
      : false
  });

  return pool;
}

module.exports = {
  getPool,
  hasDatabaseConfig
};
