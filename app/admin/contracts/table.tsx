"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Pencil, Trash2, Send } from "lucide-react";
import type { Contract } from "../_data";
import { computeContractStatus, contractStatusLabel, CONTRACT_STATUSES } from "@/lib/domain";
import { ContractForm, type ClientOpt, type BillboardOpt } from "../_contract-form";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type ContractRow = Contract & { client_name: string; billboard_label: string };

const money = (n: number | null) => (n == null ? "—" : "$" + Math.round(n).toLocaleString("en-US"));
const filters = ["all", ...CONTRACT_STATUSES] as const;

export function ContractsTable({
  rows, clients, billboards,
}: {
  rows: ContractRow[];
  clients: ClientOpt[];
  billboards: BillboardOpt[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [q, setQ] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ContractRow | null>(null);
  const [deleting, setDeleting] = useState<ContractRow | null>(null);
  const [busy, setBusy] = useState(false);

  // Derive the effective status for each row on render so it stays correct as dates pass.
  const withStatus = useMemo(
    () => rows.map(c => ({ ...c, effective: computeContractStatus(c.submitted, c.start_date, c.end_date) })),
    [rows],
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return withStatus.filter(c =>
      (filter === "all" || c.effective === filter) &&
      (!term || [c.campaign_name, c.client_name, c.billboard_label].some(v => (v || "").toLowerCase().includes(term)))
    );
  }, [withStatus, filter, q]);

  function openNew() { setEditing(null); setFormOpen(true); }
  function openEdit(c: ContractRow) { setEditing(c); setFormOpen(true); }

  async function submitContract(c: ContractRow) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/contracts/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billboard_id: c.billboard_id ?? "", campaign_name: c.campaign_name,
          start_date: c.start_date, end_date: c.end_date, amount: c.amount, terms: c.terms ?? "",
          submit: true,
        }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch { /* no-op */ }
    finally { setBusy(false); }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/contracts/${deleting.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setDeleting(null);
      router.refresh();
    } catch { /* no-op */ }
    finally { setBusy(false); }
  }

  return (
    <>
      <div className="admin-toolbar">
        <div className="seg">
          {filters.map(s => (
            <button key={s} className={filter === s ? "seg-btn active" : "seg-btn"} onClick={() => setFilter(s)}>{s === "all" ? "all" : contractStatusLabel(s)}</button>
          ))}
        </div>
        <div className="toolbar-right">
          <div className="admin-search"><Search size={16} /><input placeholder="Search campaign, client…" value={q} onChange={e => setQ(e.target.value)} /></div>
          <button className="admin-btn" onClick={openNew}><Plus size={16} /> New contract</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="admin-empty">No contracts match these filters.</p>
      ) : (
        <div className="table-scroll">
          <table className="admin-table">
            <thead><tr><th>Campaign</th><th>Client</th><th>Billboard</th><th>Dates</th><th className="nums">Value</th><th>Status</th><th className="col-actions">Actions</th></tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td data-label="Campaign"><strong>{c.campaign_name}</strong></td>
                  <td data-label="Client">{c.client_name}</td>
                  <td data-label="Billboard">{c.billboard_label}</td>
                  <td className="nums" data-label="Dates">{c.start_date} → {c.end_date}</td>
                  <td className="nums" data-label="Value">{money(c.amount)}</td>
                  <td data-label="Status"><span className={`tag tag-c-${c.effective}`}>{contractStatusLabel(c.effective)}</span></td>
                  <td data-label="Actions">
                    <div className="row-actions">
                      {c.effective === "pending" && (
                        <button className="icon-btn" title="Submit contract" disabled={busy} onClick={() => submitContract(c)}><Send size={15} /></button>
                      )}
                      <button className="icon-btn" title="Edit" onClick={() => openEdit(c)}><Pencil size={15} /></button>
                      <button className="icon-btn danger" title="Delete" onClick={() => setDeleting(c)}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="admin-count">{filtered.length} of {rows.length} contracts</p>

      <ContractForm
        open={formOpen}
        onOpenChange={setFormOpen}
        clients={clients}
        billboards={billboards}
        initial={editing ? {
          contractId: editing.id,
          clientId: editing.client_id,
          billboardId: editing.billboard_id ?? undefined,
          campaignName: editing.campaign_name,
          startDate: editing.start_date,
          endDate: editing.end_date,
          amount: editing.amount,
          terms: editing.terms ?? undefined,
          submitted: editing.submitted,
        } : {}}
      />

      <AlertDialog open={deleting !== null} onOpenChange={(o) => { if (!o) setDeleting(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this contract?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting ? `“${deleting.campaign_name}” will be permanently removed. This cannot be undone.` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); confirmDelete(); }} disabled={busy}>
              {busy ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
