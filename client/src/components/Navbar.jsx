import { useEffect, useState } from "react";
import { FaBars, FaTimes, FaWhatsapp } from "react-icons/fa";
import { handleAssetImageError } from "../utils/imageFallback";

const navItems = [
  { id: "home", label: "Home" },
  { id: "packages", label: "Adventures" },
  { id: "about", label: "About" },
  { id: "pay-now", label: "Pay Now" }
];

function Navbar({ onNavigate }) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Background appears after scrolling 50px down.
      setHasScrolled(window.scrollY > 50);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- Dynamic Styles ---
  
  // 1. Header Wrapper
  const headerClassName = `fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out ${
    hasScrolled ? "py-3 px-2 md:px-4" : "bg-transparent py-6"
  }`;
  const navSurfaceClassName = `mx-auto w-full max-w-7xl px-4 md:px-6 transition-all duration-300 ${
    hasScrolled
      ? "rounded-2xl border border-neutral/80 bg-white/95 py-2 shadow-lg backdrop-blur-md"
      : ""
  }`;

  // 2. Text Colors
  const linkTextColor = hasScrolled 
    ? "text-secondary hover:text-primary" 
    : "text-white hover:text-white/80";

  // 3. Logo/Brand Text
  const brandTextColor = hasScrolled ? "text-primary" : "text-white";
  const taglineColor = hasScrolled ? "text-secondary/70" : "text-white/80";
  const mobileIconButtonClass = hasScrolled
    ? "inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral bg-white text-secondary transition hover:text-primary md:hidden"
    : "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white transition hover:bg-white/20 md:hidden";
  const mobileMenuPanelClass = hasScrolled
    ? "mt-3 rounded-2xl border border-neutral bg-white p-3 shadow-md md:hidden"
    : "mt-3 rounded-2xl border border-white/30 bg-secondary/35 p-3 backdrop-blur-sm md:hidden";
  const mobileMenuItemClass = hasScrolled
    ? "w-full rounded-xl px-3 py-2 text-left text-xs font-bold uppercase tracking-widest text-secondary transition hover:bg-neutral"
    : "w-full rounded-xl px-3 py-2 text-left text-xs font-bold uppercase tracking-widest text-white transition hover:bg-white/15";

  return (
    <header className={headerClassName}>
      <div className={navSurfaceClassName}>
        <div className="flex items-center justify-between gap-3">
          
          {/* Logo & Branding */}
          <button 
            type="button"
            onClick={() => {
              onNavigate("home");
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 group"
          >
            <img
              src="/assets/image_0.png"
              alt="Platinum Vacations Logo"
              className={`h-12 w-12 rounded-full border object-cover transition-all ${
                hasScrolled ? "border-neutral shadow-sm" : "border-white/40"
              }`}
              onError={(event) =>
                handleAssetImageError(
                  event,
                  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=200&q=80"
                )
              }
            />
            <div className="text-left">
              <p className={`font-heading text-sm font-black uppercase tracking-tight transition-colors duration-300 ${brandTextColor}`}>
                Platinum Vacations
              </p>
              <p className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${taglineColor}`}>
                Travel The World
              </p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`text-xs font-bold uppercase tracking-widest transition-all duration-300 ${linkTextColor}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="https://wa.me/254740629899"
              target="_blank"
              rel="noreferrer"
              className={mobileIconButtonClass}
              aria-label="Book on WhatsApp"
            >
              <FaWhatsapp className="text-lg" />
            </a>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((previous) => !previous)}
              className={mobileIconButtonClass}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav-menu"
            >
              {isMobileMenuOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
            </button>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/254740629899"
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-xl transition-all hover:bg-secondary active:scale-95 md:flex"
            >
              <FaWhatsapp className="text-lg" />
              <span className="hidden lg:inline">Book via WhatsApp</span>
            </a>
          </div>
        </div>

        {isMobileMenuOpen ? (
          <nav id="mobile-nav-menu" className={mobileMenuPanelClass}>
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <button
                  key={`mobile-${item.id}`}
                  type="button"
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={mobileMenuItemClass}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
        ) : null}
      </div>
    </header>
  );
}

export default Navbar;
