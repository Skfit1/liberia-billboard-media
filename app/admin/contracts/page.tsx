import { TriangleAlert } from "lucide-react";
import { getContracts, getClients, getBillboards } from "../_data";
import { ContractsTable, type ContractRow } from "./table";

export const dynamic = "force-dynamic";

export default async function ContractsPage() {
  const [ct, cl, bb] = await Promise.all([getContracts(), getClients(), getBillboards()]);
  const unavailable = ct.unavailable && cl.unavailable;

  const clientName = new Map(cl.rows.map(c => [c.id, c.name]));
  const billboardLabel = new Map(bb.rows.map(b => [b.id, `${b.code} · ${b.name}`]));

  const rows: ContractRow[] = ct.rows.map(c => ({
    ...c,
    client_name: clientName.get(c.client_id) ?? "—",
    billboard_label: c.billboard_id ? billboardLabel.get(c.billboard_id) ?? "—" : "—",
  }));

  const clients = cl.rows.map(c => ({ id: c.id, name: c.name, company: c.company }));
  const billboards = bb.rows.map(b => ({ id: b.id, code: b.code, name: b.name }));

  return (
    <div>
      <header className="admin-head">
        <div><p className="admin-eyebrow">MANAGE</p><h1>Contracts</h1></div>
      </header>
      {unavailable && <div className="admin-alert"><TriangleAlert size={18} /> Contract data is unavailable right now. Please try again later.</div>}
      <section className="admin-panel">
        <ContractsTable rows={rows} clients={clients} billboards={billboards} />
      </section>
    </div>
  );
}
