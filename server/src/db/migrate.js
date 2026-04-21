require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { getPool } = require("./pool");

async function runMigrations() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const seedPath = path.join(__dirname, "seed.sql");

  const schemaSql = fs.readFileSync(schemaPath, "utf8");
  const seedSql = fs.readFileSync(seedPath, "utf8");
  let pool;

  try {
    pool = getPool();
    await pool.query(schemaSql);
    await pool.query(seedSql);
    console.log("Schema and seed completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

runMigrations();
