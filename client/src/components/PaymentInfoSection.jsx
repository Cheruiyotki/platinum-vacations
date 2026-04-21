import { FaQuoteLeft, FaStar } from "react-icons/fa";
import { usePackages } from "../context/PackageContext";

const reviews = [
  {
    name: "Sharon W.",
    text: "The trip was well organized, communication was smooth, and the whole experience felt worth it from start to finish."
  },
  {
    name: "Brian K.",
    text: "I loved the flexible payment plan and how easy it was to secure my spot before clearing the balance later."
  },
  {
    name: "Mercy N.",
    text: "Friendly team, beautiful destinations, and great coordination on the day of travel. I would book again."
  },
  {
    name: "Dennis M.",
    text: "The payment process was simple and the team kept us updated before the trip."
  },
  {
    name: "Faith G.",
    text: "Pickup was well communicated and the whole adventure felt smooth and enjoyable."
  },
  {
    name: "Kelvin T.",
    text: "Nice planning, fair pricing, and a very professional travel experience overall."
  }
];

function PaymentInfoSection() {
  const { packages } = usePackages();

  const mombasaDeposit =
    packages.find((pkg) => pkg.slug === "mombasa-malindi-summer-tides")?.deposit_required ?? 5000;
  const wrcDeposit =
    packages.find((pkg) => pkg.slug === "wrc-naivasha-experience")?.deposit_required ?? 1000;

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
              A few kind words from people who have traveled with Platinum Vacations.
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {reviews.map((review) => (
                <article
                  key={review.name}
                  className="rounded-2xl border border-neutral bg-accent px-4 py-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-success">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <FaStar key={`${review.name}-${index}`} className="text-xs" />
                      ))}
                    </div>
                    <FaQuoteLeft className="text-sm text-primary/30" />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-secondary/78">{review.text}</p>
                  <p className="mt-3 text-sm font-bold text-secondary">{review.name}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PaymentInfoSection;
