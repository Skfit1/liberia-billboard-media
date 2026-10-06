"use client";
import { useMemo, useState } from "react";
import { Search, Mail, Phone } from "lucide-react";

export type ClientRow = {
  id: string; name: string; company: string | null; email: string; phone: string | null; city: string | null;
  status: string; notes: string | null; contracts: number; value: number;
};

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const statuses = ["all", "active", "prospect", "past"] as const;

export function ClientsTable({ rows }: { rows: ClientRow[] }) {
  const [status, setStatus] = useState<(typeof statuses)[number]>("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter(c =>
      (status === "all" || c.status === status) &&
      (!term || [c.name, c.company, c.email, c.city].some(v => (v || "").toLowerCase().includes(term)))
    );
  }, [rows, status, q]);

  return (
    <>
      <div className="admin-toolbar">
        <div className="seg">
          {statuses.map(s => (
            <button key={s} className={status === s ? "seg-btn active" : "seg-btn"} onClick={() => setStatus(s)}>{s}</button>
          ))}
        </div>
        <div className="toolbar-right">
          <div className="admin-search"><Search size={16} /><input placeholder="Search client, company, email…" value={q} onChange={e => setQ(e.target.value)} /></div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="admin-empty">No clients match these filters.</p>
      ) : (
        <div className="table-scroll">
          <table className="admin-table">
            <thead><tr><th>Client</th><th>Contact</th><th>City</th><th className="nums">Contracts</th><th className="nums">Value</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td data-label="Client"><strong>{c.name}</strong>{c.company ? <span className="muted"> · {c.company}</span> : null}</td>
                  <td className="contact-cell" data-label="Contact">
                    <a href={`mailto:${c.email}`}><Mail size={14} /> {c.email}</a>
                    {c.phone && <a href={`tel:${c.phone}`}><Phone size={14} /> {c.phone}</a>}
                  </td>
                  <td data-label="City">{c.city || "—"}</td>
                  <td className="nums" data-label="Contracts">{c.contracts}</td>
                  <td className="nums" data-label="Value">{c.value ? money(c.value) : "—"}</td>
                  <td data-label="Status"><span className={`tag tag-${c.status}`}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="admin-count">{filtered.length} of {rows.length} clients</p>
    </>
  );
}
