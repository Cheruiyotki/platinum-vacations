import { usePackages } from "../context/PackageContext";

function PaymentInfoSection() {
  const { packages } = usePackages();

  const mombasaDeposit =
    packages.find((pkg) => pkg.slug === "mombasa-malindi-summer-tides")?.deposit_required ?? 5000;
  const wrcDeposit =
    packages.find((pkg) => pkg.slug === "wrc-naivasha-experience")?.deposit_required ?? 1000;

  return (
    <section id="pay-now" className="py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="overflow-hidden rounded-3xl border border-neutral bg-white shadow-card">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="bg-secondary p-8 text-white md:p-10">
              <h2 className="font-heading text-3xl font-extrabold">
                Easy Booking with Lipa Mdogo Mdogo
              </h2>
              <p className="mt-4 text-white/85">
                Secure your slot today with a flexible installment plan.
              </p>

              <div className="mt-7 space-y-3">
                <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
                  <p className="text-sm uppercase tracking-wide text-white/80">WRC Deposit</p>
                  <p className="font-heading text-2xl font-extrabold">
                    KES {wrcDeposit.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
                  <p className="text-sm uppercase tracking-wide text-white/80">Mombasa Deposit</p>
                  <p className="font-heading text-2xl font-extrabold">
                    KES {mombasaDeposit.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 md:p-10">
              <div className="inline-flex rounded-full bg-success/20 px-4 py-2 text-sm font-bold text-secondary">
                M-Pesa Payment Details
              </div>
              <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-secondary/60">
                Till Number
              </p>
              <p className="font-heading text-4xl font-black text-success">46 19 122</p>

              <ol className="mt-7 space-y-3 text-sm font-medium text-secondary/85">
                <li className="rounded-xl border border-neutral px-4 py-3">
                  1. Lipa na M-PESA
                </li>
                <li className="rounded-xl border border-neutral px-4 py-3">
                  2. Buy Goods and Services
                </li>
                <li className="rounded-xl border border-neutral px-4 py-3">
                  3. Enter Till Number
                </li>
                <li className="rounded-xl border border-neutral px-4 py-3">4. Enter Amount</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PaymentInfoSection;
