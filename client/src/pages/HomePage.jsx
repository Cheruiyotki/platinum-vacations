import AboutSection from "../components/AboutSection";
import Footer from "../components/Footer";
import HeroSection from "../components/HeroSection";
import InstagramFeedSection from "../components/InstagramFeedSection";
import Navbar from "../components/Navbar";
import PackagesSection from "../components/PackagesSection";
import PaymentInfoSection from "../components/PaymentInfoSection";

function HomePage() {
  const scrollToSection = (sectionId) => {
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="app-shell min-h-screen">
      <Navbar onNavigate={scrollToSection} />
      <main>
        <HeroSection onViewPackages={() => scrollToSection("packages")} />
        <AboutSection />
        <PackagesSection />
        <PaymentInfoSection />
        <InstagramFeedSection />
      </main>
      <Footer />
    </div>
  );
}

export default HomePage;
