"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Mail, Phone, FileSignature } from "lucide-react";
import type { Inquiry } from "../_data";
import { inquiryStatusLabel } from "@/lib/domain";
import { ContractForm, type ClientOpt, type BillboardOpt } from "../_contract-form";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

const shortDate = (ms: number) => new Date(ms).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
const statuses = ["all", "new", "quoted", "contracted"] as const;

export function InquiriesTable({
  rows, clients, billboards,
}: {
  rows: Inquiry[];
  clients: ClientOpt[];
  billboards: BillboardOpt[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState<(typeof statuses)[number]>("all");
  const [q, setQ] = useState("");

  // Quote/detail modal state
  const [active, setActive] = useState<Inquiry | null>(null);
  const [quoteAmount, setQuoteAmount] = useState("");
  const [quoteDetails, setQuoteDetails] = useState("");
  const [quoted, setQuoted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Contract form state
  const [contractFor, setContractFor] = useState<Inquiry | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter(i =>
      (status === "all" || i.status === status) &&
      (!term || [i.name, i.company, i.email, i.city].some(v => (v || "").toLowerCase().includes(term)))
    );
  }, [rows, status, q]);

  function openInquiry(i: Inquiry) {
    setActive(i);
    setQuoteAmount(i.quote_amount != null ? String(i.quote_amount) : "");
    setQuoteDetails(i.quote_details ?? "");
    setQuoted(i.status === "quoted" || i.status === "contracted");
    setError(null);
  }

  async function saveQuote(e: React.FormEvent) {
    e.preventDefault();
    if (!active) return;
    setSaving(true); setError(null);
    try {
      const res = await fetch(`/api/admin/inquiries/${active.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quote_amount: quoteAmount, quote_details: quoteDetails, quoted }),
      });
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error || "Could not save."); }
      setActive(null);
      router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save."); }
    finally { setSaving(false); }
  }

  function startContract(i: Inquiry) { setContractFor(i); }

  return (
    <>
      <div className="admin-toolbar">
        <div className="seg">
          {statuses.map(s => (
            <button key={s} className={status === s ? "seg-btn active" : "seg-btn"} onClick={() => setStatus(s)}>{s === "all" ? "all" : inquiryStatusLabel(s)}</button>
          ))}
        </div>
        <div className="toolbar-right">
          <div className="admin-search"><Search size={16} /><input placeholder="Search name, company, email…" value={q} onChange={e => setQ(e.target.value)} /></div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="admin-empty">No inquiries match these filters.</p>
      ) : (
        <div className="table-scroll">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Campaign</th><th>City</th><th>Received</th><th>Status</th><th className="col-actions">Contract</th></tr></thead>
            <tbody>
              {filtered.map(i => (
                <tr key={i.id} className="clickable" onClick={() => openInquiry(i)}>
                  <td data-label="Name"><strong>{i.name}</strong>{i.company ? <span className="muted"> · {i.company}</span> : null}</td>
                  <td data-label="Campaign">{i.format} · {i.duration}</td>
                  <td data-label="City">{i.city}</td>
                  <td className="nums" data-label="Received">{shortDate(i.created_at)}</td>
                  <td data-label="Status"><span className={`tag tag-${i.status}`}>{inquiryStatusLabel(i.status)}</span></td>
                  <td data-label="Contract" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="admin-btn sm"
                      disabled={i.status !== "quoted"}
                      title={i.status === "quoted" ? "Start a contract from this quote" : "Only available once the inquiry is Quoted"}
                      onClick={() => startContract(i)}
                    >
                      <FileSignature size={14} /> Start contract
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="admin-count">{filtered.length} of {rows.length} inquiries</p>

      {/* Inquiry detail + quote modal */}
      <Dialog open={active !== null} onOpenChange={(o) => { if (!o) setActive(null); }}>
        <DialogContent className="admin-dialog">
          {active && (
            <>
              <DialogHeader><DialogTitle>{active.name}{active.company ? ` · ${active.company}` : ""}</DialogTitle></DialogHeader>
              <div className="inq-detail">
                <div className="detail-contact">
                  <a href={`mailto:${active.email}`}><Mail size={15} /> {active.email}</a>
                  <a href={`tel:${active.phone}`}><Phone size={15} /> {active.phone}</a>
                </div>
                <p className="detail-meta">{active.format} · {active.city} · {active.duration}{active.start_date ? ` · from ${active.start_date}` : ""}</p>
                {active.message && <p className="detail-msg">{active.message}</p>}
                <p className="detail-status">Status: <span className={`tag tag-${active.status}`}>{inquiryStatusLabel(active.status)}</span></p>
              </div>
              <form className="admin-form" onSubmit={saveQuote}>
                <div className="admin-form-grid">
                  <label className="span-2">Quote amount (USD)
                    <input type="number" min="0" value={quoteAmount} onChange={e => setQuoteAmount(e.target.value)} placeholder="e.g. 1500" />
                  </label>
                  <label className="span-2">Quote details / notes
                    <textarea rows={3} value={quoteDetails} onChange={e => setQuoteDetails(e.target.value)} placeholder="Sites, duration, what the quote covers…" />
                  </label>
                </div>
                <label className="admin-check">
                  <Checkbox checked={quoted} onCheckedChange={(v) => setQuoted(v === true)} disabled={active.status === "contracted"} />
                  <span>Quoted — mark this inquiry as quoted when saved</span>
                </label>
                {error && <p className="admin-form-error">{error}</p>}
                <DialogFooter>
                  <button type="button" className="admin-btn ghost" onClick={() => setActive(null)}>Cancel</button>
                  <button type="submit" className="admin-btn" disabled={saving}>{saving ? "Saving…" : "Save inquiry"}</button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Start-contract form */}
      {contractFor && (
        <ContractForm
          open={contractFor !== null}
          onOpenChange={(o) => { if (!o) setContractFor(null); }}
          clients={clients}
          billboards={billboards}
          initial={{
            inquiryId: contractFor.id,
            clientId: contractFor.client_id ?? undefined,
            campaignName: `${contractFor.company || contractFor.name} — ${contractFor.format}`,
            startDate: contractFor.start_date ?? undefined,
            amount: contractFor.quote_amount,
          }}
        />
      )}
    </>
  );
}
