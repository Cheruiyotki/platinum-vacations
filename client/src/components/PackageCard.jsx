import { useEffect, useState } from "react";
import { FaCheckCircle, FaSpinner, FaTimes, FaTimesCircle } from "react-icons/fa";
import { requestStkPush } from "../api/payments";
import { handleAssetImageError } from "../utils/imageFallback";

function PackageCard({ travelPackage }) {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const fullAdventureAmount =
    Math.ceil(Number.parseFloat(String(travelPackage.cost).replace(/[^0-9.]/g, "")) || 0);
  const depositAmount = Number.isFinite(travelPackage.deposit_required)
    ? travelPackage.deposit_required
    : 0;
  const minimumBookingAmount = Math.max(
    depositAmount,
    Math.ceil(fullAdventureAmount / 2)
  );
  const includedItems = Array.isArray(travelPackage.includes_json) ? travelPackage.includes_json : [];
  const excludedItems = Array.isArray(travelPackage.excludes_json) ? travelPackage.excludes_json : [];
  const [paymentOption, setPaymentOption] = useState("space");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState(String(minimumBookingAmount));
  const [paymentError, setPaymentError] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const requiredAmount = paymentOption === "full" ? fullAdventureAmount : minimumBookingAmount;
  const parsedAmount = Number.parseFloat(amount);
  const isAmountValid = Number.isFinite(parsedAmount) && parsedAmount >= requiredAmount;

  useEffect(() => {
    if (!isPaymentOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isPaymentOpen]);

  const openPaymentCard = () => {
    setPaymentOption("space");
    setAmount(String(minimumBookingAmount));
    setPhoneNumber("");
    setPaymentError("");
    setPaymentMessage("");
    setIsPaymentOpen(true);
  };

  const closePaymentCard = () => {
    setIsPaymentOpen(false);
  };

  const handlePaymentOptionChange = (nextOption) => {
    setPaymentOption(nextOption);
    setAmount(String(nextOption === "full" ? fullAdventureAmount : minimumBookingAmount));
    setPaymentError("");
    setPaymentMessage("");
  };

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();

    if (!phoneNumber.trim()) {
      setPaymentError("Enter the Safaricom number that should receive the PIN prompt.");
      return;
    }

    if (!isAmountValid) {
      setPaymentError(`Enter at least KES ${requiredAmount.toLocaleString()} to continue.`);
      return;
    }

    try {
      setIsSubmittingPayment(true);
      setPaymentError("");
      setPaymentMessage("");

      const response = await requestStkPush({
        packageSlug: travelPackage.slug,
        paymentOption,
        amount: Math.round(parsedAmount),
        phoneNumber
      });

      setPaymentMessage(
        response.message || "STK push sent successfully. Check your phone and enter your M-Pesa PIN."
      );
    } catch (error) {
      setPaymentError(error.message || "Failed to send the M-Pesa prompt.");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  return (
    <>
      <article className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-neutral bg-white shadow-card">
        {travelPackage.duration_banner ? (
          <span className="absolute left-4 top-4 z-20 rounded-full bg-primary px-4 py-1 text-xs font-black uppercase tracking-wide text-white">
            {travelPackage.duration_banner}
          </span>
        ) : null}

        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={travelPackage.image_url}
            alt={travelPackage.title || "Travel adventure image"}
            className="h-full w-full object-cover"
            onError={(event) =>
              handleAssetImageError(
                event,
                "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80"
              )
            }
          />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary/75 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="font-heading text-2xl font-extrabold leading-tight text-white">
              {travelPackage.title}
            </h3>
            <p className="mt-1 text-sm font-semibold text-white/90">{travelPackage.dates}</p>
            {travelPackage.date_pill ? (
              <span className="mt-2 inline-flex rounded-full bg-success px-3 py-1 text-xs font-bold text-secondary">
                {travelPackage.date_pill}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <p className="font-heading text-3xl font-black text-primary">{travelPackage.cost}</p>
          {travelPackage.description ? (
            <p className="mt-1 text-sm font-medium text-secondary/70">{travelPackage.description}</p>
          ) : null}

          <div className="mt-5">
            <p className="font-heading text-base font-extrabold uppercase text-secondary">
              Adventure Includes
            </p>
            <ul className="mt-2.5 space-y-1.5">
              {includedItems.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-secondary/90">
                  <FaCheckCircle className="mt-[2px] shrink-0 text-success" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5">
            <p className="font-heading text-base font-extrabold uppercase text-secondary">
              Adventure Excludes
            </p>
            <ul className="mt-2.5 space-y-1.5">
              {excludedItems.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-secondary/90">
                  <FaTimesCircle className="mt-[2px] shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {travelPackage.pickup_point ? (
            <p className="mt-5 rounded-xl bg-secondary px-4 py-3 text-sm font-medium text-white">
              Pickup Point: <span className="font-bold">{travelPackage.pickup_point}</span>
            </p>
          ) : null}

          {travelPackage.note ? (
            <p className="mt-4 text-sm font-semibold text-secondary/75">{travelPackage.note}</p>
          ) : null}

          <p className="mt-5 rounded-xl bg-neutral px-4 py-3 text-sm font-medium text-secondary/80">
            Pay in full or book your space with at least KES {minimumBookingAmount.toLocaleString()}.
            Complete the balance by the day before the trip.
          </p>

          <button
            type="button"
            onClick={openPaymentCard}
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-secondary"
          >
            Book
          </button>
        </div>
      </article>

      {isPaymentOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-secondary/70 px-4 py-6 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-white/15 bg-white shadow-2xl">
            <button
              type="button"
              onClick={closePaymentCard}
              className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-white transition hover:bg-primary"
              aria-label="Close payment card"
            >
              <FaTimes />
            </button>

            <div className="grid md:grid-cols-[1.05fr_0.95fr]">
              <div className="bg-secondary px-6 py-8 text-white md:px-8">
                <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-white/85">
                  Adventure Payment
                </p>
                <h3 className="mt-5 font-heading text-3xl font-extrabold leading-tight">
                  {travelPackage.title}
                </h3>
                <p className="mt-3 text-sm text-white/80">{travelPackage.dates}</p>

                <div className="mt-8 space-y-3">
                  <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4">
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/65">
                      Full Amount
                    </p>
                    <p className="mt-2 font-heading text-3xl font-black text-success">
                      KES {fullAdventureAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4">
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/65">
                      Book Space From
                    </p>
                    <p className="mt-2 font-heading text-3xl font-black text-white">
                      KES {minimumBookingAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-8 rounded-2xl border border-white/15 bg-primary/90 px-4 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/70">
                    Till Number
                  </p>
                  <p className="mt-2 font-heading text-4xl font-black text-white">46 19 122</p>
                  <p className="mt-3 text-sm text-white/85">
                    Use Buy Goods and Services on M-Pesa, then send the payment details for quick confirmation.
                  </p>
                </div>
              </div>

              <div className="px-6 py-8 md:px-8">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary/55">
                    Choose Payment Type
                  </p>
                  <div className="mt-4 grid gap-3">
                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-neutral px-4 py-4 transition hover:border-primary/35">
                      <input
                        type="radio"
                        name={`payment-option-${travelPackage.id}`}
                        value="full"
                        checked={paymentOption === "full"}
                        onChange={() => handlePaymentOptionChange("full")}
                        className="mt-1 h-4 w-4 accent-primary"
                      />
                      <span>
                        <span className="block text-sm font-bold text-secondary">Pay full amount</span>
                        <span className="mt-1 block text-sm text-secondary/65">
                          Clear the whole trip at once for a faster confirmation.
                        </span>
                      </span>
                    </label>

                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-neutral px-4 py-4 transition hover:border-primary/35">
                      <input
                        type="radio"
                        name={`payment-option-${travelPackage.id}`}
                        value="space"
                        checked={paymentOption === "space"}
                        onChange={() => handlePaymentOptionChange("space")}
                        className="mt-1 h-4 w-4 accent-primary"
                      />
                      <span>
                        <span className="block text-sm font-bold text-secondary">Book a space</span>
                        <span className="mt-1 block text-sm text-secondary/65">
                          Pay at least half now and clear the rest the day before the trip.
                        </span>
                      </span>
                    </label>
                  </div>
                </div>

                <form className="mt-6" onSubmit={handlePaymentSubmit}>
                  <div className="grid gap-4">
                  <label className="block">
                    <span className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary/55">
                      Enter Amount
                    </span>
                    <input
                      type="number"
                      min={requiredAmount}
                      step="1"
                      value={amount}
                      onChange={(event) => {
                        setAmount(event.target.value);
                        setPaymentError("");
                        setPaymentMessage("");
                      }}
                      className="mt-2 w-full rounded-2xl border border-neutral bg-accent px-4 py-3 text-base font-semibold text-secondary outline-none transition focus:border-primary"
                      placeholder={`KES ${requiredAmount.toLocaleString()}`}
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary/55">
                      Enter Number To Pay
                    </span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(event) => {
                        setPhoneNumber(event.target.value);
                        setPaymentError("");
                        setPaymentMessage("");
                      }}
                      className="mt-2 w-full rounded-2xl border border-neutral bg-accent px-4 py-3 text-base font-semibold text-secondary outline-none transition focus:border-primary"
                      placeholder="07XXXXXXXX"
                    />
                  </label>
                  </div>

                  <div className="mt-5 rounded-2xl bg-neutral px-4 py-4 text-sm text-secondary/75">
                    {paymentOption === "full"
                      ? `Your full payment for this adventure is KES ${fullAdventureAmount.toLocaleString()}.`
                      : `To reserve your space, enter at least KES ${minimumBookingAmount.toLocaleString()}.`}
                  </div>

                  {!isAmountValid ? (
                    <p className="mt-3 text-sm font-semibold text-primary">
                      Enter at least KES {requiredAmount.toLocaleString()} to continue with this option.
                    </p>
                  ) : null}

                  {paymentError ? (
                    <p className="mt-3 rounded-2xl bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
                      {paymentError}
                    </p>
                  ) : null}

                  {paymentMessage ? (
                    <p className="mt-3 rounded-2xl bg-success/15 px-4 py-3 text-sm font-semibold text-secondary">
                      {paymentMessage}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isSubmittingPayment}
                    className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white transition ${
                      isSubmittingPayment ? "bg-primary/70" : "bg-primary hover:bg-secondary"
                    }`}
                  >
                    {isSubmittingPayment ? <FaSpinner className="animate-spin text-base" /> : null}
                    Continue To Pay
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default PackageCard;
