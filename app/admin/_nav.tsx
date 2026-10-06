"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Megaphone, Inbox, Users, FileSignature, ExternalLink, LogOut, Menu, X } from "lucide-react";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/inventory", label: "Billboard inventory", icon: Megaphone },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
  { href: "/admin/contracts", label: "Contracts", icon: FileSignature },
  { href: "/admin/clients", label: "Client directory", icon: Users },
];

export function AdminNav({ email, signOutHref }: { email: string; signOutHref: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);

  // Close the drawer whenever navigation occurs (render-time reset).
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setOpen(false);
  }

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const current = items.find((i) => (i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href)));

  return (
    <>
      {/* Mobile top bar with hamburger (hidden on desktop) */}
      <div className="admin-topbar">
        <button
          type="button"
          className="admin-toggle"
          aria-label="Open admin menu"
          aria-expanded={open}
          aria-controls="admin-drawer"
          onClick={() => setOpen(true)}
        >
          <Menu size={22} />
        </button>
        <div className="admin-topbar-title">
          <span className="mark">LB<span>·</span></span>
          <strong>{current?.label ?? "Admin console"}</strong>
        </div>
      </div>

      {/* Dark overlay behind the drawer on mobile */}
      <div
        className={open ? "admin-overlay show" : "admin-overlay"}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar — static column on desktop, off-canvas drawer on mobile */}
      <aside id="admin-drawer" className={open ? "admin-side open" : "admin-side"}>
        <div className="admin-brand">
          <span className="mark">LB<span>·</span></span>
          <div>
            <strong>Liberia Billboard</strong>
            <span>Admin console</span>
          </div>
          <button
            type="button"
            className="admin-drawer-close"
            aria-label="Close admin menu"
            onClick={() => setOpen(false)}
          >
            <X size={22} />
          </button>
        </div>
        <nav className="admin-nav">
          {items.map(({ href, label, icon: Icon }) => {
            const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={active ? "admin-link active" : "admin-link"} onClick={() => setOpen(false)}>
                <Icon size={18} /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="admin-side-foot">
          <Link href="/" className="admin-link muted" target="_blank"><ExternalLink size={18} /> View public site</Link>
          <a href={signOutHref} className="admin-link muted"><LogOut size={18} /> Sign out</a>
          <div className="admin-user"><span>Signed in as</span><strong>{email}</strong></div>
        </div>
      </aside>
    </>
  );
}
