"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Mail, Phone, Plus } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

export type ClientRow = {
  id: string; name: string; company: string | null; email: string; phone: string | null; city: string | null;
  status: string; notes: string | null; contracts: number; value: number;
};

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const statuses = ["all", "active", "prospect", "past"] as const;
const STATUS_OPTS = ["prospect", "active", "past"];

type FormState = {
  name: string; company: string; email: string; phone: string; city: string; status: string; notes: string;
};
const emptyForm: FormState = {
  name: "", company: "", email: "", phone: "", city: "", status: "prospect", notes: "",
};

export function ClientsTable({ rows }: { rows: ClientRow[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<(typeof statuses)[number]>("all");
  const [q, setQ] = useState("");

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter(c =>
      (status === "all" || c.status === status) &&
      (!term || [c.name, c.company, c.email, c.city].some(v => (v || "").toLowerCase().includes(term)))
    );
  }, [rows, status, q]);

  const set = (k: keyof FormState, v: string) => setForm(f => ({ ...f, [k]: v }));
  function openCreate() { setForm(emptyForm); setCreating(true); setError(null); }
  function closeForm() { setCreating(false); setError(null); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error || "Could not save."); }
      closeForm();
      router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save."); }
    finally { setSaving(false); }
  }

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
          <button className="admin-btn" onClick={openCreate}><Plus size={16} /> New client</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="admin-empty">No clients match these filters.</p>
      ) : (
        <div className="table-scroll">
          <table className="admin-table">
            <colgroup>
              <col className="col-client" /><col className="col-contact" /><col className="col-city" />
              <col className="col-contracts" /><col className="col-value" /><col className="col-status" />
            </colgroup>
            <thead><tr><th>Client</th><th>Contact</th><th>City</th><th className="nums">Contracts</th><th className="nums">Value</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td data-label="Client"><div className="client-id"><strong>{c.name}</strong>{c.company ? <span className="muted">{c.company}</span> : null}</div></td>
                  <td data-label="Contact"><div className="contact-cell">
                    <a href={`mailto:${c.email}`}><Mail size={14} /> <span className="ct">{c.email}</span></a>
                    {c.phone && <a href={`tel:${c.phone}`}><Phone size={14} /> <span className="ct">{c.phone}</span></a>}
                  </div></td>
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

      {/* Add client dialog */}
      <Dialog open={creating} onOpenChange={(o) => { if (!o) closeForm(); }}>
        <DialogContent className="admin-dialog">
          <DialogHeader><DialogTitle>New client</DialogTitle></DialogHeader>
          <form className="admin-form" onSubmit={submit}>
            <div className="admin-form-grid">
              <label>Name <input value={form.name} onChange={e => set("name", e.target.value)} required /></label>
              <label>Company <input value={form.company} onChange={e => set("company", e.target.value)} placeholder="Optional" /></label>
              <label>Email <input type="email" value={form.email} onChange={e => set("email", e.target.value)} required /></label>
              <label>Phone <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="Optional" /></label>
              <label>City <input value={form.city} onChange={e => set("city", e.target.value)} placeholder="Optional" /></label>
              <label>Status
                <select value={form.status} onChange={e => set("status", e.target.value)}>
                  {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="span-2">Notes <textarea rows={2} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Optional" /></label>
            </div>
            {error && <p className="admin-form-error">{error}</p>}
            <DialogFooter>
              <button type="button" className="admin-btn ghost" onClick={closeForm}>Cancel</button>
              <button type="submit" className="admin-btn" disabled={saving}>{saving ? "Saving…" : "Add client"}</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
