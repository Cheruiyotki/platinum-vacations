const express = require("express");
const cors = require("cors");
const adminRoutes = require("./routes/adminRoutes");
const messageRoutes = require("./routes/messageRoutes");
const packageRoutes = require("./routes/packageRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const siteRoutes = require("./routes/siteRoutes");
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
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/site", siteRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = app;
