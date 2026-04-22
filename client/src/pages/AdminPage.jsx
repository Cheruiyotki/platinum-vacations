import { useEffect, useMemo, useState } from "react";
import {
  createAnnouncement as createAnnouncementRequest,
  createPromoCode as createPromoCodeRequest,
  fetchAdminDashboard,
  reorderGalleryItems as reorderGalleryItemsRequest,
  toggleGalleryVisibility as toggleGalleryVisibilityRequest,
  updateSiteContent as updateSiteContentRequest
} from "../api/admin";
import {
  createPackage as createPackageRequest,
  deletePackage as deletePackageRequest,
  fetchAdminPackages,
  togglePackageVisibility as togglePackageVisibilityRequest,
  updatePackage
} from "../api/packages";
import {
  deleteReview as deleteReviewRequest,
  fetchAdminReviews,
  toggleReviewApproval
} from "../api/reviews";
import {
  FaArrowLeft,
  FaArrowUp,
  FaBell,
  FaChartLine,
  FaClipboardList,
  FaComments,
  FaEdit,
  FaEnvelopeOpenText,
  FaEye,
  FaEyeSlash,
  FaFolderOpen,
  FaImage,
  FaMoneyCheckAlt,
  FaPercent,
  FaPhoneAlt,
  FaPlus,
  FaReceipt,
  FaRobot,
  FaSave,
  FaStar,
  FaTimes,
  FaTrash,
  FaUsers
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { usePackages } from "../context/PackageContext";
import { useReviews } from "../context/ReviewContext";

const sidebarSections = [
  { id: "dashboard", label: "Dashboard", icon: FaChartLine },
  { id: "adventures", label: "Adventures", icon: FaFolderOpen },
  { id: "bookings", label: "Bookings", icon: FaClipboardList },
  { id: "payments", label: "Payments", icon: FaMoneyCheckAlt },
  { id: "customers", label: "Customers", icon: FaUsers },
  { id: "reviews", label: "Reviews", icon: FaStar },
  { id: "gallery", label: "Gallery", icon: FaImage },
  { id: "messages", label: "Messages / AI", icon: FaRobot },
  { id: "content", label: "Content", icon: FaEdit },
  { id: "announcements", label: "Announcements", icon: FaBell },
  { id: "promos", label: "Promo Codes", icon: FaPercent },
  { id: "reports", label: "Reports", icon: FaReceipt }
];

const initialBookings = [
  {
    id: "BK-1001",
    customer: "Sharon W.",
    adventure: "Maasai Mara Big Five Safari Adventure",
    option: "Book space",
    amountPaid: 8000,
    balance: 24999,
    phone: "0740629899",
    status: "Pending balance"
  },
  {
    id: "BK-1002",
    customer: "Brian K.",
    adventure: "Mount Kenya Summit Trail Adventure",
    option: "Full amount",
    amountPaid: 18500,
    balance: 0,
    phone: "0768070634",
    status: "Confirmed"
  },
  {
    id: "BK-1003",
    customer: "Mercy N.",
    adventure: "Mombasa (Malindi) Summer Tides Adventure",
    option: "Book space",
    amountPaid: 11000,
    balance: 10999,
    phone: "0711757863",
    status: "Pending balance"
  },
  {
    id: "BK-1004",
    customer: "Kelvin T.",
    adventure: "Mt. Satima Sunrise Hike Adventure",
    option: "Full amount",
    amountPaid: 4500,
    balance: 0,
    phone: "0798001122",
    status: "Confirmed"
  },
  {
    id: "BK-1005",
    customer: "Faith G.",
    adventure: "WRC (World Rally Championship) Naivasha Experience",
    option: "Book space",
    amountPaid: 2000,
    balance: 1800,
    phone: "0700123456",
    status: "Awaiting payment"
  }
];

const initialPayments = [
  {
    id: "PAY-2001",
    phone: "0740629899",
    amount: 8000,
    reference: "MARA8000",
    stkStatus: "Success",
    balance: 24999
  },
  {
    id: "PAY-2002",
    phone: "0768070634",
    amount: 18500,
    reference: "KENYA18500",
    stkStatus: "Success",
    balance: 0
  },
  {
    id: "PAY-2003",
    phone: "0711757863",
    amount: 11000,
    reference: "MOMB11000",
    stkStatus: "Pending",
    balance: 10999
  },
  {
    id: "PAY-2004",
    phone: "0798001122",
    amount: 4500,
    reference: "SAT4500",
    stkStatus: "Success",
    balance: 0
  },
  {
    id: "PAY-2005",
    phone: "0700123456",
    amount: 2000,
    reference: "WRC2000",
    stkStatus: "Failed",
    balance: 1800
  }
];

const initialCustomers = [
  {
    id: "CUS-1",
    name: "Sharon W.",
    phone: "0740629899",
    bookedAdventure: "Maasai Mara Big Five Safari Adventure",
    progress: "Deposit paid",
    notes: "Requested window seat."
  },
  {
    id: "CUS-2",
    name: "Brian K.",
    phone: "0768070634",
    bookedAdventure: "Mount Kenya Summit Trail Adventure",
    progress: "Fully paid",
    notes: "Confirmed for shared room."
  },
  {
    id: "CUS-3",
    name: "Mercy N.",
    phone: "0711757863",
    bookedAdventure: "Mombasa (Malindi) Summer Tides Adventure",
    progress: "Half paid",
    notes: "Needs pickup reminder."
  },
  {
    id: "CUS-4",
    name: "Kelvin T.",
    phone: "0798001122",
    bookedAdventure: "Mt. Satima Sunrise Hike Adventure",
    progress: "Fully paid",
    notes: "Vegetarian meal preference."
  }
];

const initialMessages = [
  {
    id: "MSG-1",
    source: "Website AI",
    topic: "Booking info",
    summary: "Asked for dates and deposit details for Maasai Mara.",
    unanswered: false
  },
  {
    id: "MSG-2",
    source: "Website AI",
    topic: "Upcoming events",
    summary: "Wanted to know which adventures are coming up next.",
    unanswered: false
  },
  {
    id: "MSG-3",
    source: "WhatsApp",
    topic: "Pickup point",
    summary: "Customer asked for Nairobi meeting point confirmation.",
    unanswered: true
  },
  {
    id: "MSG-4",
    source: "Website AI",
    topic: "Payment issue",
    summary: "Customer said STK push did not reach the phone.",
    unanswered: true
  },
  {
    id: "MSG-5",
    source: "Instagram",
    topic: "Destination suggestion",
    summary: "Suggested adding Nanyuki or Samburu next.",
    unanswered: false
  }
];

const initialAnnouncements = [
  {
    id: "ANN-1",
    title: "Maasai Mara Seats Filling Fast",
    status: "Active",
    body: "Only a few safari seats are left for the July departure."
  },
  {
    id: "ANN-2",
    title: "Mt. Satima Sunrise Special",
    status: "Draft",
    body: "Early bird spot offer for the next hike."
  }
];

const initialPromoCodes = [
  { id: "PROMO-1", code: "MARA10", discount: "10%", status: "Active" },
  { id: "PROMO-2", code: "WEEKEND5", discount: "KES 500", status: "Paused" }
];

const initialContentState = {
  aboutText:
    "Platinum Vacations is based in Nyeri and specializes in carefully planned travel adventures across Kenya.",
  contactPhones: "0740629899, 0768070634, 0711757863",
  footerEmail: "platinumvacationske@gmail.com",
  paymentInstructions:
    "Customers can pay in full or reserve a space with at least half upfront and clear the balance the day before the trip.",
  footerLinks: "Instagram, TikTok, WhatsApp"
};

function statusClasses(status) {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus.includes("success") || normalizedStatus.includes("confirmed") || normalizedStatus.includes("active")) {
    return "bg-success/15 text-secondary";
  }

  if (normalizedStatus.includes("pending") || normalizedStatus.includes("awaiting")) {
    return "bg-primary/10 text-primary";
  }

  if (normalizedStatus.includes("failed") || normalizedStatus.includes("paused") || normalizedStatus.includes("draft")) {
    return "bg-secondary/10 text-secondary/75";
  }

  return "bg-neutral text-secondary";
}

function toSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildAdventureForm(adventure) {
  return {
    id: adventure.id,
    slug: adventure.slug,
    title: adventure.title,
    cost: adventure.cost,
    dates: adventure.dates,
    duration_banner: adventure.duration_banner || "",
    date_pill: adventure.date_pill || "",
    description: adventure.description || "",
    pickup_point: adventure.pickup_point || "",
    note: adventure.note || "",
    image_url: adventure.image_url || "",
    deposit_required: adventure.deposit_required || 0,
    includesText: (adventure.includes_json || []).join(", "),
    excludesText: (adventure.excludes_json || []).join(", ")
  };
}

function getEmptyAdventureForm() {
  return {
    id: "",
    slug: "",
    title: "",
    cost: "",
    dates: "",
    duration_banner: "",
    date_pill: "",
    description: "",
    pickup_point: "",
    note: "",
    image_url: "",
    deposit_required: 0,
    includesText: "",
    excludesText: ""
  };
}

function parseList(text) {
  return text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function AdminPage() {
  const { loading, refreshPackages } = usePackages();
  const { refreshReviews } = useReviews();
  const [adventures, setAdventures] = useState([]);
  const [selectedAdventureId, setSelectedAdventureId] = useState("");
  const [adventureForm, setAdventureForm] = useState(getEmptyAdventureForm());
  const [adminLoading, setAdminLoading] = useState(true);
  const [adventureActionLoading, setAdventureActionLoading] = useState(false);
  const [adventureStatus, setAdventureStatus] = useState("");
  const [adventureError, setAdventureError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewActionLoading, setReviewActionLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewStatus, setReviewStatus] = useState("");
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardActionLoading, setDashboardActionLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState("");
  const [dashboardStatus, setDashboardStatus] = useState("");
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [contentState, setContentState] = useState(initialContentState);
  const [announcementForm, setAnnouncementForm] = useState({ title: "", status: "Draft", body: "" });
  const [promoForm, setPromoForm] = useState({ code: "", discount: "", status: "Active" });
  const [galleryItems, setGalleryItems] = useState([]);
  const [reports, setReports] = useState([]);

  const loadAdminAdventures = async () => {
    try {
      setAdminLoading(true);
      setAdventureError("");
      const data = await fetchAdminPackages();
      setAdventures(data);
    } catch (error) {
      setAdventureError(error.message || "Unable to load admin adventures.");
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    loadAdminAdventures();
  }, []);

  const loadAdminDashboard = async () => {
    try {
      setDashboardLoading(true);
      setDashboardError("");
      const data = await fetchAdminDashboard();
      setBookings(data.bookings);
      setPayments(data.payments);
      setCustomers(data.customers);
      setMessages(data.messages);
      setGalleryItems(data.galleryItems);
      setAnnouncements(data.announcements);
      setPromoCodes(data.promoCodes);
      setContentState(data.contentState);
      setReports(data.reports);
    } catch (error) {
      setDashboardError(error.message || "Unable to load admin dashboard data.");
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    loadAdminDashboard();
  }, []);

  const loadAdminReviews = async () => {
    try {
      setReviewsLoading(true);
      setReviewError("");
      const data = await fetchAdminReviews();
      setReviews(data);
    } catch (error) {
      setReviewError(error.message || "Unable to load admin reviews.");
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminReviews();
  }, []);

  const dashboardStats = useMemo(
    () => [
      { label: "Total Bookings", value: bookings.length, icon: FaClipboardList },
      {
        label: "Pending Payments",
        value: payments.filter((payment) => payment.balance > 0).length,
        icon: FaMoneyCheckAlt
      },
      {
        label: "Upcoming Adventures",
        value: adventures.filter((adventure) => !adventure.hidden).length,
        icon: FaFolderOpen
      },
      {
        label: "Recent Customer Messages",
        value: messages.length,
        icon: FaComments
      },
      {
        label: "STK Push Success",
        value: payments.filter((payment) => payment.stkStatus === "Success").length,
        icon: FaReceipt
      }
    ],
    [adventures, bookings.length, messages.length, payments]
  );

  const topMessageTopics = useMemo(() => {
    const groupedTopics = messages.reduce((accumulator, message) => {
      accumulator[message.topic] = (accumulator[message.topic] || 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(groupedTopics).map(([topic, total]) => ({ topic, total }));
  }, [messages]);

  const handleAdventureFormChange = (field, value) => {
    setAdventureError("");
    setAdventureStatus("");
    setAdventureForm((currentForm) => ({
      ...currentForm,
      [field]: value,
      ...(field === "title" && !selectedAdventureId ? { slug: toSlug(value) } : {})
    }));
  };

  const handleSaveAdventure = async () => {
    if (!adventureForm.title.trim()) {
      setAdventureError("Adventure title is required.");
      return;
    }

    const nextAdventure = {
      slug: adventureForm.slug || toSlug(adventureForm.title),
      title: adventureForm.title.trim(),
      cost: adventureForm.cost.trim(),
      dates: adventureForm.dates.trim(),
      duration_banner: adventureForm.duration_banner.trim(),
      date_pill: adventureForm.date_pill.trim(),
      description: adventureForm.description.trim(),
      pickup_point: adventureForm.pickup_point.trim(),
      note: adventureForm.note.trim(),
      image_url: adventureForm.image_url.trim(),
      deposit_required: Number(adventureForm.deposit_required) || 0,
      includes_json: parseList(adventureForm.includesText),
      excludes_json: parseList(adventureForm.excludesText),
      hidden:
        adventures.find((adventure) => adventure.id === selectedAdventureId)?.hidden || false
    };

    try {
      setAdventureActionLoading(true);
      setAdventureError("");
      setAdventureStatus("");

      if (selectedAdventureId) {
        const updatedAdventure = await updatePackage(selectedAdventureId, nextAdventure);
        setAdventures((currentAdventures) =>
          currentAdventures.map((adventure) =>
            adventure.id === selectedAdventureId ? updatedAdventure : adventure
          )
        );
        setAdventureStatus("Adventure updated successfully.");
      } else {
        const createdAdventure = await createPackageRequest(nextAdventure);
        setAdventures((currentAdventures) => [createdAdventure, ...currentAdventures]);
        setAdventureStatus("Adventure created successfully.");
      }

      await refreshPackages();
      setSelectedAdventureId("");
      setAdventureForm(getEmptyAdventureForm());
    } catch (error) {
      setAdventureError(error.message || "Failed to save adventure.");
    } finally {
      setAdventureActionLoading(false);
    }
  };

  const handleEditAdventure = (adventure) => {
    setAdventureError("");
    setAdventureStatus("");
    setSelectedAdventureId(adventure.id);
    setAdventureForm(buildAdventureForm(adventure));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteAdventure = async (adventureId) => {
    try {
      setAdventureActionLoading(true);
      setAdventureError("");
      setAdventureStatus("");
      await deletePackageRequest(adventureId);
      setAdventures((currentAdventures) =>
        currentAdventures.filter((adventure) => adventure.id !== adventureId)
      );

      if (selectedAdventureId === adventureId) {
        setSelectedAdventureId("");
        setAdventureForm(getEmptyAdventureForm());
      }

      await refreshPackages();
      setAdventureStatus("Adventure deleted successfully.");
    } catch (error) {
      setAdventureError(error.message || "Failed to delete adventure.");
    } finally {
      setAdventureActionLoading(false);
    }
  };

  const handleToggleAdventureVisibility = async (adventureId) => {
    try {
      setAdventureActionLoading(true);
      setAdventureError("");
      setAdventureStatus("");
      const updatedAdventure = await togglePackageVisibilityRequest(adventureId);
      setAdventures((currentAdventures) =>
        currentAdventures.map((adventure) =>
          adventure.id === adventureId ? updatedAdventure : adventure
        )
      );
      await refreshPackages();
      setAdventureStatus(
        updatedAdventure.hidden
          ? "Adventure hidden from the public site."
          : "Adventure is visible on the public site again."
      );
    } catch (error) {
      setAdventureError(error.message || "Failed to update adventure visibility.");
    } finally {
      setAdventureActionLoading(false);
    }
  };

  const resetAdventureForm = () => {
    setAdventureError("");
    setAdventureStatus("");
    setSelectedAdventureId("");
    setAdventureForm(getEmptyAdventureForm());
  };

  const handleReviewToggle = async (reviewId) => {
    try {
      setReviewActionLoading(true);
      setReviewError("");
      setReviewStatus("");
      const updatedReview = await toggleReviewApproval(reviewId);
      setReviews((currentReviews) =>
        currentReviews.map((review) => (review.id === reviewId ? updatedReview : review))
      );
      await refreshReviews();
      setReviewStatus(
        updatedReview.approved
          ? "Review approved and now visible on the public website."
          : "Review moved back to pending."
      );
    } catch (error) {
      setReviewError(error.message || "Failed to update review approval.");
    } finally {
      setReviewActionLoading(false);
    }
  };

  const handleReviewDelete = async (reviewId) => {
    try {
      setReviewActionLoading(true);
      setReviewError("");
      setReviewStatus("");
      await deleteReviewRequest(reviewId);
      setReviews((currentReviews) => currentReviews.filter((review) => review.id !== reviewId));
      await refreshReviews();
      setReviewStatus("Review deleted successfully.");
    } catch (error) {
      setReviewError(error.message || "Failed to delete review.");
    } finally {
      setReviewActionLoading(false);
    }
  };

  const moveGalleryItem = (itemId, direction) => {
    const galleryDbId = galleryItems.find((item) => item.id === itemId)?.dbId;

    if (!galleryDbId) {
      return;
    }

    setDashboardActionLoading(true);
    setDashboardError("");
    setDashboardStatus("");

    reorderGalleryItemsRequest(galleryDbId, direction)
      .then((updatedItems) => {
        setGalleryItems(updatedItems);
        setDashboardStatus("Gallery order updated successfully.");
      })
      .catch((error) => {
        setDashboardError(error.message || "Failed to reorder gallery items.");
      })
      .finally(() => {
        setDashboardActionLoading(false);
      });
  };

  const toggleGalleryVisibility = (itemId) => {
    const galleryDbId = galleryItems.find((item) => item.id === itemId)?.dbId;

    if (!galleryDbId) {
      return;
    }

    setDashboardActionLoading(true);
    setDashboardError("");
    setDashboardStatus("");

    toggleGalleryVisibilityRequest(galleryDbId)
      .then((updatedItem) => {
        setGalleryItems((currentItems) =>
          currentItems.map((item) => (item.id === itemId ? updatedItem : item))
        );
        setDashboardStatus(
          updatedItem.visible ? "Gallery item is now visible." : "Gallery item hidden from homepage."
        );
      })
      .catch((error) => {
        setDashboardError(error.message || "Failed to update gallery visibility.");
      })
      .finally(() => {
        setDashboardActionLoading(false);
      });
  };

  const addAnnouncement = async () => {
    if (!announcementForm.title.trim()) {
      setDashboardError("Announcement title is required.");
      return;
    }

    try {
      setDashboardActionLoading(true);
      setDashboardError("");
      setDashboardStatus("");
      const createdAnnouncement = await createAnnouncementRequest(announcementForm);
      setAnnouncements((currentAnnouncements) => [createdAnnouncement, ...currentAnnouncements]);
      setAnnouncementForm({ title: "", status: "Draft", body: "" });
      setDashboardStatus("Announcement created successfully.");
    } catch (error) {
      setDashboardError(error.message || "Failed to create announcement.");
    } finally {
      setDashboardActionLoading(false);
    }
  };

  const addPromoCode = async () => {
    if (!promoForm.code.trim()) {
      setDashboardError("Promo code is required.");
      return;
    }

    try {
      setDashboardActionLoading(true);
      setDashboardError("");
      setDashboardStatus("");
      const createdPromoCode = await createPromoCodeRequest(promoForm);
      setPromoCodes((currentCodes) => [createdPromoCode, ...currentCodes]);
      setPromoForm({ code: "", discount: "", status: "Active" });
      setDashboardStatus("Promo code created successfully.");
    } catch (error) {
      setDashboardError(error.message || "Failed to create promo code.");
    } finally {
      setDashboardActionLoading(false);
    }
  };

  const saveContentState = async () => {
    try {
      setDashboardActionLoading(true);
      setDashboardError("");
      setDashboardStatus("");
      const updatedContent = await updateSiteContentRequest(contentState);
      setContentState(updatedContent);
      setDashboardStatus("Website content saved successfully.");
    } catch (error) {
      setDashboardError(error.message || "Failed to save website content.");
    } finally {
      setDashboardActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral/40">
      <div className="mx-auto max-w-[96rem] px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-6 overflow-hidden rounded-[2rem] bg-secondary text-white shadow-card">
          <div className="flex flex-col gap-6 px-5 py-6 md:px-8 md:py-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-white/75">
                <FaRobot className="text-[10px]" />
                Admin Control
              </p>
              <h1 className="mt-4 font-heading text-3xl font-black md:text-5xl">
                Platinum Vacations Admin
              </h1>
              <p className="mt-3 max-w-3xl text-sm text-white/75 md:text-base">
                Manage bookings, payments, adventures, content, AI messages, and customer-facing
                website sections from one place.
              </p>
            </div>

            <Link
              to="/"
              className="inline-flex items-center gap-2 self-start rounded-full bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-white hover:text-secondary"
            >
              <FaArrowLeft />
              Back To Website
            </Link>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[18rem_1fr]">
          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            <div className="rounded-[1.75rem] border border-neutral bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-secondary/55">
                Admin Navigation
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                {sidebarSections.map((section) => {
                  const Icon = section.icon;

                  return (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="inline-flex items-center gap-3 rounded-2xl border border-neutral px-4 py-3 text-sm font-semibold text-secondary transition hover:border-primary hover:text-primary"
                    >
                      <Icon className="text-sm" />
                      {section.label}
                    </a>
                  );
                })}
              </div>
            </div>
          </aside>

          <main className="space-y-6">
            <section id="dashboard" className="rounded-[1.75rem] border border-neutral bg-white p-5 shadow-sm md:p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.26em] text-secondary/55">
                    Dashboard
                  </p>
                  <h2 className="mt-2 font-heading text-3xl font-black text-secondary">
                    Quick Overview
                  </h2>
                </div>
                <p className="text-sm text-secondary/65">
                  {loading || adminLoading || dashboardLoading
                    ? "Loading admin data..."
                    : "All sections are ready for admin updates."}
                </p>
              </div>

              {dashboardError ? (
                <p className="mt-4 rounded-2xl bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
                  {dashboardError}
                </p>
              ) : null}
              {dashboardStatus ? (
                <p className="mt-4 rounded-2xl bg-success/15 px-4 py-3 text-sm font-semibold text-secondary">
                  {dashboardStatus}
                </p>
              ) : null}

              <div className="mt-6 grid gap-4 sm:grid-cols-2 2xl:grid-cols-5">
                {dashboardStats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <article key={stat.label} className="rounded-3xl bg-secondary px-5 py-5 text-white shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-[0.22em] text-white/60">
                          {stat.label}
                        </span>
                        <Icon className="text-success" />
                      </div>
                      <p className="mt-4 font-heading text-4xl font-black">{stat.value}</p>
                    </article>
                  );
                })}
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="rounded-3xl border border-neutral bg-accent p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/50">
                    Payment Health
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-success/15 px-4 py-4">
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/55">
                        Successful STK
                      </p>
                      <p className="mt-2 font-heading text-3xl font-black text-secondary">
                        {payments.filter((payment) => payment.stkStatus === "Success").length}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-primary/10 px-4 py-4">
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary/70">
                        Pending
                      </p>
                      <p className="mt-2 font-heading text-3xl font-black text-primary">
                        {payments.filter((payment) => payment.stkStatus === "Pending").length}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-neutral px-4 py-4">
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/55">
                        Failed
                      </p>
                      <p className="mt-2 font-heading text-3xl font-black text-secondary">
                        {payments.filter((payment) => payment.stkStatus === "Failed").length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-neutral bg-accent p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/50">
                    Recent Message Highlights
                  </p>
                  <div className="mt-4 space-y-3">
                    {messages.slice(0, 3).map((message) => (
                      <div key={message.id} className="rounded-2xl border border-neutral bg-white px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-secondary">{message.topic}</p>
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClasses(message.unanswered ? "Pending" : "Success")}`}>
                            {message.unanswered ? "Needs reply" : "Handled"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-secondary/70">{message.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section id="adventures" className="rounded-[1.75rem] border border-neutral bg-white p-5 shadow-sm md:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.26em] text-secondary/55">
                    Adventures
                  </p>
                  <h2 className="mt-2 font-heading text-3xl font-black text-secondary">
                    Manage Adventure Listings
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={resetAdventureForm}
                  className="inline-flex items-center gap-2 self-start rounded-full bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-secondary"
                >
                  <FaPlus />
                  New Adventure
                </button>
              </div>

              <div className="mt-6 grid gap-6 2xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-3xl border border-neutral bg-accent p-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-heading text-2xl font-black text-secondary">
                      {selectedAdventureId ? "Edit Adventure" : "Create Adventure"}
                    </p>
                    {selectedAdventureId ? (
                      <button
                        type="button"
                        onClick={resetAdventureForm}
                        className="inline-flex items-center gap-2 rounded-full border border-neutral px-3 py-2 text-xs font-bold text-secondary transition hover:border-primary hover:text-primary"
                      >
                        <FaTimes />
                        Cancel Edit
                      </button>
                    ) : null}
                  </div>

                  {adventureError ? (
                    <p className="mt-4 rounded-2xl bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
                      {adventureError}
                    </p>
                  ) : null}

                  {adventureStatus ? (
                    <p className="mt-4 rounded-2xl bg-success/15 px-4 py-3 text-sm font-semibold text-secondary">
                      {adventureStatus}
                    </p>
                  ) : null}

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/55">Title</span>
                      <input
                        value={adventureForm.title}
                        onChange={(event) => handleAdventureFormChange("title", event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-neutral px-4 py-3 text-sm outline-none transition focus:border-primary"
                        placeholder="Adventure title"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/55">Slug</span>
                      <input
                        value={adventureForm.slug}
                        onChange={(event) => handleAdventureFormChange("slug", event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-neutral px-4 py-3 text-sm outline-none transition focus:border-primary"
                        placeholder="adventure-slug"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/55">Dates</span>
                      <input
                        value={adventureForm.dates}
                        onChange={(event) => handleAdventureFormChange("dates", event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-neutral px-4 py-3 text-sm outline-none transition focus:border-primary"
                        placeholder="18th - 20th July"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/55">Price</span>
                      <input
                        value={adventureForm.cost}
                        onChange={(event) => handleAdventureFormChange("cost", event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-neutral px-4 py-3 text-sm outline-none transition focus:border-primary"
                        placeholder="KES 32,999"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/55">Deposit</span>
                      <input
                        type="number"
                        value={adventureForm.deposit_required}
                        onChange={(event) => handleAdventureFormChange("deposit_required", event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-neutral px-4 py-3 text-sm outline-none transition focus:border-primary"
                        placeholder="8000"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/55">Pickup Point</span>
                      <input
                        value={adventureForm.pickup_point}
                        onChange={(event) => handleAdventureFormChange("pickup_point", event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-neutral px-4 py-3 text-sm outline-none transition focus:border-primary"
                        placeholder="Nairobi CBD"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/55">Banner</span>
                      <input
                        value={adventureForm.duration_banner}
                        onChange={(event) => handleAdventureFormChange("duration_banner", event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-neutral px-4 py-3 text-sm outline-none transition focus:border-primary"
                        placeholder="3 DAYS 2 NIGHTS"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/55">Date Pill</span>
                      <input
                        value={adventureForm.date_pill}
                        onChange={(event) => handleAdventureFormChange("date_pill", event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-neutral px-4 py-3 text-sm outline-none transition focus:border-primary"
                        placeholder="Safari Favorite"
                      />
                    </label>
                    <label className="block md:col-span-2">
                      <span className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/55">Image URL</span>
                      <input
                        value={adventureForm.image_url}
                        onChange={(event) => handleAdventureFormChange("image_url", event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-neutral px-4 py-3 text-sm outline-none transition focus:border-primary"
                        placeholder="/assets/image_5.jpg"
                      />
                    </label>
                    <label className="block md:col-span-2">
                      <span className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/55">Description</span>
                      <textarea
                        rows="3"
                        value={adventureForm.description}
                        onChange={(event) => handleAdventureFormChange("description", event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-neutral px-4 py-3 text-sm outline-none transition focus:border-primary"
                        placeholder="Short adventure description"
                      />
                    </label>
                    <label className="block md:col-span-2">
                      <span className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/55">Includes</span>
                      <textarea
                        rows="3"
                        value={adventureForm.includesText}
                        onChange={(event) => handleAdventureFormChange("includesText", event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-neutral px-4 py-3 text-sm outline-none transition focus:border-primary"
                        placeholder="Transport, accommodation, meals"
                      />
                    </label>
                    <label className="block md:col-span-2">
                      <span className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/55">Excludes</span>
                      <textarea
                        rows="3"
                        value={adventureForm.excludesText}
                        onChange={(event) => handleAdventureFormChange("excludesText", event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-neutral px-4 py-3 text-sm outline-none transition focus:border-primary"
                        placeholder="Drinks, personal shopping"
                      />
                    </label>
                    <label className="block md:col-span-2">
                      <span className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/55">Note</span>
                      <textarea
                        rows="2"
                        value={adventureForm.note}
                        onChange={(event) => handleAdventureFormChange("note", event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-neutral px-4 py-3 text-sm outline-none transition focus:border-primary"
                        placeholder="Optional booking note"
                      />
                    </label>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleSaveAdventure}
                      disabled={adventureActionLoading}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-secondary"
                    >
                      <FaSave />
                      {adventureActionLoading
                        ? "Saving..."
                        : selectedAdventureId
                          ? "Save Changes"
                          : "Create Adventure"}
                    </button>
                    <button
                      type="button"
                      onClick={resetAdventureForm}
                      className="inline-flex items-center gap-2 rounded-full border border-neutral px-5 py-3 text-sm font-bold text-secondary transition hover:border-primary hover:text-primary"
                    >
                      <FaTimes />
                      Clear Form
                    </button>
                  </div>
                </div>

                <div className="rounded-3xl border border-neutral bg-accent p-5">
                  <p className="font-heading text-2xl font-black text-secondary">Adventure List</p>
                  {adminLoading ? (
                    <p className="mt-5 text-sm text-secondary/70">Loading adventures...</p>
                  ) : null}
                  <div className="mt-5 space-y-3">
                    {adventures.map((adventure) => (
                      <article key={adventure.id} className="rounded-3xl border border-neutral bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-secondary">{adventure.title}</p>
                              <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClasses(adventure.hidden ? "Draft" : "Active")}`}>
                                {adventure.hidden ? "Hidden" : "Visible"}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-secondary/65">
                              {adventure.dates} | {adventure.cost}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditAdventure(adventure)}
                              className="inline-flex items-center gap-2 rounded-full border border-neutral px-3 py-2 text-xs font-bold text-secondary transition hover:border-primary hover:text-primary"
                            >
                              <FaEdit />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleAdventureVisibility(adventure.id)}
                              disabled={adventureActionLoading}
                              className="inline-flex items-center gap-2 rounded-full border border-neutral px-3 py-2 text-xs font-bold text-secondary transition hover:border-primary hover:text-primary"
                            >
                              {adventure.hidden ? <FaEye /> : <FaEyeSlash />}
                              {adventure.hidden ? "Show" : "Hide"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAdventure(adventure.id)}
                              disabled={adventureActionLoading}
                              className="inline-flex items-center gap-2 rounded-full border border-primary/25 px-3 py-2 text-xs font-bold text-primary transition hover:bg-primary hover:text-white"
                            >
                              <FaTrash />
                              Delete
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section id="bookings" className="rounded-[1.75rem] border border-neutral bg-white p-5 shadow-sm md:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-secondary/55">Bookings</p>
              <h2 className="mt-2 font-heading text-3xl font-black text-secondary">Booking Records</h2>
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.22em] text-secondary/45">
                    <tr>
                      <th className="pb-3 pr-4">Booking</th>
                      <th className="pb-3 pr-4">Customer</th>
                      <th className="pb-3 pr-4">Adventure</th>
                      <th className="pb-3 pr-4">Option</th>
                      <th className="pb-3 pr-4">Amount Paid</th>
                      <th className="pb-3 pr-4">Balance</th>
                      <th className="pb-3 pr-4">Phone</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-t border-neutral">
                        <td className="py-4 pr-4 font-semibold text-secondary">{booking.id}</td>
                        <td className="py-4 pr-4 text-secondary/80">{booking.customer}</td>
                        <td className="py-4 pr-4 text-secondary/80">{booking.adventure}</td>
                        <td className="py-4 pr-4 text-secondary/80">{booking.option}</td>
                        <td className="py-4 pr-4 text-secondary/80">KES {booking.amountPaid.toLocaleString()}</td>
                        <td className="py-4 pr-4 text-secondary/80">KES {booking.balance.toLocaleString()}</td>
                        <td className="py-4 pr-4 text-secondary/80">{booking.phone}</td>
                        <td className="py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClasses(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="payments" className="rounded-[1.75rem] border border-neutral bg-white p-5 shadow-sm md:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-secondary/55">Payments</p>
              <h2 className="mt-2 font-heading text-3xl font-black text-secondary">M-Pesa / STK Tracking</h2>
              <div className="mt-6 grid gap-4 xl:grid-cols-2">
                {payments.map((payment) => (
                  <article key={payment.id} className="rounded-3xl border border-neutral bg-accent p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-secondary">{payment.reference}</p>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClasses(payment.stkStatus)}`}>
                        {payment.stkStatus}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/50">Phone</p>
                        <p className="mt-1 text-sm text-secondary/80">{payment.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/50">Amount</p>
                        <p className="mt-1 text-sm text-secondary/80">KES {payment.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/50">Balance</p>
                        <p className="mt-1 text-sm text-secondary/80">KES {payment.balance.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/50">Follow Up</p>
                        <p className="mt-1 text-sm text-secondary/80">
                          {payment.balance > 0 ? "Customer still needs to clear balance." : "No follow-up needed."}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section id="customers" className="rounded-[1.75rem] border border-neutral bg-white p-5 shadow-sm md:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-secondary/55">Customers</p>
              <h2 className="mt-2 font-heading text-3xl font-black text-secondary">Customer Profiles</h2>
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {customers.map((customer) => (
                  <article key={customer.id} className="rounded-3xl border border-neutral bg-accent p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-heading text-2xl font-black text-secondary">{customer.name}</p>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClasses(customer.progress)}`}>
                        {customer.progress}
                      </span>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-secondary/80">
                      <p><span className="font-semibold">Phone:</span> {customer.phone}</p>
                      <p><span className="font-semibold">Adventure:</span> {customer.bookedAdventure}</p>
                      <p><span className="font-semibold">Notes:</span> {customer.notes}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section id="reviews" className="rounded-[1.75rem] border border-neutral bg-white p-5 shadow-sm md:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-secondary/55">Reviews</p>
              <h2 className="mt-2 font-heading text-3xl font-black text-secondary">Moderate Testimonials</h2>
              {reviewError ? (
                <p className="mt-4 rounded-2xl bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
                  {reviewError}
                </p>
              ) : null}
              {reviewStatus ? (
                <p className="mt-4 rounded-2xl bg-success/15 px-4 py-3 text-sm font-semibold text-secondary">
                  {reviewStatus}
                </p>
              ) : null}
              {reviewsLoading ? (
                <p className="mt-4 text-sm text-secondary/70">Loading reviews...</p>
              ) : null}
              <div className="mt-6 grid gap-4 xl:grid-cols-2">
                {reviews.map((review) => (
                  <article key={review.id} className="rounded-3xl border border-neutral bg-accent p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-secondary">{review.name}</p>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClasses(review.approved ? "Active" : "Draft")}`}>
                          {review.approved ? "Approved" : "Pending"}
                        </span>
                      </div>
                    <p className="mt-3 text-sm leading-7 text-secondary/78">{review.review_text}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleReviewToggle(review.id)}
                          disabled={reviewActionLoading}
                          className="inline-flex items-center gap-2 rounded-full border border-neutral px-3 py-2 text-xs font-bold text-secondary transition hover:border-primary hover:text-primary"
                        >
                          {review.approved ? <FaEyeSlash /> : <FaEye />}
                        {review.approved ? "Unapprove" : "Approve"}
                      </button>
                        <button
                          type="button"
                          onClick={() => handleReviewDelete(review.id)}
                          disabled={reviewActionLoading}
                          className="inline-flex items-center gap-2 rounded-full border border-primary/25 px-3 py-2 text-xs font-bold text-primary transition hover:bg-primary hover:text-white"
                        >
                        <FaTrash />
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section id="gallery" className="rounded-[1.75rem] border border-neutral bg-white p-5 shadow-sm md:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-secondary/55">Gallery</p>
              <h2 className="mt-2 font-heading text-3xl font-black text-secondary">Manage Website Gallery</h2>
              <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {galleryItems.map((item) => (
                  <article key={item.id} className="rounded-3xl border border-neutral bg-accent p-4">
                    <div className="rounded-2xl bg-secondary/5 px-4 py-12 text-center text-sm text-secondary/60">
                      {item.src}
                    </div>
                    <div className="mt-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-secondary">{item.location}</p>
                        <p className="mt-1 text-sm text-secondary/65">{item.visible ? "Visible on homepage" : "Hidden from homepage"}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClasses(item.visible ? "Active" : "Draft")}`}>
                        {item.visible ? "Visible" : "Hidden"}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => moveGalleryItem(item.id, "up")}
                        disabled={dashboardActionLoading}
                        className="inline-flex items-center gap-2 rounded-full border border-neutral px-3 py-2 text-xs font-bold text-secondary transition hover:border-primary hover:text-primary"
                      >
                        <FaArrowUp />
                        Move Up
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleGalleryVisibility(item.id)}
                        disabled={dashboardActionLoading}
                        className="inline-flex items-center gap-2 rounded-full border border-neutral px-3 py-2 text-xs font-bold text-secondary transition hover:border-primary hover:text-primary"
                      >
                        {item.visible ? <FaEyeSlash /> : <FaEye />}
                        {item.visible ? "Hide" : "Show"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section id="messages" className="rounded-[1.75rem] border border-neutral bg-white p-5 shadow-sm md:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-secondary/55">Messages / AI Chats</p>
              <h2 className="mt-2 font-heading text-3xl font-black text-secondary">User Questions & Common Requests</h2>
              <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                <div className="rounded-3xl border border-neutral bg-accent p-5">
                  <p className="font-semibold text-secondary">Top Topics</p>
                  <div className="mt-4 space-y-3">
                    {topMessageTopics.map((topic) => (
                      <div key={topic.topic} className="rounded-2xl border border-neutral bg-white px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-secondary">{topic.topic}</p>
                          <span className="rounded-full bg-neutral px-3 py-1 text-xs font-bold text-secondary">
                            {topic.total}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-neutral bg-accent p-5">
                  <p className="font-semibold text-secondary">Recent Conversations</p>
                  <div className="mt-4 space-y-3">
                    {messages.map((message) => (
                      <article key={message.id} className="rounded-2xl border border-neutral bg-white px-4 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-neutral px-3 py-1 text-xs font-bold text-secondary">
                            {message.source}
                          </span>
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClasses(message.unanswered ? "Pending" : "Success")}`}>
                            {message.unanswered ? "Unanswered" : "Answered"}
                          </span>
                        </div>
                        <p className="mt-3 font-semibold text-secondary">{message.topic}</p>
                        <p className="mt-2 text-sm text-secondary/72">{message.summary}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section id="content" className="rounded-[1.75rem] border border-neutral bg-white p-5 shadow-sm md:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-secondary/55">Content</p>
              <h2 className="mt-2 font-heading text-3xl font-black text-secondary">Edit Website Copy & Contacts</h2>
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/55">About Section</span>
                  <textarea
                    rows="4"
                    value={contentState.aboutText}
                    onChange={(event) => setContentState((currentState) => ({ ...currentState, aboutText: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-neutral px-4 py-3 text-sm outline-none transition focus:border-primary"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/55">Contact Phones</span>
                  <textarea
                    rows="4"
                    value={contentState.contactPhones}
                    onChange={(event) => setContentState((currentState) => ({ ...currentState, contactPhones: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-neutral px-4 py-3 text-sm outline-none transition focus:border-primary"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/55">Footer Email</span>
                  <input
                    value={contentState.footerEmail}
                    onChange={(event) => setContentState((currentState) => ({ ...currentState, footerEmail: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-neutral px-4 py-3 text-sm outline-none transition focus:border-primary"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/55">Footer Links</span>
                  <input
                    value={contentState.footerLinks}
                    onChange={(event) => setContentState((currentState) => ({ ...currentState, footerLinks: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-neutral px-4 py-3 text-sm outline-none transition focus:border-primary"
                  />
                </label>
                <label className="block lg:col-span-2">
                  <span className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/55">Payment Instructions</span>
                  <textarea
                    rows="4"
                    value={contentState.paymentInstructions}
                    onChange={(event) => setContentState((currentState) => ({ ...currentState, paymentInstructions: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-neutral px-4 py-3 text-sm outline-none transition focus:border-primary"
                  />
                </label>
                <div className="lg:col-span-2">
                  <button
                    type="button"
                    onClick={saveContentState}
                    disabled={dashboardActionLoading}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-secondary"
                  >
                    <FaSave />
                    Save Content
                  </button>
                </div>
              </div>
            </section>

            <section id="announcements" className="rounded-[1.75rem] border border-neutral bg-white p-5 shadow-sm md:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-secondary/55">Announcements</p>
              <h2 className="mt-2 font-heading text-3xl font-black text-secondary">Post Website Notices</h2>
              <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                <div className="rounded-3xl border border-neutral bg-accent p-5">
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/55">Title</span>
                    <input
                      value={announcementForm.title}
                      onChange={(event) => setAnnouncementForm((currentForm) => ({ ...currentForm, title: event.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-neutral px-4 py-3 text-sm outline-none transition focus:border-primary"
                    />
                  </label>
                  <label className="mt-4 block">
                    <span className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/55">Status</span>
                    <select
                      value={announcementForm.status}
                      onChange={(event) => setAnnouncementForm((currentForm) => ({ ...currentForm, status: event.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-neutral px-4 py-3 text-sm outline-none transition focus:border-primary"
                    >
                      <option>Draft</option>
                      <option>Active</option>
                      <option>Sold Out</option>
                    </select>
                  </label>
                  <label className="mt-4 block">
                    <span className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/55">Message</span>
                    <textarea
                      rows="4"
                      value={announcementForm.body}
                      onChange={(event) => setAnnouncementForm((currentForm) => ({ ...currentForm, body: event.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-neutral px-4 py-3 text-sm outline-none transition focus:border-primary"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={addAnnouncement}
                    disabled={dashboardActionLoading}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-secondary"
                  >
                    <FaPlus />
                    Add Announcement
                  </button>
                </div>

                <div className="rounded-3xl border border-neutral bg-accent p-5">
                  <div className="space-y-3">
                    {announcements.map((announcement) => (
                      <article key={announcement.id} className="rounded-2xl border border-neutral bg-white px-4 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-secondary">{announcement.title}</p>
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClasses(announcement.status)}`}>
                            {announcement.status}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-secondary/72">{announcement.body}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section id="promos" className="rounded-[1.75rem] border border-neutral bg-white p-5 shadow-sm md:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-secondary/55">Promo Codes</p>
              <h2 className="mt-2 font-heading text-3xl font-black text-secondary">Seasonal Offers & Discounts</h2>
              <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                <div className="rounded-3xl border border-neutral bg-accent p-5">
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/55">Promo Code</span>
                    <input
                      value={promoForm.code}
                      onChange={(event) => setPromoForm((currentForm) => ({ ...currentForm, code: event.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-neutral px-4 py-3 text-sm outline-none transition focus:border-primary"
                    />
                  </label>
                  <label className="mt-4 block">
                    <span className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/55">Discount</span>
                    <input
                      value={promoForm.discount}
                      onChange={(event) => setPromoForm((currentForm) => ({ ...currentForm, discount: event.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-neutral px-4 py-3 text-sm outline-none transition focus:border-primary"
                      placeholder="10% or KES 500"
                    />
                  </label>
                  <label className="mt-4 block">
                    <span className="text-xs font-bold uppercase tracking-[0.22em] text-secondary/55">Status</span>
                    <select
                      value={promoForm.status}
                      onChange={(event) => setPromoForm((currentForm) => ({ ...currentForm, status: event.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-neutral px-4 py-3 text-sm outline-none transition focus:border-primary"
                    >
                      <option>Active</option>
                      <option>Paused</option>
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={addPromoCode}
                    disabled={dashboardActionLoading}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-secondary"
                  >
                    <FaPlus />
                    Add Promo Code
                  </button>
                </div>

                <div className="rounded-3xl border border-neutral bg-accent p-5">
                  <div className="space-y-3">
                    {promoCodes.map((promo) => (
                      <article key={promo.id} className="rounded-2xl border border-neutral bg-white px-4 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-secondary">{promo.code}</p>
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClasses(promo.status)}`}>
                            {promo.status}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-secondary/72">Discount: {promo.discount}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section id="reports" className="rounded-[1.75rem] border border-neutral bg-white p-5 shadow-sm md:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-secondary/55">Reports</p>
              <h2 className="mt-2 font-heading text-3xl font-black text-secondary">Performance Snapshot</h2>
              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {reports.map((report) => (
                  <article key={report.title} className="rounded-3xl bg-secondary px-5 py-5 text-white shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/60">{report.title}</p>
                    <p className="mt-4 font-heading text-3xl font-black">{report.value}</p>
                    <p className="mt-2 text-sm text-white/70">{report.note}</p>
                  </article>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
