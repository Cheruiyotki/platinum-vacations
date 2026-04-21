import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { handleAssetImageError } from "../utils/imageFallback";

function PackageCard({ travelPackage }) {
  const depositAmount = Number.isFinite(travelPackage.deposit_required)
    ? travelPackage.deposit_required
    : 0;
  const minimumBookingAmount = Math.max(
    depositAmount,
    Math.ceil((Number.parseFloat(String(travelPackage.cost).replace(/[^0-9.]/g, "")) || 0) / 2)
  );
  const includedItems = Array.isArray(travelPackage.includes_json) ? travelPackage.includes_json : [];
  const excludedItems = Array.isArray(travelPackage.excludes_json) ? travelPackage.excludes_json : [];

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-neutral bg-white shadow-card">
      {travelPackage.duration_banner ? (
        <span className="absolute left-4 top-4 z-20 rounded-full bg-primary px-4 py-1 text-xs font-black uppercase tracking-wide text-white">
          {travelPackage.duration_banner}
        </span>
      ) : null}

      <div className="relative h-56 w-full overflow-hidden">
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

      <div className="flex flex-1 flex-col p-6">
        <p className="font-heading text-3xl font-black text-primary">{travelPackage.cost}</p>
        {travelPackage.description ? (
          <p className="mt-1 text-sm font-medium text-secondary/70">{travelPackage.description}</p>
        ) : null}

        <div className="mt-6">
          <p className="font-heading text-base font-extrabold uppercase text-secondary">
            Adventure Includes
          </p>
          <ul className="mt-3 space-y-2">
            {includedItems.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-secondary/90">
                <FaCheckCircle className="mt-[2px] shrink-0 text-success" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <p className="font-heading text-base font-extrabold uppercase text-secondary">
            Adventure Excludes
          </p>
          <ul className="mt-3 space-y-2">
            {excludedItems.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-secondary/90">
                <FaTimesCircle className="mt-[2px] shrink-0 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {travelPackage.pickup_point ? (
          <p className="mt-6 rounded-xl bg-secondary px-4 py-3 text-sm font-medium text-white">
            Pickup Point: <span className="font-bold">{travelPackage.pickup_point}</span>
          </p>
        ) : null}

        {travelPackage.note ? (
          <p className="mt-4 text-sm font-semibold text-secondary/75">{travelPackage.note}</p>
        ) : null}

        <p className="mt-6 rounded-xl bg-neutral px-4 py-3 text-sm font-medium text-secondary/80">
          Pay in full or book your space with at least KES {minimumBookingAmount.toLocaleString()}.
          Complete the balance by the day before the trip.
        </p>

        <a
          href={`https://wa.me/254740629899?text=${encodeURIComponent(
            `Hello Platinum Vacations, I would like to book the ${travelPackage.title}.`
          )}`}
          target="_blank"
          rel="noreferrer"
          className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-secondary"
        >
          Book
        </a>
      </div>
    </article>
  );
}

export default PackageCard;
