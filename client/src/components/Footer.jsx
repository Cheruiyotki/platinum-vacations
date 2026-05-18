import { FaInstagram, FaPhoneAlt, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

function parseList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toWhatsAppNumber(phone) {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("0")) {
    return `254${digits.slice(1)}`;
  }

  return digits;
}

function getFooterIcon(label) {
  const normalizedLabel = label.toLowerCase();

  if (normalizedLabel.includes("whatsapp")) {
    return <FaWhatsapp />;
  }

  if (normalizedLabel.includes("tiktok")) {
    return <FaTiktok />;
  }

  return <FaInstagram />;
}

function Footer({ contactPhones = "", footerEmail = "", footerLinks = "" }) {
  const phones = parseList(contactPhones);
  const links = parseList(footerLinks);
  const primaryPhone = phones[0] || "";
  const whatsappNumber = primaryPhone ? toWhatsAppNumber(primaryPhone) : "";

  return (
    <footer className="bg-primary py-12 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 md:grid-cols-3 md:px-6">
        <div>
          <h3 className="font-heading text-2xl font-extrabold">Platinum Vacations</h3>
          <p className="mt-2 text-sm text-white/85">Travel The World</p>
          <p className="mt-5 text-sm text-white/90">
            Affordable, expertly guided trips across Kenya with flexible payment options.
          </p>
        </div>

        <div>
          <h4 className="font-heading text-xl font-bold">Contact Us</h4>
          <ul className="mt-4 space-y-3 text-sm">
            {phones.map((phone) => (
              <li key={phone} className="flex items-center gap-3">
                <FaPhoneAlt className="text-white/85" />
                <a href={`tel:${phone}`} className="hover:underline">
                  {phone}
                </a>
              </li>
            ))}
            {whatsappNumber ? (
              <li className="flex items-center gap-3">
                <FaWhatsapp className="text-white/85" />
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  WhatsApp: {primaryPhone}
                </a>
              </li>
            ) : null}
            <li className="flex items-center gap-3">
              <MdEmail className="text-base text-white/85" />
              <a href={`mailto:${footerEmail}`} className="hover:underline">
                {footerEmail}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading text-xl font-bold">Follow Us</h4>
          <ul className="mt-4 space-y-3 text-sm">
            {links.map((link) => (
              <li key={link} className="flex items-center gap-3">
                {getFooterIcon(link)}
                <span>{link}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
