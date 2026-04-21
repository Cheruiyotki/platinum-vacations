import PackageCard from "./PackageCard";
import { usePackages } from "../context/PackageContext";

function PackagesSection() {
  const { packages, loading, error } = usePackages();

  return (
    <section id="packages" className="bg-secondary py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-success">
          Current Packages
        </p>
        <h2 className="mt-2 font-heading text-3xl font-extrabold text-white md:text-4xl">
          Fresh Adventures You Can Book Right Now
        </h2>

        {loading ? (
          <p className="mt-8 text-sm text-white/80">Loading packages...</p>
        ) : null}

        {error ? (
          <p className="mt-8 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-white">
            {error}
          </p>
        ) : null}

        {!loading && !error ? (
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            {packages.map((travelPackage) => (
              <PackageCard key={travelPackage.id} travelPackage={travelPackage} />
            ))}
          </div>
        ) : null}

        {!loading && !error && packages.length === 0 ? (
          <p className="mt-8 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/85">
            No packages are available right now. Please check back shortly.
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default PackagesSection;
