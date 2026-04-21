const express = require("express");
const cors = require("cors");
const packageRoutes = require("./routes/packageRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const { hasDatabaseConfig } = require("./db/pool");
const { hasMpesaConfig } = require("./services/mpesa");

const app = express();

const allowedOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: allowedOrigin
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    databaseConfigured: hasDatabaseConfig(),
    mpesaConfigured: hasMpesaConfig()
  });
});

app.use("/api/packages", packageRoutes);
app.use("/api/payments", paymentRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = app;
