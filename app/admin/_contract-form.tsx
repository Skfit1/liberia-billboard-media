"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

export type ClientOpt = { id: string; name: string; company: string | null };
export type BillboardOpt = { id: string; code: string; name: string };

export type ContractInitial = {
  contractId?: string;      // present => edit mode
  inquiryId?: string;       // present => create-from-inquiry (sets inquiry contracted)
  clientId?: string;
  billboardId?: string;
  campaignName?: string;
  startDate?: string;
  endDate?: string;
  amount?: number | null;
  terms?: string;
  submitted?: number;
};

type FormState = {
  client_id: string; billboard_id: string; campaign_name: string;
  start_date: string; end_date: string; amount: string; terms: string;
};

export function ContractForm({
  open, onOpenChange, clients, billboards, initial,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  clients: ClientOpt[];
  billboards: BillboardOpt[];
  initial: ContractInitial;
}) {
  const router = useRouter();
  const isEdit = !!initial.contractId;
  const [form, setForm] = useState<FormState>({
    client_id: "", billboard_id: "", campaign_name: "", start_date: "", end_date: "", amount: "", terms: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(false);

  // Reset the form (during render) each time the dialog transitions to open,
  // seeding it with the current initial values.
  if (open && !wasOpen) {
    setWasOpen(true);
    setForm({
      client_id: initial.clientId ?? "",
      billboard_id: initial.billboardId ?? "",
      campaign_name: initial.campaignName ?? "",
      start_date: initial.startDate ?? "",
      end_date: initial.endDate ?? "",
      amount: initial.amount != null ? String(initial.amount) : "",
      terms: initial.terms ?? "",
    });
    setError(null);
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  const set = (k: keyof FormState, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function save(submit: boolean) {
    setSaving(true); setError(null);
    try {
      const payload: Record<string, unknown> = {
        ...form,
        amount: form.amount,
        inquiry_id: initial.inquiryId,
        submit,
      };
      const url = isEdit ? `/api/admin/contracts/${initial.contractId}` : "/api/admin/contracts";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error || "Could not save the contract."); }
      onOpenChange(false);
      router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save the contract."); }
    finally { setSaving(false); }
  }

  const alreadySubmitted = isEdit && initial.submitted === 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="admin-dialog">
        <DialogHeader><DialogTitle>{isEdit ? "Edit contract" : "Start contract"}</DialogTitle></DialogHeader>
        <form className="admin-form" onSubmit={(e) => { e.preventDefault(); save(false); }}>
          <div className="admin-form-grid">
            <label className="span-2">Client
              <select value={form.client_id} onChange={e => set("client_id", e.target.value)} required disabled={!!initial.inquiryId}>
                <option value="">Select a client…</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` · ${c.company}` : ""}</option>)}
              </select>
            </label>
            <label className="span-2">Campaign name <input value={form.campaign_name} onChange={e => set("campaign_name", e.target.value)} required /></label>
            <label className="span-2">Billboard
              <select value={form.billboard_id} onChange={e => set("billboard_id", e.target.value)}>
                <option value="">No specific billboard</option>
                {billboards.map(b => <option key={b.id} value={b.id}>{b.code} · {b.name}</option>)}
              </select>
            </label>
            <label>Start date <input type="date" value={form.start_date} onChange={e => set("start_date", e.target.value)} required /></label>
            <label>End date <input type="date" value={form.end_date} onChange={e => set("end_date", e.target.value)} required /></label>
            <label className="span-2">Contract value (USD) <input type="number" min="0" value={form.amount} onChange={e => set("amount", e.target.value)} /></label>
            <label className="span-2">Terms / notes <textarea rows={3} value={form.terms} onChange={e => set("terms", e.target.value)} /></label>
          </div>
          {error && <p className="admin-form-error">{error}</p>}
          <p className="admin-form-hint">
            {alreadySubmitted
              ? "This contract is submitted — its status is derived from the campaign dates."
              : "Save keeps the contract as Pending. Submit locks it in and derives its status from the dates."}
          </p>
          <DialogFooter>
            <button type="button" className="admin-btn ghost" onClick={() => onOpenChange(false)}>Cancel</button>
            <button type="submit" className="admin-btn ghost" disabled={saving}>{saving ? "Saving…" : "Save (Pending)"}</button>
            {!alreadySubmitted && (
              <button type="button" className="admin-btn" disabled={saving} onClick={() => save(true)}>{saving ? "Submitting…" : "Save & submit"}</button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
