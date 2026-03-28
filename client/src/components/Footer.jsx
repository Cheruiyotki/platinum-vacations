import { FaInstagram, FaPhoneAlt, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

const phones = ["0740629899", "0768070634", "0711757863"];

function Footer() {
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
            <li className="flex items-center gap-3">
              <FaWhatsapp className="text-white/85" />
              <a
                href="https://wa.me/254740629899"
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                WhatsApp: 0740629899
              </a>
            </li>
            <li className="flex items-center gap-3">
              <MdEmail className="text-base text-white/85" />
              <a href="mailto:platinumvacationske@gmail.com" className="hover:underline">
                platinumvacationske@gmail.com
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading text-xl font-bold">Follow Us</h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <FaInstagram />
              <a
                href="https://www.instagram.com/wathways_tours/"
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                Instagram
              </a>
            </li>
            <li className="flex items-center gap-3">
              <FaTiktok />
              <span>TikTok: platinum__vacations</span>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
