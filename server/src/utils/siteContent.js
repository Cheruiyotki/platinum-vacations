const DEFAULT_CONTENT_STATE = {
  aboutText:
    "Platinum Vacations is based in Nyeri and specializes in carefully planned travel adventures across Kenya.",
  contactPhones: "0740629899, 0768070634, 0711757863",
  footerEmail: "platinumvacationske@gmail.com",
  paymentInstructions:
    "Customers can pay in full or reserve a space with at least half upfront and clear the balance the day before the trip.",
  footerLinks: "Instagram, TikTok, WhatsApp"
};

function formatContentRow(row) {
  if (!row) {
    return { ...DEFAULT_CONTENT_STATE };
  }

  return {
    aboutText: row.about_text || DEFAULT_CONTENT_STATE.aboutText,
    contactPhones: row.contact_phones || DEFAULT_CONTENT_STATE.contactPhones,
    footerEmail: row.footer_email || DEFAULT_CONTENT_STATE.footerEmail,
    paymentInstructions: row.payment_instructions || DEFAULT_CONTENT_STATE.paymentInstructions,
    footerLinks: row.footer_links || DEFAULT_CONTENT_STATE.footerLinks
  };
}

module.exports = {
  DEFAULT_CONTENT_STATE,
  formatContentRow
};
