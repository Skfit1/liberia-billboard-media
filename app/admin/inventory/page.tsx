import { TriangleAlert } from "lucide-react";
import { getBillboards } from "../_data";
import { InventoryTable } from "./table";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const { rows, unavailable } = await getBillboards();
  return (
    <div>
      <header className="admin-head">
        <div><p className="admin-eyebrow">MANAGE</p><h1>Billboard inventory</h1></div>
      </header>
      {unavailable && <div className="admin-alert"><TriangleAlert size={18} /> Inventory data is unavailable. Add the billboards table and seed data to see live sites.</div>}
      <section className="admin-panel">
        <InventoryTable rows={rows} />
      </section>
    </div>
  );
}
