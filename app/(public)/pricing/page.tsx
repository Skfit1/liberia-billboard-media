import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing | Liberia Billboard Media",
  description: "Indicative billboard advertising rates for digital and static campaigns in Liberia.",
};

const tiers = [
  {
    name: "Static billboard",
    price: "$650",
    unit: "per site / month",
    blurb: "Large-format printed presence for always-on brand visibility.",
    features: ["Single premium roadside face", "Print production included", "Minimum 1-month booking", "Monthly condition check"],
  },
  {
    name: "Digital billboard",
    price: "$1,200",
    unit: "per site / month",
    blurb: "Rotating digital slots on high-traffic LED screens.",
    features: ["Shared rotation, 6-8 sec slots", "Unlimited creative swaps", "Flexible 2-week to 6-month terms", "Proof-of-play reporting"],
    featured: true,
  },
  {
    name: "Multi-site campaign",
    price: "Custom",
    unit: "tailored quote",
    blurb: "Coordinated coverage across several corridors and cities.",
    features: ["3+ locations", "Mixed digital & static", "Volume pricing", "Dedicated campaign manager"],
  },
];

export default function Pricing() {
  return (
    <main>
      <section className="page-hero">
        <p className="eyebrow">TRANSPARENT STARTING POINTS</p>
        <h1>Straightforward<br /><em>pricing.</em></h1>
        <p className="page-lead">
          Rates below are indicative starting points in USD. Final pricing depends on location,
          season, campaign length and creative. Every booking starts with a written quote — no surprises.
        </p>
      </section>
      <section className="section pricing-section">
        <div className="price-grid">
          {tiers.map((t) => (
            <article key={t.name} className={t.featured ? "price-card featured" : "price-card"}>
              {t.featured && <span className="price-flag">MOST REQUESTED</span>}
              <h3>{t.name}</h3>
              <div className="price-amount">
                <strong>{t.price}</strong>
                <span>{t.unit}</span>
              </div>
              <p className="price-blurb">{t.blurb}</p>
              <ul>
                {t.features.map((f) => (
                  <li key={f}><Check size={16} /> {f}</li>
                ))}
              </ul>
              <Link href="/#request" className="price-cta">Request a quote <ArrowUpRight size={17} /></Link>
            </article>
          ))}
        </div>
        <p className="price-note">
          Prices exclude applicable taxes. Digital rotations are sold on a shared basis unless a
          dedicated screen is requested. Ask us about non-profit and long-term rates.
        </p>
      </section>
    </main>
  );
}
