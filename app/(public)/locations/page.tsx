import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, MapPin, Monitor, PanelTop } from "lucide-react";

export const metadata: Metadata = {
  title: "Billboard locations | Liberia Billboard Media",
  description: "High-traffic digital and static billboard locations across Monrovia and Liberia.",
};

const areas = [
  { city: "Monrovia", spot: "Tubman Boulevard, Sinkor", format: "Digital billboard", note: "Prime commercial corridor with heavy commuter traffic." },
  { city: "Monrovia", spot: "Broad Street, Central Business District", format: "Static billboard", note: "Downtown retail and government district footfall." },
  { city: "Paynesville", spot: "Red Light Market Junction", format: "Digital billboard", note: "One of the busiest market intersections in the country." },
  { city: "Monrovia", spot: "UN Drive Waterfront", format: "Static billboard", note: "Wide roadside visibility along the port approach." },
  { city: "Congo Town", spot: "Tubman Boulevard near Ministerial Complex", format: "Digital billboard", note: "Government offices and daily commuter flow." },
  { city: "Gardnersville", spot: "Somalia Drive Highway", format: "Static billboard", note: "Major freight route linking greater Monrovia." },
];

export default function Locations() {
  return (
    <main>
      <section className="page-hero">
        <p className="eyebrow">WHERE LIBERIA LOOKS UP</p>
        <h1>Billboard locations<br />across <em>Liberia.</em></h1>
        <p className="page-lead">
          Our network covers the highest-traffic corridors in greater Monrovia and beyond.
          Availability changes often — request a quote and we’ll confirm what’s open for your dates.
        </p>
      </section>
      <section className="section location-section">
        <div className="section-head">
          <div>
            <p className="eyebrow">SELECTED PLACEMENTS</p>
            <h2>Placements &amp; corridors.</h2>
          </div>
          <p>Digital and static formats in the areas advertisers ask for most.</p>
        </div>
        <div className="loc-list">
          {areas.map((a, i) => (
            <article key={i} className="loc-row">
              <span className="loc-index">{String(i + 1).padStart(2, "0")}</span>
              <div className="loc-icon">
                {a.format === "Digital billboard" ? <Monitor size={22} /> : <PanelTop size={22} />}
              </div>
              <div className="loc-body">
                <h3>{a.spot}</h3>
                <p>{a.note}</p>
              </div>
              <div className="loc-meta">
                <span className="loc-city"><MapPin size={14} /> {a.city}</span>
                <span className="loc-format">{a.format}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="cta-band">
        <div>
          <p className="eyebrow">FOUND A SPOT?</p>
          <h2>Let’s check availability.</h2>
        </div>
        <Link href="/#request" className="primary-link">Request a quote <ArrowUpRight size={20} /></Link>
      </section>
    </main>
  );
}
