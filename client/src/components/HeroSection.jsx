import { handleAssetImageError } from "../utils/imageFallback";

function HeroSection({ onViewPackages }) {
  return (
    <section id="home" className="relative isolate overflow-hidden">
      <img
        src="/assets/image_1.png"
        alt="Platinum Vacations hero resort view"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        onError={(event) =>
          handleAssetImageError(
            event,
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80"
          )
        }
      />
      <div className="absolute inset-0 -z-10 bg-hero-overlay" />
      <div className="mx-auto flex min-h-[72vh] w-full max-w-7xl items-center px-4 py-16 md:px-6">
        <div className="max-w-3xl">
          <p className="mb-5 inline-flex rounded-full border border-white/40 bg-white/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.28em] text-white">
            Kenya Travel Agency
          </p>
          <h1 className="font-heading text-4xl font-extrabold leading-tight text-white md:text-6xl">
            Explore Breathtaking Landscapes
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/90 md:text-xl">
            Affordable, Expertly Guided Trips Across Kenya.
          </p>
          <button
            type="button"
            onClick={onViewPackages}
            className="mt-8 rounded-full bg-primary px-7 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-secondary"
          >
            View Packages
          </button>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
