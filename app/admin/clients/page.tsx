import { TriangleAlert } from "lucide-react";
import { getClients, getContracts } from "../_data";
import { ClientsTable, type ClientRow } from "./table";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const [cl, ct] = await Promise.all([getClients(), getContracts()]);
  const unavailable = cl.unavailable && ct.unavailable;
  const rows: ClientRow[] = cl.rows.map(c => {
    const owned = ct.rows.filter(k => k.client_id === c.id);
    return {
      id: c.id, name: c.name, company: c.company, email: c.email, phone: c.phone, city: c.city,
      status: c.status, notes: c.notes,
      contracts: owned.length,
      value: owned.reduce((s, k) => s + (k.amount || 0), 0),
    };
  });
  return (
    <div>
      <header className="admin-head">
        <div><p className="admin-eyebrow">DIRECTORY</p><h1>Clients</h1></div>
      </header>
      {unavailable && <div className="admin-alert"><TriangleAlert size={18} /> Client data is unavailable. Add the clients table and seed data to see the directory.</div>}
      <section className="admin-panel">
        <ClientsTable rows={rows} />
      </section>
    </div>
  );
}
