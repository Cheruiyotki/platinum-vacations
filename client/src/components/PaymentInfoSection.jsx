import { useState } from "react";
import { FaPaperPlane, FaQuoteLeft, FaSpinner, FaStar } from "react-icons/fa";
import { createReview } from "../api/reviews";
import { usePackages } from "../context/PackageContext";
import { useReviews } from "../context/ReviewContext";

function PaymentInfoSection() {
  const { packages } = usePackages();
  const { reviews, loading: reviewsLoading, error: reviewsError, refreshReviews } = useReviews();
  const [reviewForm, setReviewForm] = useState({
    name: "",
    rating: 5,
    review_text: ""
  });
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const mombasaDeposit =
    packages.find((pkg) => pkg.slug === "mombasa-malindi-summer-tides")?.deposit_required ?? 5000;
  const wrcDeposit =
    packages.find((pkg) => pkg.slug === "wrc-naivasha-experience")?.deposit_required ?? 1000;

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    if (!reviewForm.name.trim() || !reviewForm.review_text.trim()) {
      setReviewError("Name and review message are required.");
      return;
    }

    try {
      setIsSubmittingReview(true);
      setReviewError("");
      setReviewMessage("");

      const response = await createReview(reviewForm);
      setReviewMessage(response.message);
      setReviewForm({
        name: "",
        rating: 5,
        review_text: ""
      });
      await refreshReviews();
    } catch (error) {
      setReviewError(error.message || "Failed to submit review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <section id="pay-now" className="py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
          <div className="grid gap-4">
            <div className="rounded-3xl bg-secondary p-6 text-white shadow-card md:p-7">
              <h2 className="font-heading text-2xl font-extrabold">
                Easy Booking with Lipa Mdogo Mdogo
              </h2>
              <p className="mt-3 text-sm text-white/80">
                Secure your slot with a flexible payment plan.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/70">WRC Deposit</p>
                  <p className="mt-2 font-heading text-2xl font-extrabold">
                    KES {wrcDeposit.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/70">
                    Mombasa Deposit
                  </p>
                  <p className="mt-2 font-heading text-2xl font-extrabold">
                    KES {mombasaDeposit.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral bg-white p-6 shadow-card md:p-7">
              <div className="inline-flex rounded-full bg-success/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-secondary">
                M-Pesa Payment
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-secondary/55">
                Till Number
              </p>
              <p className="mt-1 font-heading text-4xl font-black text-success">46 19 122</p>

              <ol className="mt-5 grid gap-2 text-sm font-medium text-secondary/80">
                <li className="rounded-xl border border-neutral bg-accent px-4 py-3">
                  1. Lipa na M-PESA
                </li>
                <li className="rounded-xl border border-neutral bg-accent px-4 py-3">
                  2. Buy Goods and Services
                </li>
                <li className="rounded-xl border border-neutral bg-accent px-4 py-3">
                  3. Enter Till Number
                </li>
                <li className="rounded-xl border border-neutral bg-accent px-4 py-3">
                  4. Enter Amount
                </li>
              </ol>
            </div>
          </div>

          <div className="rounded-3xl border border-neutral bg-white p-6 shadow-card md:p-7">
            <div className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-primary">
              Reviews & Feedback
            </div>
            <h3 className="mt-4 font-heading text-2xl font-extrabold text-secondary md:text-3xl">
              What Travelers Say
            </h3>
            <p className="mt-2 text-sm text-secondary/70">
              Approved reviews from travelers who have experienced Platinum Vacations.
            </p>

            {reviewsError ? (
              <p className="mt-4 rounded-2xl bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
                {reviewsError}
              </p>
            ) : null}

            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {reviewsLoading ? (
                <p className="text-sm text-secondary/70">Loading reviews...</p>
              ) : null}

              {!reviewsLoading && reviews.length === 0 ? (
                <p className="text-sm text-secondary/70">
                  No approved reviews are live yet. Be the first to leave one below.
                </p>
              ) : null}

              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-2xl border border-neutral bg-accent px-4 py-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-success">
                      {Array.from({ length: review.rating }).map((_, index) => (
                        <FaStar key={`${review.id}-${index}`} className="text-xs" />
                      ))}
                    </div>
                    <FaQuoteLeft className="text-sm text-primary/30" />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-secondary/78">{review.review_text}</p>
                  <p className="mt-3 text-sm font-bold text-secondary">{review.name}</p>
                </article>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-neutral bg-accent p-5">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/55">
                    Add Review
                  </p>
                  <h4 className="mt-2 font-heading text-2xl font-black text-secondary">
                    Share Your Feedback
                  </h4>
                </div>
                <p className="text-sm text-secondary/65">
                  Reviews are checked by admin before they appear on the website.
                </p>
              </div>

              <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleReviewSubmit}>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/55">
                    Your Name
                  </span>
                  <input
                    value={reviewForm.name}
                    onChange={(event) => {
                      setReviewForm((currentForm) => ({ ...currentForm, name: event.target.value }));
                      setReviewError("");
                      setReviewMessage("");
                    }}
                    className="mt-2 w-full rounded-2xl border border-neutral bg-white px-4 py-3 text-sm outline-none transition focus:border-primary"
                    placeholder="Enter your name"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/55">
                    Rating
                  </span>
                  <select
                    value={reviewForm.rating}
                    onChange={(event) => {
                      setReviewForm((currentForm) => ({
                        ...currentForm,
                        rating: Number(event.target.value)
                      }));
                      setReviewError("");
                      setReviewMessage("");
                    }}
                    className="mt-2 w-full rounded-2xl border border-neutral bg-white px-4 py-3 text-sm outline-none transition focus:border-primary"
                  >
                    <option value={5}>5 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={2}>2 Stars</option>
                    <option value={1}>1 Star</option>
                  </select>
                </label>

                <label className="block md:col-span-2">
                  <span className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/55">
                    Your Feedback
                  </span>
                  <textarea
                    rows="4"
                    value={reviewForm.review_text}
                    onChange={(event) => {
                      setReviewForm((currentForm) => ({
                        ...currentForm,
                        review_text: event.target.value
                      }));
                      setReviewError("");
                      setReviewMessage("");
                    }}
                    className="mt-2 w-full rounded-2xl border border-neutral bg-white px-4 py-3 text-sm outline-none transition focus:border-primary"
                    placeholder="Tell us how your adventure went..."
                  />
                </label>

                {reviewError ? (
                  <p className="md:col-span-2 rounded-2xl bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
                    {reviewError}
                  </p>
                ) : null}

                {reviewMessage ? (
                  <p className="md:col-span-2 rounded-2xl bg-success/15 px-4 py-3 text-sm font-semibold text-secondary">
                    {reviewMessage}
                  </p>
                ) : null}

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-secondary"
                  >
                    {isSubmittingReview ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                    {isSubmittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PaymentInfoSection;
