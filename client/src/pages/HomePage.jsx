import { useEffect, useState } from "react";
import { DEFAULT_SITE_CONTENT, fetchSiteContent } from "../api/site";
import AboutSection from "../components/AboutSection";
import Footer from "../components/Footer";
import HeroSection from "../components/HeroSection";
import InstagramFeedSection from "../components/InstagramFeedSection";
import Navbar from "../components/Navbar";
import PackagesSection from "../components/PackagesSection";
import PaymentInfoSection from "../components/PaymentInfoSection";
import TravelAssistant from "../components/TravelAssistant";

function HomePage() {
  const [siteContent, setSiteContent] = useState(DEFAULT_SITE_CONTENT);

  useEffect(() => {
    let isMounted = true;

    fetchSiteContent()
      .then((content) => {
        if (isMounted) {
          setSiteContent(content);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

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
        <AboutSection aboutText={siteContent.aboutText} />
        <PackagesSection />
        <PaymentInfoSection paymentInstructions={siteContent.paymentInstructions} />
        <InstagramFeedSection />
      </main>
      <Footer
        contactPhones={siteContent.contactPhones}
        footerEmail={siteContent.footerEmail}
        footerLinks={siteContent.footerLinks}
      />
      <TravelAssistant />
    </div>
  );
}

export default HomePage;
