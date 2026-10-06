"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import type { Billboard } from "../_data";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const money = (n: number | null) => (n == null ? "—" : "$" + Math.round(n).toLocaleString("en-US"));
const statuses = ["all", "available", "booked", "reserved", "maintenance"] as const;
const FORMATS = ["Digital billboard", "Static billboard"];
const STATUS_OPTS = ["available", "booked", "reserved", "maintenance"];

type FormState = {
  code: string; name: string; city: string; location: string; format: string;
  width_ft: string; height_ft: string; facing: string; monthly_rate: string;
  status: string; notes: string;
};
const emptyForm: FormState = {
  code: "", name: "", city: "", location: "", format: "Digital billboard",
  width_ft: "", height_ft: "", facing: "", monthly_rate: "", status: "available", notes: "",
};
const toForm = (b: Billboard): FormState => ({
  code: b.code, name: b.name, city: b.city, location: b.location, format: b.format,
  width_ft: b.width_ft?.toString() ?? "", height_ft: b.height_ft?.toString() ?? "",
  facing: b.facing ?? "", monthly_rate: b.monthly_rate?.toString() ?? "",
  status: b.status, notes: b.notes ?? "",
});

export function InventoryTable({ rows }: { rows: Billboard[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<(typeof statuses)[number]>("all");
  const [format, setFormat] = useState("all");
  const [q, setQ] = useState("");

  const [editing, setEditing] = useState<Billboard | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Billboard | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter(b =>
      (status === "all" || b.status === status) &&
      (format === "all" || b.format === format) &&
      (!term || [b.code, b.name, b.city, b.location].some(v => v.toLowerCase().includes(term)))
    );
  }, [rows, status, format, q]);

  const formats = Array.from(new Set(rows.map(r => r.format)));
  const set = (k: keyof FormState, v: string) => setForm(f => ({ ...f, [k]: v }));

  function openCreate() { setForm(emptyForm); setCreating(true); setError(null); }
  function openEdit(b: Billboard) { setEditing(b); setForm(toForm(b)); setError(null); }
  function closeForm() { setCreating(false); setEditing(null); setError(null); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const url = editing ? `/api/admin/billboards/${editing.id}` : "/api/admin/billboards";
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error || "Could not save."); }
      closeForm();
      router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save."); }
    finally { setSaving(false); }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/billboards/${deleting.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setDeleting(null);
      router.refresh();
    } catch { setError("Could not delete the billboard."); }
    finally { setSaving(false); }
  }

  const dialogOpen = creating || editing !== null;

  return (
    <>
      <div className="admin-toolbar">
        <div className="seg">
          {statuses.map(s => (
            <button key={s} className={status === s ? "seg-btn active" : "seg-btn"} onClick={() => setStatus(s)}>{s}</button>
          ))}
        </div>
        <div className="toolbar-right">
          <select className="admin-select" value={format} onChange={e => setFormat(e.target.value)}>
            <option value="all">All formats</option>
            {formats.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <div className="admin-search"><Search size={16} /><input placeholder="Search code, name, location…" value={q} onChange={e => setQ(e.target.value)} /></div>
          <button className="admin-btn" onClick={openCreate}><Plus size={16} /> Add billboard</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="admin-empty">No billboards match these filters.</p>
      ) : (
        <div className="table-scroll">
          <table className="admin-table">
            <thead><tr><th>Code</th><th>Site</th><th>City</th><th>Format</th><th>Size</th><th className="nums">Rate / mo</th><th>Status</th><th className="col-actions">Actions</th></tr></thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id}>
                  <td className="mono" data-label="Code">{b.code}</td>
                  <td data-label="Site"><strong>{b.name}</strong><span className="muted"> · {b.location}</span></td>
                  <td data-label="City">{b.city}</td>
                  <td data-label="Format">{b.format}</td>
                  <td className="nums" data-label="Size">{b.width_ft && b.height_ft ? `${b.width_ft}×${b.height_ft} ft` : "—"}</td>
                  <td className="nums" data-label="Rate / mo">{money(b.monthly_rate)}</td>
                  <td data-label="Status"><span className={`tag tag-${b.status}`}>{b.status}</span></td>
                  <td data-label="Actions">
                    <div className="row-actions">
                      <button className="icon-btn" title="Edit" onClick={() => openEdit(b)}><Pencil size={15} /></button>
                      <button className="icon-btn danger" title="Delete" onClick={() => setDeleting(b)}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="admin-count">{filtered.length} of {rows.length} sites</p>

      {/* Add / edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) closeForm(); }}>
        <DialogContent className="admin-dialog">
          <DialogHeader><DialogTitle>{editing ? "Edit billboard" : "Add billboard"}</DialogTitle></DialogHeader>
          <form className="admin-form" onSubmit={submit}>
            <div className="admin-form-grid">
              <label>Code <input value={form.code} onChange={e => set("code", e.target.value)} required /></label>
              <label>Name <input value={form.name} onChange={e => set("name", e.target.value)} required /></label>
              <label>City <input value={form.city} onChange={e => set("city", e.target.value)} required /></label>
              <label>Location <input value={form.location} onChange={e => set("location", e.target.value)} required /></label>
              <label>Format
                <select value={form.format} onChange={e => set("format", e.target.value)}>
                  {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </label>
              <label>Facing <input value={form.facing} onChange={e => set("facing", e.target.value)} placeholder="e.g. Northbound" /></label>
              <label>Width (ft) <input type="number" min="0" value={form.width_ft} onChange={e => set("width_ft", e.target.value)} /></label>
              <label>Height (ft) <input type="number" min="0" value={form.height_ft} onChange={e => set("height_ft", e.target.value)} /></label>
              <label>Monthly rate (USD) <input type="number" min="0" value={form.monthly_rate} onChange={e => set("monthly_rate", e.target.value)} /></label>
              <label>Status
                <select value={form.status} onChange={e => set("status", e.target.value)}>
                  {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="span-2">Notes <textarea rows={2} value={form.notes} onChange={e => set("notes", e.target.value)} /></label>
            </div>
            {error && <p className="admin-form-error">{error}</p>}
            <DialogFooter>
              <button type="button" className="admin-btn ghost" onClick={closeForm}>Cancel</button>
              <button type="submit" className="admin-btn" disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Add billboard"}</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleting !== null} onOpenChange={(o) => { if (!o) setDeleting(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this billboard?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting ? `“${deleting.name}” (${deleting.code}) will be permanently removed. This cannot be undone.` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); confirmDelete(); }} disabled={saving}>
              {saving ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
