import { API_BASE } from "./base";

function normalizeBooking(booking, index) {
  const safeBooking = typeof booking === "object" && booking !== null ? booking : {};

  return {
    id: safeBooking.id ?? `BK-${index + 1}`,
    customer:
      typeof safeBooking.customer === "string" && safeBooking.customer.trim()
        ? safeBooking.customer.trim()
        : "Customer",
    adventure:
      typeof safeBooking.adventure === "string" && safeBooking.adventure.trim()
        ? safeBooking.adventure.trim()
        : "Adventure",
    option:
      typeof safeBooking.option === "string" && safeBooking.option.trim()
        ? safeBooking.option.trim()
        : "Book space",
    amountPaid: Number(safeBooking.amountPaid) || 0,
    balance: Number(safeBooking.balance) || 0,
    phone:
      typeof safeBooking.phone === "string" && safeBooking.phone.trim()
        ? safeBooking.phone.trim()
        : "N/A",
    status:
      typeof safeBooking.status === "string" && safeBooking.status.trim()
        ? safeBooking.status.trim()
        : "Awaiting payment"
  };
}

function normalizePayment(payment, index) {
  const safePayment = typeof payment === "object" && payment !== null ? payment : {};

  return {
    id: safePayment.id ?? `PAY-${index + 1}`,
    phone:
      typeof safePayment.phone === "string" && safePayment.phone.trim()
        ? safePayment.phone.trim()
        : "N/A",
    amount: Number(safePayment.amount) || 0,
    reference:
      typeof safePayment.reference === "string" && safePayment.reference.trim()
        ? safePayment.reference.trim()
        : `PAYMENT-${index + 1}`,
    stkStatus:
      typeof safePayment.stkStatus === "string" && safePayment.stkStatus.trim()
        ? safePayment.stkStatus.trim()
        : "Pending",
    balance: Number(safePayment.balance) || 0
  };
}

function normalizeCustomer(customer, index) {
  const safeCustomer = typeof customer === "object" && customer !== null ? customer : {};

  return {
    id: safeCustomer.id ?? `CUS-${index + 1}`,
    name:
      typeof safeCustomer.name === "string" && safeCustomer.name.trim()
        ? safeCustomer.name.trim()
        : "Customer",
    phone:
      typeof safeCustomer.phone === "string" && safeCustomer.phone.trim()
        ? safeCustomer.phone.trim()
        : "N/A",
    bookedAdventure:
      typeof safeCustomer.bookedAdventure === "string" && safeCustomer.bookedAdventure.trim()
        ? safeCustomer.bookedAdventure.trim()
        : "No booking yet",
    progress:
      typeof safeCustomer.progress === "string" && safeCustomer.progress.trim()
        ? safeCustomer.progress.trim()
        : "Lead",
    notes:
      typeof safeCustomer.notes === "string" && safeCustomer.notes.trim()
        ? safeCustomer.notes.trim()
        : "No customer notes yet."
  };
}

function normalizeMessage(message, index) {
  const safeMessage = typeof message === "object" && message !== null ? message : {};

  return {
    id: safeMessage.id ?? `MSG-${index + 1}`,
    source:
      typeof safeMessage.source === "string" && safeMessage.source.trim()
        ? safeMessage.source.trim()
        : "Website AI",
    topic:
      typeof safeMessage.topic === "string" && safeMessage.topic.trim()
        ? safeMessage.topic.trim()
        : "General inquiry",
    summary:
      typeof safeMessage.summary === "string" && safeMessage.summary.trim()
        ? safeMessage.summary.trim()
        : "No summary available.",
    unanswered: Boolean(safeMessage.unanswered)
  };
}

function normalizeGalleryItem(item, index) {
  const safeItem = typeof item === "object" && item !== null ? item : {};

  return {
    id: safeItem.id ?? `GAL-${index + 1}`,
    dbId: Number(safeItem.dbId) || Number(safeItem.id?.replace?.("GAL-", "")) || index + 1,
    src:
      typeof safeItem.src === "string" && safeItem.src.trim() ? safeItem.src.trim() : "/assets/image_1.png",
    location:
      typeof safeItem.location === "string" && safeItem.location.trim()
        ? safeItem.location.trim()
        : "Location",
    visible: Boolean(safeItem.visible),
    sortOrder: Number(safeItem.sortOrder) || index + 1
  };
}

function normalizeAnnouncement(item, index) {
  const safeItem = typeof item === "object" && item !== null ? item : {};

  return {
    id: safeItem.id ?? `ANN-${index + 1}`,
    dbId: Number(safeItem.dbId) || Number(safeItem.id?.replace?.("ANN-", "")) || index + 1,
    title:
      typeof safeItem.title === "string" && safeItem.title.trim()
        ? safeItem.title.trim()
        : "Announcement",
    status:
      typeof safeItem.status === "string" && safeItem.status.trim()
        ? safeItem.status.trim()
        : "Draft",
    body:
      typeof safeItem.body === "string" && safeItem.body.trim()
        ? safeItem.body.trim()
        : ""
  };
}

function normalizePromo(item, index) {
  const safeItem = typeof item === "object" && item !== null ? item : {};

  return {
    id: safeItem.id ?? `PROMO-${index + 1}`,
    dbId: Number(safeItem.dbId) || Number(safeItem.id?.replace?.("PROMO-", "")) || index + 1,
    code:
      typeof safeItem.code === "string" && safeItem.code.trim()
        ? safeItem.code.trim()
        : `PROMO${index + 1}`,
    discount:
      typeof safeItem.discount === "string" && safeItem.discount.trim()
        ? safeItem.discount.trim()
        : "",
    status:
      typeof safeItem.status === "string" && safeItem.status.trim()
        ? safeItem.status.trim()
        : "Active"
  };
}

function normalizeReport(report, index) {
  const safeReport = typeof report === "object" && report !== null ? report : {};

  return {
    title:
      typeof safeReport.title === "string" && safeReport.title.trim()
        ? safeReport.title.trim()
        : `Report ${index + 1}`,
    value:
      typeof safeReport.value === "number" || typeof safeReport.value === "string"
        ? safeReport.value
        : "-",
    note:
      typeof safeReport.note === "string" && safeReport.note.trim()
        ? safeReport.note.trim()
        : ""
  };
}

function normalizeContentState(contentState) {
  const safeContent = typeof contentState === "object" && contentState !== null ? contentState : {};

  return {
    aboutText:
      typeof safeContent.aboutText === "string" && safeContent.aboutText.trim()
        ? safeContent.aboutText.trim()
        : "",
    contactPhones:
      typeof safeContent.contactPhones === "string" && safeContent.contactPhones.trim()
        ? safeContent.contactPhones.trim()
        : "",
    footerEmail:
      typeof safeContent.footerEmail === "string" && safeContent.footerEmail.trim()
        ? safeContent.footerEmail.trim()
        : "",
    paymentInstructions:
      typeof safeContent.paymentInstructions === "string" && safeContent.paymentInstructions.trim()
        ? safeContent.paymentInstructions.trim()
        : "",
    footerLinks:
      typeof safeContent.footerLinks === "string" && safeContent.footerLinks.trim()
        ? safeContent.footerLinks.trim()
        : ""
  };
}

async function readJson(response, fallbackMessage) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
}

export async function fetchAdminDashboard() {
  const response = await fetch(`${API_BASE}/api/admin/dashboard`);
  const data = await readJson(response, "Could not load admin dashboard data.");

  return {
    bookings: Array.isArray(data.bookings) ? data.bookings.map(normalizeBooking) : [],
    payments: Array.isArray(data.payments) ? data.payments.map(normalizePayment) : [],
    customers: Array.isArray(data.customers) ? data.customers.map(normalizeCustomer) : [],
    messages: Array.isArray(data.messages) ? data.messages.map(normalizeMessage) : [],
    galleryItems: Array.isArray(data.galleryItems) ? data.galleryItems.map(normalizeGalleryItem) : [],
    announcements: Array.isArray(data.announcements)
      ? data.announcements.map(normalizeAnnouncement)
      : [],
    promoCodes: Array.isArray(data.promoCodes) ? data.promoCodes.map(normalizePromo) : [],
    contentState: normalizeContentState(data.contentState),
    reports: Array.isArray(data.reports) ? data.reports.map(normalizeReport) : []
  };
}

export async function toggleGalleryVisibility(itemId) {
  const response = await fetch(`${API_BASE}/api/admin/gallery/${itemId}/visibility`, {
    method: "PATCH"
  });
  const data = await readJson(response, "Failed to update gallery item visibility.");
  return normalizeGalleryItem(data, 0);
}

export async function reorderGalleryItems(itemId, direction) {
  const response = await fetch(`${API_BASE}/api/admin/gallery/reorder`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ itemId, direction })
  });
  const data = await readJson(response, "Failed to reorder gallery items.");

  if (!Array.isArray(data)) {
    throw new Error("Invalid gallery reorder response.");
  }

  return data.map(normalizeGalleryItem);
}

export async function createAnnouncement(payload) {
  const response = await fetch(`${API_BASE}/api/admin/announcements`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const data = await readJson(response, "Failed to create announcement.");
  return normalizeAnnouncement(data, 0);
}

export async function createPromoCode(payload) {
  const response = await fetch(`${API_BASE}/api/admin/promos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const data = await readJson(response, "Failed to create promo code.");
  return normalizePromo(data, 0);
}

export async function updateSiteContent(payload) {
  const response = await fetch(`${API_BASE}/api/admin/content`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const data = await readJson(response, "Failed to save website content.");
  return normalizeContentState(data);
}
