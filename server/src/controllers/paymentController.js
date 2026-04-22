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

function normalizePromoCode(code) {
  if (typeof code !== "string") {
    return "";
  }

  return code.trim().toUpperCase();
}

function parsePromoDiscount(discount, baseAmount) {
  const rawDiscount = typeof discount === "string" ? discount.trim() : "";

  if (!rawDiscount) {
    return { discountAmount: 0, kind: "none" };
  }

  const percentMatch = rawDiscount.match(/(\d+(?:\.\d+)?)\s*%/);
  if (percentMatch) {
    const percentValue = Number.parseFloat(percentMatch[1]);
    if (!Number.isFinite(percentValue) || percentValue <= 0) {
      return { discountAmount: 0, kind: "percent" };
    }

    const cappedPercent = Math.min(percentValue, 100);
    return {
      discountAmount: Math.round((baseAmount * cappedPercent) / 100),
      kind: "percent"
    };
  }

  const fixedMatch = rawDiscount.replace(/,/g, "").match(/(\d{1,9})/);
  if (!fixedMatch) {
    return { discountAmount: 0, kind: "fixed" };
  }

  const fixedAmount = Number.parseInt(fixedMatch[1], 10);
  if (!Number.isFinite(fixedAmount) || fixedAmount <= 0) {
    return { discountAmount: 0, kind: "fixed" };
  }

  return { discountAmount: fixedAmount, kind: "fixed" };
}

async function fetchActivePromoCode(code) {
  const promoCode = normalizePromoCode(code);
  if (!promoCode) {
    return null;
  }

  const result = await getPool().query(
    `
      SELECT code, discount, status
      FROM promo_codes
      WHERE UPPER(code) = $1
      LIMIT 1;
    `,
    [promoCode]
  );

  if (!result.rows.length) {
    return null;
  }

  const promo = result.rows[0];
  const status = typeof promo.status === "string" ? promo.status.trim().toLowerCase() : "";

  if (status !== "active") {
    return { ...promo, inactive: true };
  }

  return { ...promo, inactive: false };
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
        promo_code,
        original_total_amount,
        discount_amount,
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
          RETURNING id, booking_code, payment_option, promo_code, original_total_amount, discount_amount, total_amount, amount_paid, balance, status;
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
        promo_code,
        original_total_amount,
        discount_amount,
        total_amount,
        amount_paid,
        balance,
        status
      )
      VALUES ($1, $2, $3, $4, NULL, $5, 0, $5, 0, $5, 'Awaiting payment')
      RETURNING id, booking_code, payment_option, promo_code, original_total_amount, discount_amount, total_amount, amount_paid, balance, status;
    `,
    [generateCode("BK"), customerId, packageId, paymentOption, totalAmount]
  );

  return createdBooking.rows[0];
}

async function createPaymentRecord({
  bookingId,
  phoneNumber,
  promoCode = null,
  originalTotalAmount = null,
  discountedTotalAmount = null,
  discountAmount = 0,
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
        promo_code,
        original_total_amount,
        discounted_total_amount,
        discount_amount,
        amount,
        reference,
        stk_status,
        checkout_request_id,
        merchant_request_id,
        response_description
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id;
    `,
    [
      generateCode("PAY"),
      bookingId,
      normalizeStoredPhoneNumber(phoneNumber),
      promoCode,
      originalTotalAmount,
      discountedTotalAmount,
      discountAmount,
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

  const { packageSlug, phoneNumber, amount, paymentOption, customerName, promoCode } = req.body || {};

  if (!packageSlug || typeof packageSlug !== "string") {
    return res.status(400).json({ message: "A valid adventure is required." });
  }

  if (!phoneNumber || typeof phoneNumber !== "string") {
    return res.status(400).json({ message: "A valid phone number is required." });
  }

  const trimmedCustomerName = typeof customerName === "string" ? customerName.trim() : "";
  if (!trimmedCustomerName) {
    return res.status(400).json({ message: "Customer name is required." });
  }

  if (paymentOption !== "full" && paymentOption !== "space") {
    return res.status(400).json({ message: "Select either full payment or book space." });
  }

  const requestedAmount = Number.parseInt(amount, 10);
  if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
    return res.status(400).json({ message: "Enter a valid amount to pay." });
  }

  let booking = null;
  let pricingDetails = null;

  try {
    const travelPackage = await fetchAdventureBySlug(packageSlug);
    if (!travelPackage) {
      return res.status(404).json({ message: "Adventure not found." });
    }

    const { fullAmount } = calculateMinimumBookingAmount(travelPackage);
    const enteredPromoCode = normalizePromoCode(promoCode);
    const promo = enteredPromoCode ? await fetchActivePromoCode(enteredPromoCode) : null;

    if (enteredPromoCode && !promo) {
      return res.status(400).json({ message: "Promo code not found." });
    }

    if (promo?.inactive) {
      return res.status(400).json({ message: "That promo code is not active." });
    }

    const { discountAmount: rawDiscountAmount } = promo
      ? parsePromoDiscount(promo.discount, fullAmount)
      : { discountAmount: 0 };
    const discountAmount = Math.max(Math.min(rawDiscountAmount, fullAmount), 0);
    const discountedTotalAmount = Math.max(fullAmount - discountAmount, 0);
    const minimumBookingAmount = Math.max(
      Number(travelPackage.deposit_required) || 0,
      Math.ceil(discountedTotalAmount / 2)
    );

    const client = await getPool().connect();
    let bookingBeforePromo = null;

    try {
      await client.query("BEGIN");

      const customer = await ensureCustomerRecord(client, { phoneNumber, customerName: trimmedCustomerName });
      booking = await ensureBookingRecord(client, {
        customerId: customer.id,
        packageId: travelPackage.id,
        paymentOption,
        totalAmount: fullAmount
      });

      bookingBeforePromo = booking;

      if (enteredPromoCode) {
        const existingPromoCode = typeof booking.promo_code === "string" ? booking.promo_code.trim().toUpperCase() : "";

        if (existingPromoCode && existingPromoCode !== enteredPromoCode) {
          await client.query("ROLLBACK");
          return res.status(400).json({ message: "A different promo code was already applied to this booking." });
        }

        if (!existingPromoCode) {
          const nextBalance = Math.max(discountedTotalAmount - Number(booking.amount_paid || 0), 0);
          const nextStatus = nextBalance === 0 ? "Confirmed" : booking.status;

          const updatedBooking = await client.query(
            `
              UPDATE bookings
              SET
                promo_code = $1,
                original_total_amount = $2,
                discount_amount = $3,
                total_amount = $4,
                balance = $5,
                status = $6,
                updated_at = NOW()
              WHERE id = $7
              RETURNING
                id,
                booking_code,
                payment_option,
                promo_code,
                original_total_amount,
                discount_amount,
                total_amount,
                amount_paid,
                balance,
                status;
            `,
            [
              enteredPromoCode,
              fullAmount,
              discountAmount,
              discountedTotalAmount,
              nextBalance,
              nextStatus,
              booking.id
            ]
          );

          booking = updatedBooking.rows[0];
        }
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    const remainingBalance = Number(booking.balance) || 0;
    if (remainingBalance <= 0) {
      return res.status(400).json({ message: "This booking is already fully paid." });
    }

    const requiredAmount =
      paymentOption === "full" ? remainingBalance : Math.min(minimumBookingAmount, remainingBalance);

    if (requestedAmount < requiredAmount) {
      return res.status(400).json({
        message: `Enter at least KES ${requiredAmount.toLocaleString()} for this payment option.`
      });
    }

    if (requestedAmount > remainingBalance) {
      return res.status(400).json({
        message: `Amount exceeds remaining balance of KES ${remainingBalance.toLocaleString()}.`
      });
    }

    if (paymentOption === "full" && requestedAmount !== remainingBalance) {
      return res.status(400).json({
        message: `To pay in full, enter the remaining balance of KES ${remainingBalance.toLocaleString()}.`
      });
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

    pricingDetails = {
      promoCode: booking.promo_code || "",
      originalTotalAmount: Number(booking.original_total_amount) || fullAmount,
      discountAmount: Number(booking.discount_amount) || 0,
      discountedTotalAmount: Number(booking.total_amount) || fullAmount,
      minimumBookingAmount,
      requiredAmount,
      remainingBalance
    };

    await createPaymentRecord({
      bookingId: booking.id,
      phoneNumber,
      promoCode: booking.promo_code || null,
      originalTotalAmount: pricingDetails.originalTotalAmount,
      discountedTotalAmount: pricingDetails.discountedTotalAmount,
      discountAmount: pricingDetails.discountAmount,
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
      data: stkResponse,
      pricing: pricingDetails
    });
  } catch (error) {
    if (booking) {
      try {
        await createPaymentRecord({
          bookingId: booking.id,
          phoneNumber,
          promoCode: booking.promo_code || null,
          originalTotalAmount: booking.original_total_amount || null,
          discountedTotalAmount: booking.total_amount || null,
          discountAmount: booking.discount_amount || 0,
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
