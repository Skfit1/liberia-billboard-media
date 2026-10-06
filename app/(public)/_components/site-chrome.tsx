"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";

const links = [
  { href: "/locations", label: "Locations" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [prevPath, setPrevPath] = useState(pathname);

  // Close the mobile menu whenever the route changes (render-time reset).
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setOpen(false);
  }

  // Lock body scroll while the full-screen mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="header">
      <Link href="/" className="brand" onClick={() => setOpen(false)}>
        <span className="mark">
          LB<span>·</span>
        </span>
        <span>
          LIBERIA
          <br />
          BILLBOARD MEDIA
        </span>
      </Link>

      {/* Desktop / tablet inline navigation */}
      <nav className="header-nav">
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
          </Link>
        ))}
        <Link href="/#request" className="nav-cta">
          Request a quote <ArrowUpRight size={17} />
        </Link>
      </nav>

      {/* Mobile hamburger toggle */}
      <button
        type="button"
        className="nav-toggle"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X size={26} /> : <Menu size={26} />}
      </button>

      {/* Mobile slide-in menu */}
      <div
        id="mobile-menu"
        className={open ? "mobile-menu open" : "mobile-menu"}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
      >
        <nav>
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label} <ArrowUpRight size={20} />
            </Link>
          ))}
          <Link href="/#request" className="mobile-cta" onClick={() => setOpen(false)}>
            Request a quote <ArrowUpRight size={20} />
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer>
      <Link href="/" className="brand">
        <span className="mark">
          LB<span>·</span>
        </span>
        <span>
          LIBERIA
          <br />
          BILLBOARD MEDIA
        </span>
      </Link>
      <nav className="footer-nav">
        <Link href="/locations">Locations</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/contact">Contact</Link>
      </nav>
      <span>© {new Date().getFullYear()} Liberia Billboard Media</span>
    </footer>
  );
}
