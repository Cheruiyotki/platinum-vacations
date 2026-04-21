const SANDBOX_BASE_URL = "https://sandbox.safaricom.co.ke";
const PRODUCTION_BASE_URL = "https://api.safaricom.co.ke";

function hasMpesaConfig() {
  return Boolean(
    process.env.MPESA_CONSUMER_KEY &&
      process.env.MPESA_CONSUMER_SECRET &&
      process.env.MPESA_SHORTCODE &&
      process.env.MPESA_PASSKEY &&
      process.env.MPESA_CALLBACK_URL
  );
}

function getMpesaBaseUrl() {
  return process.env.MPESA_ENV === "production" ? PRODUCTION_BASE_URL : SANDBOX_BASE_URL;
}

function getTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

function normalizePhoneNumber(phoneNumber) {
  const digits = String(phoneNumber || "").replace(/\D/g, "");

  if (digits.startsWith("254") && digits.length === 12) {
    return digits;
  }

  if (digits.startsWith("0") && digits.length === 10) {
    return `254${digits.slice(1)}`;
  }

  if (digits.startsWith("7") && digits.length === 9) {
    return `254${digits}`;
  }

  throw new Error("Enter a valid Safaricom number in the format 07XXXXXXXX or 2547XXXXXXXX.");
}

async function getAccessToken() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  const response = await fetch(`${getMpesaBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${auth}`
    }
  });

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    throw new Error(data.errorMessage || data.error_description || "Failed to get M-Pesa access token.");
  }

  return data.access_token;
}

async function initiateStkPush({ amount, phoneNumber, accountReference, transactionDescription }) {
  if (!hasMpesaConfig()) {
    throw new Error("Missing Safaricom M-Pesa configuration.");
  }

  const shortCode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const callbackUrl = process.env.MPESA_CALLBACK_URL;
  const transactionType = process.env.MPESA_TRANSACTION_TYPE || "CustomerBuyGoodsOnline";
  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
  const timestamp = getTimestamp();
  const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString("base64");
  const accessToken = await getAccessToken();

  const response = await fetch(`${getMpesaBaseUrl()}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: transactionType,
      Amount: Math.round(amount),
      PartyA: normalizedPhoneNumber,
      PartyB: shortCode,
      PhoneNumber: normalizedPhoneNumber,
      CallBackURL: callbackUrl,
      AccountReference: accountReference || "Adventure",
      TransactionDesc: transactionDescription || "Adventure booking payment"
    })
  });

  const data = await response.json();

  if (!response.ok || data.ResponseCode !== "0") {
    throw new Error(
      data.errorMessage ||
        data.error_description ||
        data.ResponseDescription ||
        "Failed to initiate the M-Pesa prompt."
    );
  }

  return data;
}

module.exports = {
  hasMpesaConfig,
  initiateStkPush
};
