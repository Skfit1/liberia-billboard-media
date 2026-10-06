import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact | Liberia Billboard Media",
  description: "Get in touch with Liberia Billboard Media about outdoor advertising campaigns.",
};

export default function Contact() {
  return (
    <main>
      <section className="page-hero">
        <p className="eyebrow">LET’S TALK CAMPAIGNS</p>
        <h1>Get in <em>touch.</em></h1>
        <p className="page-lead">
          Tell us about your campaign and we’ll help you plan the right placements.
          The fastest way to start is a quote request — but you’re welcome to reach us directly.
        </p>
      </section>
      <section className="section contact-section">
        <div className="contact-grid">
          <a className="contact-row" href="mailto:hello@liberiabillboardmedia.com">
            <div className="contact-icon"><Mail size={22} /></div>
            <div>
              <span className="contact-label">EMAIL</span>
              <h3>hello@liberiabillboardmedia.com</h3>
              <p>We reply to inquiries within one business day.</p>
            </div>
          </a>
          <a className="contact-row" href="tel:+231770000000">
            <div className="contact-icon"><Phone size={22} /></div>
            <div>
              <span className="contact-label">PHONE / WHATSAPP</span>
              <h3>+231 77 000 0000</h3>
              <p>Call or message us during business hours, Mon–Fri.</p>
            </div>
          </a>
          <div className="contact-row">
            <div className="contact-icon"><MapPin size={22} /></div>
            <div>
              <span className="contact-label">OFFICE</span>
              <h3>Sinkor, Monrovia</h3>
              <p>Republic of Liberia. Visits by appointment.</p>
            </div>
          </div>
        </div>
        <div className="contact-cta">
          <div>
            <p className="eyebrow">READY WHEN YOU ARE</p>
            <h2>Start with a quote request.</h2>
            <p>Share your dates, format and target area and we’ll follow up with availability.</p>
          </div>
          <Link href="/#request" className="primary-link">Request a quote <ArrowUpRight size={20} /></Link>
        </div>
      </section>
    </main>
  );
}
