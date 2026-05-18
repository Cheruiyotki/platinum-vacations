import { API_BASE } from "./base";
import { readJson } from "./http";

export const DEFAULT_SITE_CONTENT = {
  aboutText:
    "Platinum Vacations is based in Nyeri and specializes in carefully planned travel adventures across Kenya.",
  contactPhones: "0740629899, 0768070634, 0711757863",
  footerEmail: "platinumvacationske@gmail.com",
  paymentInstructions:
    "Customers can pay in full or reserve a space with at least half upfront and clear the balance the day before the trip.",
  footerLinks: "Instagram, TikTok, WhatsApp"
};

function normalizeGalleryItem(item, index) {
  const safeItem = typeof item === "object" && item !== null ? item : {};

  return {
    id: safeItem.id ?? index + 1,
    src:
      typeof safeItem.src === "string" && safeItem.src.trim() ? safeItem.src.trim() : "/assets/image_1.png",
    location:
      typeof safeItem.location === "string" && safeItem.location.trim()
        ? safeItem.location.trim()
        : "Location"
  };
}

function normalizeSiteContent(content) {
  const safeContent = typeof content === "object" && content !== null ? content : {};

  return {
    aboutText:
      typeof safeContent.aboutText === "string" && safeContent.aboutText.trim()
        ? safeContent.aboutText.trim()
        : DEFAULT_SITE_CONTENT.aboutText,
    contactPhones:
      typeof safeContent.contactPhones === "string" && safeContent.contactPhones.trim()
        ? safeContent.contactPhones.trim()
        : DEFAULT_SITE_CONTENT.contactPhones,
    footerEmail:
      typeof safeContent.footerEmail === "string" && safeContent.footerEmail.trim()
        ? safeContent.footerEmail.trim()
        : DEFAULT_SITE_CONTENT.footerEmail,
    paymentInstructions:
      typeof safeContent.paymentInstructions === "string" && safeContent.paymentInstructions.trim()
        ? safeContent.paymentInstructions.trim()
        : DEFAULT_SITE_CONTENT.paymentInstructions,
    footerLinks:
      typeof safeContent.footerLinks === "string" && safeContent.footerLinks.trim()
        ? safeContent.footerLinks.trim()
        : DEFAULT_SITE_CONTENT.footerLinks
  };
}

export async function fetchSiteContent() {
  const response = await fetch(`${API_BASE}/api/site/content`);
  const data = await readJson(response, "Failed to load site content.");

  return normalizeSiteContent(data);
}

export async function fetchVisibleGalleryItems() {
  const response = await fetch(`${API_BASE}/api/site/gallery`);
  const data = await readJson(response, "Failed to load gallery items.");

  if (!Array.isArray(data)) {
    throw new Error("Invalid gallery data received.");
  }

  return data.map(normalizeGalleryItem);
}
