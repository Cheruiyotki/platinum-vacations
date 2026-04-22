import { useState } from "react";
import { FaPaperPlane, FaRobot, FaTimes } from "react-icons/fa";
import { logAssistantMessage } from "../api/messages";
import { usePackages } from "../context/PackageContext";

const quickPrompts = [
  "What adventures do you have?",
  "How do I pay?",
  "Where are you based?",
  "Give me Maasai Mara details"
];

const agencyContacts = {
  phones: ["0740629899", "0768070634", "0711757863"],
  whatsapp: "0740629899",
  email: "platinumvacationske@gmail.com",
  location: "Nyeri"
};

function formatAdventureSummary(travelPackage) {
  const depositAmount = Number.isFinite(travelPackage.deposit_required)
    ? travelPackage.deposit_required
    : 0;
  const pickupLine = travelPackage.pickup_point ? ` Pickup: ${travelPackage.pickup_point}.` : "";

  return `${travelPackage.title}: ${travelPackage.dates}, ${travelPackage.cost}. Book a space from KES ${depositAmount.toLocaleString()}.${pickupLine}`;
}

function buildUpcomingAdventuresReply(packages) {
  if (!packages.length) {
    return "I can help with Platinum Vacations, but the current adventure list is not loaded right now.";
  }

  return `Upcoming Platinum Vacations adventures include ${packages
    .map((travelPackage) => `${travelPackage.title} on ${travelPackage.dates}`)
    .join(", ")}. Ask me about any one of them for price, pickup point, or payment details.`;
}

function buildDatesAndBookingReply(packages) {
  if (!packages.length) {
    return "I can help with Platinum Vacations booking details, but the current adventure list is not loaded right now.";
  }

  return `Current Platinum Vacations adventures include ${packages
    .map((travelPackage) => `${travelPackage.title} on ${travelPackage.dates}`)
    .join(", ")}. You can pay in full or book a space with at least half upfront, then clear the balance the day before the trip. Ask me about any specific adventure for price, pickup point, or deposit details.`;
}

function buildSuggestionReply(message, packages) {
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("mountain") ||
    normalizedMessage.includes("hike") ||
    normalizedMessage.includes("trek")
  ) {
    return "If you want a hiking-style Platinum Vacations adventure, Mount Kenya and Mt. Satima are strong options. Mount Kenya suits a fuller mountain escape, while Mt. Satima is great for a shorter scenic hike.";
  }

  if (
    normalizedMessage.includes("beach") ||
    normalizedMessage.includes("coast") ||
    normalizedMessage.includes("relax")
  ) {
    return "For a beach-style Platinum Vacations trip, the Mombasa and Malindi adventure is the best fit right now.";
  }

  if (
    normalizedMessage.includes("wildlife") ||
    normalizedMessage.includes("safari") ||
    normalizedMessage.includes("animals")
  ) {
    return "For wildlife and safari vibes, Maasai Mara is the best current Platinum Vacations suggestion.";
  }

  if (
    normalizedMessage.includes("budget") ||
    normalizedMessage.includes("cheap") ||
    normalizedMessage.includes("affordable")
  ) {
    const cheapestAdventure = [...packages].sort((left, right) => {
      const leftCost = Number.parseFloat(String(left.cost || "").replace(/[^0-9.]/g, "")) || 0;
      const rightCost = Number.parseFloat(String(right.cost || "").replace(/[^0-9.]/g, "")) || 0;
      return leftCost - rightCost;
    })[0];

    return cheapestAdventure
      ? `If you're looking for a more affordable option, ${cheapestAdventure.title} is a good place to start at ${cheapestAdventure.cost}.`
      : "I can suggest an adventure once the current Platinum Vacations list is available.";
  }

  return "Yes, definitely. You can suggest where you would like Platinum Vacations to visit next, and I can also recommend current options like Maasai Mara, Mount Kenya, Mt. Satima, Mombasa, or Naivasha depending on the experience you want.";
}

function findAdventureMatch(message, packages) {
  const normalizedMessage = message.toLowerCase();

  return (
    packages.find((travelPackage) => {
      const title = travelPackage.title?.toLowerCase() || "";
      const slug = travelPackage.slug?.toLowerCase() || "";
      const keywords = [title, slug];

      if (slug.includes("mount-kenya")) {
        keywords.push("mount kenya");
      }

      if (slug.includes("mt-satima")) {
        keywords.push("mt satima", "satima");
      }

      if (slug.includes("maasai-mara")) {
        keywords.push("maasai mara", "mara");
      }

      if (slug.includes("mombasa")) {
        keywords.push("mombasa", "malindi");
      }

      if (slug.includes("naivasha")) {
        keywords.push("naivasha", "wrc");
      }

      return keywords.some((keyword) => keyword && normalizedMessage.includes(keyword));
    }) || null
  );
}

function buildMessageTopic(message, matchedAdventure) {
  const normalizedMessage = message.trim().toLowerCase();

  if (matchedAdventure?.title) {
    return matchedAdventure.title;
  }

  if (normalizedMessage.includes("pay") || normalizedMessage.includes("mpesa")) {
    return "Payment";
  }

  if (normalizedMessage.includes("pickup")) {
    return "Pickup point";
  }

  if (normalizedMessage.includes("contact") || normalizedMessage.includes("whatsapp")) {
    return "Contacts";
  }

  if (normalizedMessage.includes("upcoming") || normalizedMessage.includes("event")) {
    return "Upcoming events";
  }

  if (normalizedMessage.includes("book") || normalizedMessage.includes("date")) {
    return "Booking info";
  }

  if (normalizedMessage.includes("suggest") || normalizedMessage.includes("recommend")) {
    return "Destination suggestion";
  }

  return "General inquiry";
}

function shouldMarkMessageUnanswered(message, reply) {
  const normalizedMessage = message.toLowerCase();
  const normalizedReply = reply.toLowerCase();

  return (
    normalizedReply.includes("not loaded") ||
    normalizedReply.includes("i can only help") ||
    normalizedMessage.includes("issue") ||
    normalizedMessage.includes("problem") ||
    normalizedMessage.includes("did not") ||
    normalizedMessage.includes("not working") ||
    normalizedMessage.includes("failed")
  );
}

function buildAssistantReply(message, packages, matchedAdventure = findAdventureMatch(message, packages)) {
  const normalizedMessage = message.trim().toLowerCase();

  if (!normalizedMessage) {
    return "Ask me about Platinum Vacations adventures, prices, payments, pickups, or contact details.";
  }

  if (
    normalizedMessage.includes("hello") ||
    normalizedMessage.includes("hi") ||
    normalizedMessage.includes("hey")
  ) {
    return "Hello. I can help with Platinum Vacations adventures, prices, booking payments, pickup points, and contact details.";
  }

  if (
    normalizedMessage.includes("where are you based") ||
    normalizedMessage.includes("where are you located") ||
    normalizedMessage.includes("nyeri") ||
    normalizedMessage.includes("about")
  ) {
    return "Platinum Vacations is based in Nyeri and specializes in carefully planned travel adventures across Kenya.";
  }

  if (
    normalizedMessage.includes("upcoming") ||
    normalizedMessage.includes("coming up") ||
    normalizedMessage.includes("next trip") ||
    normalizedMessage.includes("next event") ||
    normalizedMessage.includes("upcoming event") ||
    normalizedMessage.includes("events")
  ) {
    return buildUpcomingAdventuresReply(packages);
  }

  if (
    normalizedMessage.includes("date") ||
    normalizedMessage.includes("dates") ||
    normalizedMessage.includes("booking info") ||
    normalizedMessage.includes("book info") ||
    normalizedMessage.includes("booking details") ||
    normalizedMessage.includes("how do i book") ||
    normalizedMessage.includes("how to book") ||
    normalizedMessage.includes("book")
  ) {
    if (matchedAdventure) {
      return `${formatAdventureSummary(matchedAdventure)} You can pay in full or reserve your space with at least half upfront, then clear the balance the day before the trip.`;
    }

    return buildDatesAndBookingReply(packages);
  }

  if (
    normalizedMessage.includes("contact") ||
    normalizedMessage.includes("phone") ||
    normalizedMessage.includes("whatsapp") ||
    normalizedMessage.includes("email")
  ) {
    return `You can contact Platinum Vacations on ${agencyContacts.phones.join(", ")}. WhatsApp: ${agencyContacts.whatsapp}. Email: ${agencyContacts.email}.`;
  }

  if (
    normalizedMessage.includes("pay") ||
    normalizedMessage.includes("payment") ||
    normalizedMessage.includes("till") ||
    normalizedMessage.includes("mpesa") ||
    normalizedMessage.includes("pin") ||
    normalizedMessage.includes("book a space") ||
    normalizedMessage.includes("deposit")
  ) {
    return "You can pay in full or book a space with at least half upfront, then clear the balance the day before the trip. M-Pesa till number: 46 19 122. The website can send an M-Pesa prompt to the customer phone number you enter.";
  }

  if (
    normalizedMessage.includes("pickup") ||
    normalizedMessage.includes("meeting point") ||
    normalizedMessage.includes("pick up")
  ) {
    const pickupDetails = packages
      .filter((travelPackage) => travelPackage.pickup_point)
      .map((travelPackage) => `${travelPackage.title}: ${travelPackage.pickup_point}`)
      .join(" ");

    return pickupDetails || "Some adventures have shared pickup points and others are confirmed during booking.";
  }

  if (
    normalizedMessage.includes("suggest") ||
    normalizedMessage.includes("recommend") ||
    normalizedMessage.includes("where to visit next") ||
    normalizedMessage.includes("where should i go") ||
    normalizedMessage.includes("which place")
  ) {
    return buildSuggestionReply(normalizedMessage, packages);
  }

  if (
    normalizedMessage.includes("adventure") ||
    normalizedMessage.includes("trip") ||
    normalizedMessage.includes("tour") ||
    normalizedMessage.includes("available") ||
    normalizedMessage.includes("package") ||
    normalizedMessage.includes("gallery")
  ) {
    if (!packages.length) {
      return "I can answer about Platinum Vacations, but the current adventure list is not loaded right now.";
    }

    return `Current adventures include ${packages.map((travelPackage) => travelPackage.title).join(", ")}. Ask me about any one of them for dates, prices, pickup points, or booking info.`;
  }

  if (matchedAdventure) {
    return formatAdventureSummary(matchedAdventure);
  }

  return "I can only help with Platinum Vacations information like adventures, dates, prices, payments, pickup points, and contact details.";
}

function TravelAssistant() {
  const { packages } = usePackages();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Platinum AI is here to help with this agency only. Ask about adventures, payments, pickups, or contact details."
    }
  ]);
  const hasUserAskedQuestion = messages.some((message) => message.role === "user");

  const sendMessage = (message) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      return;
    }

    const matchedAdventure = findAdventureMatch(trimmedMessage, packages);
    const assistantReply = buildAssistantReply(trimmedMessage, packages, matchedAdventure);

    setMessages((currentMessages) => [
      ...currentMessages,
      { id: `${Date.now()}-user`, role: "user", content: trimmedMessage },
      {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: assistantReply
      }
    ]);
    setInputValue("");
    setIsOpen(true);

    void logAssistantMessage({
      source: "Website AI",
      topic: buildMessageTopic(trimmedMessage, matchedAdventure),
      summary: trimmedMessage.slice(0, 220),
      unanswered: shouldMarkMessageUnanswered(trimmedMessage, assistantReply)
    }).catch(() => {});
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(inputValue);
  };

  return (
    <>
      {isOpen ? (
        <div className="fixed bottom-16 right-3 z-[80] w-[min(18rem,calc(100vw-1.25rem))] overflow-hidden rounded-[1.3rem] border border-white/10 bg-white shadow-2xl sm:bottom-20 sm:w-[min(20rem,calc(100vw-1.5rem))] sm:rounded-[1.5rem] md:bottom-24 md:right-6 md:w-[calc(100vw-2rem)] md:max-w-sm md:rounded-[1.75rem]">
          <div className="bg-secondary px-4 py-3 text-white sm:px-5 sm:py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/75 sm:px-3 sm:text-[11px] sm:tracking-[0.24em]">
                  <FaRobot className="text-[10px] sm:text-xs" />
                  AI Powered
                </p>
                <h3 className="mt-2 font-heading text-xl font-extrabold sm:mt-3 sm:text-2xl">
                  Platinum AI
                </h3>
                <p className="mt-1 text-xs text-white/75 sm:text-sm">
                  Answers only about Platinum Vacations.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm text-white transition hover:bg-primary sm:h-10 sm:w-10 sm:text-base"
                aria-label="Close chat assistant"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="max-h-[16rem] space-y-2.5 overflow-y-auto bg-accent px-3 py-3 sm:max-h-[18rem] sm:space-y-3 sm:px-4 sm:py-4 md:max-h-[24rem]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[90%] rounded-2xl px-3 py-2.5 text-xs leading-5 shadow-sm sm:max-w-[88%] sm:px-4 sm:py-3 sm:text-sm sm:leading-6 ${
                  message.role === "assistant"
                    ? "bg-neutral text-secondary"
                    : "ml-auto bg-primary text-white"
                }`}
              >
                {message.content}
              </div>
            ))}
          </div>

          <div className="border-t border-neutral bg-white px-3 py-3 sm:px-4 sm:py-4">
            {!hasUserAskedQuestion ? (
              <div className="mb-3 flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="rounded-full border border-neutral px-2.5 py-1.5 text-[11px] font-bold text-secondary transition hover:border-primary hover:text-primary sm:px-3 sm:text-xs"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <textarea
                rows="2"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Ask about adventures, payments, pickups, or contacts..."
                className="min-h-[3rem] flex-1 resize-none rounded-2xl border border-neutral px-3 py-2.5 text-xs text-secondary outline-none transition focus:border-primary sm:min-h-[3.25rem] sm:px-4 sm:py-3 sm:text-sm"
              />
              <button
                type="submit"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm text-white transition hover:bg-secondary sm:h-12 sm:w-12 sm:text-base"
                aria-label="Send message"
              >
                <FaPaperPlane />
              </button>
            </form>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-3 right-3 z-[75] inline-flex items-center gap-2 rounded-full bg-primary px-3.5 py-2.5 text-xs font-bold text-white shadow-2xl transition hover:bg-secondary sm:bottom-4 sm:right-4 sm:gap-3 sm:px-5 sm:py-3 sm:text-sm md:bottom-6 md:right-6"
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 sm:h-10 sm:w-10">
          <FaRobot className="text-sm sm:text-base" />
        </span>
        <span className="text-left">
          <span className="block text-[9px] uppercase tracking-[0.18em] text-white/70 sm:text-[11px] sm:tracking-[0.24em]">
            AI Powered
          </span>
          <span className="block">Chat With Platinum AI</span>
        </span>
      </button>
    </>
  );
}

export default TravelAssistant;
