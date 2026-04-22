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

function normalizeStoredPhoneNumber(phoneNumber) {
  const digits = String(phoneNumber || "").replace(/\D/g, "");

  if (digits.startsWith("254") && digits.length === 12) {
    return `0${digits.slice(3)}`;
  }

  if (digits.startsWith("0") && digits.length === 10) {
    return digits;
  }

  if (digits.startsWith("7") && digits.length === 9) {
    return `0${digits}`;
  }

  return String(phoneNumber || "").trim();
}

function buildReference(slug, amount) {
  const normalizedSlug = String(slug || "")
    .replace(/[^a-z0-9]/gi, "")
    .toUpperCase();
  return `${normalizedSlug.slice(0, 6) || "TRIP"}${amount}`.slice(0, 24);
}

function generateCode(prefix) {
  const randomPart = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `${prefix}-${Date.now()}${randomPart}`;
}

async function fetchAdventureBySlug(slug) {
  const query = `
    SELECT
      id,
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

async function ensureCustomerRecord(client, { phoneNumber, customerName }) {
  const normalizedPhone = normalizeStoredPhoneNumber(phoneNumber);
  const trimmedName = typeof customerName === "string" ? customerName.trim() : "";
  const fallbackName = `Customer ${normalizedPhone.slice(-4) || "Guest"}`;
  const nextName = trimmedName || fallbackName;

  const existingCustomer = await client.query(
    `
      SELECT id, name, phone, notes
      FROM customers
      WHERE phone = $1
      LIMIT 1;
    `,
    [normalizedPhone]
  );

  if (existingCustomer.rows.length) {
    const currentCustomer = existingCustomer.rows[0];

    if (trimmedName && currentCustomer.name !== trimmedName) {
      const updatedCustomer = await client.query(
        `
          UPDATE customers
          SET
            name = $1,
            updated_at = NOW()
          WHERE id = $2
          RETURNING id, name, phone, notes;
        `,
        [trimmedName, currentCustomer.id]
      );

      return updatedCustomer.rows[0];
    }

    return currentCustomer;
  }

  const createdCustomer = await client.query(
    `
      INSERT INTO customers (name, phone, notes)
      VALUES ($1, $2, $3)
      RETURNING id, name, phone, notes;
    `,
    [nextName, normalizedPhone, ""]
  );

  return createdCustomer.rows[0];
}

async function ensureBookingRecord(client, { customerId, packageId, paymentOption, totalAmount }) {
  const existingBooking = await client.query(
    `
      SELECT
        id,
        booking_code,
        payment_option,
        total_amount,
        amount_paid,
        balance,
        status
      FROM bookings
      WHERE customer_id = $1
        AND package_id = $2
        AND status IN ('Awaiting payment', 'Pending balance')
      ORDER BY updated_at DESC, id DESC
      LIMIT 1;
    `,
    [customerId, packageId]
  );

  if (existingBooking.rows.length) {
    const booking = existingBooking.rows[0];

    if (booking.payment_option !== paymentOption) {
      const updatedBooking = await client.query(
        `
          UPDATE bookings
          SET
            payment_option = $1,
            updated_at = NOW()
          WHERE id = $2
          RETURNING id, booking_code, payment_option, total_amount, amount_paid, balance, status;
        `,
        [paymentOption, booking.id]
      );

      return updatedBooking.rows[0];
    }

    return booking;
  }

  const createdBooking = await client.query(
    `
      INSERT INTO bookings (
        booking_code,
        customer_id,
        package_id,
        payment_option,
        total_amount,
        amount_paid,
        balance,
        status
      )
      VALUES ($1, $2, $3, $4, $5, 0, $5, 'Awaiting payment')
      RETURNING id, booking_code, payment_option, total_amount, amount_paid, balance, status;
    `,
    [generateCode("BK"), customerId, packageId, paymentOption, totalAmount]
  );

  return createdBooking.rows[0];
}

async function createPaymentRecord({
  bookingId,
  phoneNumber,
  amount,
  reference,
  status,
  checkoutRequestId = null,
  merchantRequestId = null,
  responseDescription = null
}) {
  const result = await getPool().query(
    `
      INSERT INTO payments (
        payment_code,
        booking_id,
        phone,
        amount,
        reference,
        stk_status,
        checkout_request_id,
        merchant_request_id,
        response_description
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id;
    `,
    [
      generateCode("PAY"),
      bookingId,
      normalizeStoredPhoneNumber(phoneNumber),
      amount,
      reference,
      status,
      checkoutRequestId,
      merchantRequestId,
      responseDescription
    ]
  );

  return result.rows[0];
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

  const { packageSlug, phoneNumber, amount, paymentOption, customerName } = req.body || {};

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

  let booking = null;

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

    const client = await getPool().connect();

    try {
      await client.query("BEGIN");

      const customer = await ensureCustomerRecord(client, { phoneNumber, customerName });
      booking = await ensureBookingRecord(client, {
        customerId: customer.id,
        packageId: travelPackage.id,
        paymentOption,
        totalAmount: fullAmount
      });

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    const reference = buildReference(travelPackage.slug, requestedAmount);
    const stkResponse = await initiateStkPush({
      amount: requestedAmount,
      phoneNumber,
      accountReference: reference,
      transactionDescription:
        paymentOption === "full"
          ? `Full payment for ${travelPackage.title}`
          : `Booking space for ${travelPackage.title}`
    });

    await createPaymentRecord({
      bookingId: booking.id,
      phoneNumber,
      amount: requestedAmount,
      reference,
      status: "Pending",
      checkoutRequestId: stkResponse.CheckoutRequestID || null,
      merchantRequestId: stkResponse.MerchantRequestID || null,
      responseDescription:
        stkResponse.CustomerMessage ||
        stkResponse.ResponseDescription ||
        "STK push sent successfully."
    });

    return res.status(200).json({
      message:
        stkResponse.CustomerMessage ||
        "STK push sent successfully. Check your phone and enter your M-Pesa PIN.",
      data: stkResponse
    });
  } catch (error) {
    if (booking) {
      try {
        await createPaymentRecord({
          bookingId: booking.id,
          phoneNumber,
          amount: requestedAmount,
          reference: buildReference(packageSlug, requestedAmount),
          status: "Failed",
          responseDescription: error.message || "Failed to initiate the payment prompt."
        });
      } catch (recordError) {
        console.error("Error recording failed payment:", recordError);
      }
    }

    console.error("Error requesting STK push:", error);
    return res.status(500).json({
      message: error.message || "Failed to initiate the payment prompt."
    });
  }
}

async function handleStkCallback(req, res) {
  const callback = req.body?.Body?.stkCallback;
  const checkoutRequestId = callback?.CheckoutRequestID;
  const resultCode = Number(callback?.ResultCode);
  const resultDescription = callback?.ResultDesc || "Callback received";

  console.log("Safaricom STK callback received:", JSON.stringify(req.body));

  if (!checkoutRequestId || !hasDatabaseConfig()) {
    return res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  const client = await getPool().connect();

  try {
    await client.query("BEGIN");

    const paymentResult = await client.query(
      `
        SELECT
          payments.id,
          payments.amount,
          payments.stk_status,
          payments.booking_id,
          bookings.amount_paid,
          bookings.total_amount
        FROM payments
        LEFT JOIN bookings ON bookings.id = payments.booking_id
        WHERE payments.checkout_request_id = $1
        ORDER BY payments.id DESC
        LIMIT 1;
      `,
      [checkoutRequestId]
    );

    if (!paymentResult.rows.length) {
      await client.query("COMMIT");
      return res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    const payment = paymentResult.rows[0];
    const nextStatus = resultCode === 0 ? "Success" : "Failed";
    const shouldPreserveSuccess = payment.stk_status === "Success" && nextStatus === "Failed";

    await client.query(
      `
        UPDATE payments
        SET
          stk_status = $1,
          response_description = $2,
          updated_at = NOW()
        WHERE id = $3;
      `,
      [shouldPreserveSuccess ? payment.stk_status : nextStatus, resultDescription, payment.id]
    );

    if (
      payment.booking_id &&
      nextStatus === "Success" &&
      payment.stk_status !== "Success" &&
      Number.isFinite(Number(payment.total_amount))
    ) {
      const nextAmountPaid = Math.min(
        Number(payment.total_amount),
        Number(payment.amount_paid || 0) + Number(payment.amount || 0)
      );
      const nextBalance = Math.max(Number(payment.total_amount) - nextAmountPaid, 0);
      const nextBookingStatus = nextBalance === 0 ? "Confirmed" : "Pending balance";

      await client.query(
        `
          UPDATE bookings
          SET
            amount_paid = $1,
            balance = $2,
            status = $3,
            updated_at = NOW()
          WHERE id = $4;
        `,
        [nextAmountPaid, nextBalance, nextBookingStatus, payment.booking_id]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error handling STK callback:", error);
  } finally {
    client.release();
  }

  return res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
}

module.exports = {
  requestStkPush,
  handleStkCallback
};
