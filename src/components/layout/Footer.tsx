import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Brand } from "./Brand";
import { Button } from "@/components/common/Button";
import { notify } from "@/components/common/Toast";
import { email as validateEmail } from "@/lib/validation";

export const CONTACT_DETAILS = {
  email: "support@edusphere.edu",
  phone: "+977 1 555 0123",
  address: "Learning Hub, Lazimpat, Kathmandu, Nepal",
  hours: "Sunday–Friday, 9:00–17:00 (NPT)",
};

export function Footer() {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const err = validateEmail(value);
    setError(err);
    if (err) return;
    setValue("");
    notify.success("You're subscribed", "We'll send learning tips and updates to your inbox.");
  };

  return (
    <footer className="es-footer">
      <div className="es-container">
        <div className="es-footer__grid">
          <div>
            <Brand />
            <p className="es-footer__tagline">Learn. Practice. Grow.</p>
          </div>
          <nav aria-label="Quick links">
            <h2 className="es-footer__heading">Quick links</h2>
            <ul className="es-footer__list">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/courses">Courses</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </nav>
          <nav aria-label="Community links">
            <h2 className="es-footer__heading">Community</h2>
            <ul className="es-footer__list">
              <li><Link to="/community">Discussion forum</Link></li>
              <li><Link to="/reviews">Course reviews</Link></li>
              <li><Link to="/announcements">Announcements</Link></li>
            </ul>
          </nav>
          <div>
            <h2 className="es-footer__heading">Contact</h2>
            <ul className="es-footer__list es-footer__contact">
              <li><Mail aria-hidden="true" /><a href={`mailto:${CONTACT_DETAILS.email}`}>{CONTACT_DETAILS.email}</a></li>
              <li><Phone aria-hidden="true" /><a href="tel:+97715550123">{CONTACT_DETAILS.phone}</a></li>
              <li><MapPin aria-hidden="true" /><span>{CONTACT_DETAILS.address}</span></li>
              <li><Clock aria-hidden="true" /><span>{CONTACT_DETAILS.hours}</span></li>
            </ul>
          </div>
          <form className="es-footer__newsletter" onSubmit={onSubmit} noValidate>
            <h2 className="es-footer__heading">Newsletter</h2>
            <label htmlFor="footer-newsletter" className="es-help">Get study tips and new course alerts once a month.</label>
            <div className="es-footer__newsletter-row">
              <input
                id="footer-newsletter"
                type="email"
                className="es-input"
                placeholder="you@example.com"
                autoComplete="email"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "footer-newsletter-error" : undefined}
              />
              <Button type="submit">Subscribe</Button>
            </div>
            {error ? <p id="footer-newsletter-error" className="es-error">{error}</p> : null}
          </form>
        </div>
        <div className="es-footer__bottom">
          <span>© EduSphere {new Date().getFullYear()}. All rights reserved.</span>
          <span>Learn. Practice. Grow.</span>
        </div>
      </div>
    </footer>
  );
}
