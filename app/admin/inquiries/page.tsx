import { TriangleAlert } from "lucide-react";
import { getInquiries, getClients, getBillboards } from "../_data";
import { InquiriesTable } from "./table";

export const dynamic = "force-dynamic";

export default async function InquiriesPage() {
  const [inq, cl, bb] = await Promise.all([getInquiries(), getClients(), getBillboards()]);
  const clients = cl.rows.map(c => ({ id: c.id, name: c.name, company: c.company }));
  const billboards = bb.rows.map(b => ({ id: b.id, code: b.code, name: b.name }));
  return (
    <div>
      <header className="admin-head">
        <div><p className="admin-eyebrow">TRACK</p><h1>Inquiries</h1></div>
      </header>
      {inq.unavailable && <div className="admin-alert"><TriangleAlert size={18} /> The inbox is unavailable right now. Please try again later.</div>}
      <section className="admin-panel">
        <InquiriesTable rows={inq.rows} clients={clients} billboards={billboards} />
      </section>
    </div>
  );
}
