const { getPool, hasDatabaseConfig } = require("../db/pool");
const { hasMpesaConfig, initiateStkPush } = require("../services/mpesa");

function parseAdventureCost(cost) {
  const parsedValue = Number.parseFloat(String(cost || "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsedValue) && parsedValue > 0 ? Math.ceil(parsedValue) : 0;
}

function calculateMinimumBookingAmount(travelPackage) {
  const fullAmount = parseAdventureCost(travelPackage.cost);
  return {
    fullAmount,
    minimumBookingAmount: Math.max(Number(travelPackage.deposit_required) || 0, Math.ceil(fullAmount / 2))
  };
}

async function fetchAdventureBySlug(slug) {
  const query = `
    SELECT
      slug,
      title,
      cost,
      deposit_required
    FROM packages
    WHERE slug = $1
    LIMIT 1;
  `;

  const { rows } = await getPool().query(query, [slug]);
  return rows[0] || null;
}

async function requestStkPush(req, res) {
  if (!hasDatabaseConfig()) {
    return res.status(503).json({
      message: "Payments are temporarily unavailable. Configure DATABASE_URL and try again."
    });
  }

  if (!hasMpesaConfig()) {
    return res.status(503).json({
      message: "Payments are temporarily unavailable. Configure Safaricom M-Pesa credentials and try again."
    });
  }

  const { packageSlug, phoneNumber, amount, paymentOption } = req.body || {};

  if (!packageSlug || typeof packageSlug !== "string") {
    return res.status(400).json({ message: "A valid adventure is required." });
  }

  if (!phoneNumber || typeof phoneNumber !== "string") {
    return res.status(400).json({ message: "A valid phone number is required." });
  }

  if (paymentOption !== "full" && paymentOption !== "space") {
    return res.status(400).json({ message: "Select either full payment or book space." });
  }

  const requestedAmount = Number.parseInt(amount, 10);
  if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
    return res.status(400).json({ message: "Enter a valid amount to pay." });
  }

  try {
    const travelPackage = await fetchAdventureBySlug(packageSlug);
    if (!travelPackage) {
      return res.status(404).json({ message: "Adventure not found." });
    }

    const { fullAmount, minimumBookingAmount } = calculateMinimumBookingAmount(travelPackage);
    const requiredAmount = paymentOption === "full" ? fullAmount : minimumBookingAmount;

    if (requestedAmount < requiredAmount) {
      return res.status(400).json({
        message: `Enter at least KES ${requiredAmount.toLocaleString()} for this payment option.`
      });
    }

    const stkResponse = await initiateStkPush({
      amount: requestedAmount,
      phoneNumber,
      accountReference: travelPackage.slug.slice(0, 12),
      transactionDescription:
        paymentOption === "full"
          ? `Full payment for ${travelPackage.title}`
          : `Booking space for ${travelPackage.title}`
    });

    return res.status(200).json({
      message:
        stkResponse.CustomerMessage ||
        "STK push sent successfully. Check your phone and enter your M-Pesa PIN.",
      data: stkResponse
    });
  } catch (error) {
    console.error("Error requesting STK push:", error);
    return res.status(500).json({
      message: error.message || "Failed to initiate the payment prompt."
    });
  }
}

function handleStkCallback(req, res) {
  console.log("Safaricom STK callback received:", JSON.stringify(req.body));
  return res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
}

module.exports = {
  requestStkPush,
  handleStkCallback
};
