import { FaWhatsapp } from "react-icons/fa";
import { handleAssetImageError } from "../utils/imageFallback";

const navItems = [
  { id: "home", label: "Home" },
  { id: "packages", label: "Packages" },
  { id: "about", label: "About" },
  { id: "pay-now", label: "Pay Now" }
];

function Navbar({ onNavigate }) {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral/70 bg-white/95 backdrop-blur">
      <div className="mx-auto w-full max-w-7xl px-4 py-3 md:px-6">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onNavigate("home")}
            className="flex items-center gap-3"
            aria-label="Go to home section"
          >
            <img
              src="/assets/image_0.png"
              alt="Platinum Vacations logo"
              className="h-11 w-11 rounded-full border border-neutral object-cover"
              onError={(event) =>
                handleAssetImageError(
                  event,
                  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=200&q=80"
                )
              }
            />
            <div className="text-left">
              <p className="font-heading text-sm font-extrabold uppercase tracking-wide text-primary">
                Platinum Vacations
              </p>
              <p className="text-xs font-medium text-secondary/70">Travel The World</p>
            </div>
          </button>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className="text-sm font-semibold text-secondary transition hover:text-primary"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <a
            href="https://wa.me/254740629899?text=Hello%20Platinum%20Vacations%2C%20I%20want%20to%20book%20a%20trip."
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-secondary"
          >
            <FaWhatsapp className="text-base" />
            Book WhatsApp
          </a>
        </div>

        <nav className="mt-3 flex items-center justify-center gap-5 border-t border-neutral pt-3 md:hidden">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className="text-xs font-bold uppercase tracking-wide text-secondary/80 transition hover:text-primary"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
