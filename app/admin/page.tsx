import Link from "next/link";
import { Megaphone, Inbox, Users, FileSignature, ArrowUpRight, TriangleAlert } from "lucide-react";
import { getInquiries, getBillboards, getClients, getContracts, money, shortDate } from "./_data";
import { computeContractStatus, inquiryStatusLabel } from "@/lib/domain";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [inq, bb, cl, ct] = await Promise.all([getInquiries(), getBillboards(), getClients(), getContracts()]);
  const unavailable = inq.unavailable && bb.unavailable && cl.unavailable && ct.unavailable;

  const inquiries = inq.rows, billboards = bb.rows, clients = cl.rows, contracts = ct.rows;
  const newInq = inquiries.filter(i => i.status === "new").length;
  const availableBb = billboards.filter(b => b.status === "available").length;
  const activeClients = clients.filter(c => c.status === "active").length;
  const activeContracts = contracts.filter(c => computeContractStatus(c.submitted, c.start_date, c.end_date) === "active");
  const pipeline = activeContracts.reduce((s, c) => s + (c.amount || 0), 0);

  // Inquiries per month, last 6 months (inline SVG bar chart)
  const now = new Date();
  const months: { label: string; key: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    months.push({ label: d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }), key: `${d.getUTCFullYear()}-${d.getUTCMonth()}`, count: 0 });
  }
  for (const i of inquiries) {
    const d = new Date(i.created_at);
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
    const m = months.find(x => x.key === key);
    if (m) m.count++;
  }
  const maxCount = Math.max(1, ...months.map(m => m.count));

  // Billboard status breakdown
  const bbStatuses = ["available", "booked", "reserved", "maintenance"] as const;
  const bbColors: Record<string, string> = { available: "#5f9a1f", booked: "#14222a", reserved: "#c9922b", maintenance: "#bd3333" };
  const bbCounts = bbStatuses.map(s => ({ s, n: billboards.filter(b => b.status === s).length }));
  const bbTotal = Math.max(1, billboards.length);

  const stats = [
    { label: "Available billboards", value: `${availableBb}`, sub: `of ${billboards.length} in inventory`, icon: Megaphone, href: "/admin/inventory" },
    { label: "New inquiries", value: `${newInq}`, sub: `${inquiries.length} total received`, icon: Inbox, href: "/admin/inquiries" },
    { label: "Active clients", value: `${activeClients}`, sub: `${clients.length} in directory`, icon: Users, href: "/admin/clients" },
    { label: "Active pipeline", value: money(pipeline), sub: `${activeContracts.length} active contracts`, icon: FileSignature, href: "/admin/contracts" },
  ];

  return (
    <div>
      <header className="admin-head">
        <div>
          <p className="admin-eyebrow">OVERVIEW</p>
          <h1>Dashboard</h1>
        </div>
        <Link href="/admin/inquiries" className="admin-btn">Review inquiries <ArrowUpRight size={16} /></Link>
      </header>

      {unavailable && (
        <div className="admin-alert"><TriangleAlert size={18} /> The database is unavailable right now, so figures below may be empty. Once the D1 tables and seed data are in place, live data appears here automatically.</div>
      )}

      <div className="stat-grid">
        {stats.map(s => (
          <Link key={s.label} href={s.href} className="stat-card">
            <div className="stat-top"><span className="stat-label">{s.label}</span><s.icon size={18} /></div>
            <strong className="stat-value">{s.value}</strong>
            <span className="stat-sub">{s.sub}</span>
          </Link>
        ))}
      </div>

      <div className="admin-cols">
        <section className="admin-panel">
          <div className="panel-head"><h2>Inquiries — last 6 months</h2><span>{inquiries.length} total</span></div>
          <svg viewBox="0 0 520 220" className="bar-chart" role="img" aria-label="Bar chart of inquiries received per month over the last six months">
            {[0, 0.5, 1].map((t, i) => (
              <g key={i}>
                <line x1="42" x2="510" y1={30 + t * 150} y2={30 + t * 150} stroke="#e2e5df" />
                <text x="34" y={34 + t * 150} textAnchor="end" className="chart-tick">{Math.round(maxCount * (1 - t))}</text>
              </g>
            ))}
            {months.map((m, i) => {
              const bw = 52, gap = ((510 - 42) - months.length * bw) / months.length;
              const x = 42 + gap / 2 + i * (bw + gap);
              const h = (m.count / maxCount) * 150;
              return (
                <g key={m.key}>
                  <rect x={x} y={180 - h} width={bw} height={h} fill="#d3ff53" />
                  <rect x={x} y={180 - h} width={bw} height={h} fill="none" stroke="#14222a" />
                  <text x={x + bw / 2} y={198} textAnchor="middle" className="chart-tick">{m.label}</text>
                  {m.count > 0 && <text x={x + bw / 2} y={175 - h} textAnchor="middle" className="chart-val">{m.count}</text>}
                </g>
              );
            })}
          </svg>
        </section>

        <section className="admin-panel">
          <div className="panel-head"><h2>Inventory status</h2><span>{billboards.length} sites</span></div>
          <div className="bb-status">
            {bbCounts.map(({ s, n }) => (
              <div key={s} className="bb-status-row">
                <div className="bb-status-label"><span className="dot" style={{ background: bbColors[s] }} />{s}</div>
                <div className="bb-bar-track"><div className="bb-bar-fill" style={{ width: `${(n / bbTotal) * 100}%`, background: bbColors[s] }} /></div>
                <strong>{n}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="admin-panel">
        <div className="panel-head"><h2>Latest inquiries</h2><Link href="/admin/inquiries" className="panel-link">View all <ArrowUpRight size={14} /></Link></div>
        {inquiries.length === 0 ? (
          <p className="admin-empty">No inquiries yet.</p>
        ) : (
          <div className="table-scroll">
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Format</th><th>City</th><th>Received</th><th>Status</th></tr></thead>
              <tbody>
                {inquiries.slice(0, 6).map(i => (
                  <tr key={i.id}>
                    <td data-label="Name"><strong>{i.name}</strong>{i.company ? <span className="muted"> · {i.company}</span> : null}</td>
                    <td data-label="Format">{i.format}</td>
                    <td data-label="City">{i.city}</td>
                    <td className="nums" data-label="Received">{shortDate(i.created_at)}</td>
                    <td data-label="Status"><span className={`tag tag-${i.status}`}>{inquiryStatusLabel(i.status)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
