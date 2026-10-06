import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { getAdminApiUser } from "@/app/admin-auth";
import { computeContractStatus } from "@/lib/domain";

type Body = Record<string, unknown>;
const str = (d: Body, k: string, max: number) =>
  typeof d[k] === "string" ? (d[k] as string).trim().slice(0, max) : "";
const num = (d: Body, k: string): number | null => {
  const v = d[k];
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : null;
};
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminApiUser())) return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  const { id } = await params;

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const d = (raw && typeof raw === "object" ? raw : {}) as Body;

  const billboardId = str(d, "billboard_id", 60);
  const campaignName = str(d, "campaign_name", 160);
  const startDate = str(d, "start_date", 30);
  const endDate = str(d, "end_date", 30);
  const terms = str(d, "terms", 1000);
  const amount = num(d, "amount");

  if (!campaignName || !isDate(startDate) || !isDate(endDate))
    return NextResponse.json({ error: "Please complete the required contract fields." }, { status: 400 });
  if (endDate < startDate)
    return NextResponse.json({ error: "End date must be on or after the start date." }, { status: 400 });

  try {
    if (!env.DB) throw new Error("D1 unavailable");
    const current = await env.DB.prepare("SELECT submitted FROM contracts WHERE id=?").bind(id).first<{ submitted: number }>();
    if (!current) return NextResponse.json({ error: "Contract not found." }, { status: 404 });

    // Submitting is a one-way transition (Pending -> submitted). Once submitted,
    // it stays submitted and the effective status is date-derived.
    const submitted = d["submit"] === true || d["submit"] === "true" || d["submit"] === 1 ? 1 : current.submitted ? 1 : 0;
    const status = computeContractStatus(submitted, startDate, endDate);

    await env.DB.prepare(
      "UPDATE contracts SET billboard_id=?, campaign_name=?, start_date=?, end_date=?, amount=?, terms=?, submitted=?, status=? WHERE id=?",
    )
      .bind(billboardId || null, campaignName, startDate, endDate, amount, terms || null, submitted, status, id)
      .run();
    return NextResponse.json({ ok: true, status });
  } catch (error) {
    console.error("Update contract failed", error);
    return NextResponse.json({ error: "Could not update the contract." }, { status: 503 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminApiUser())) return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  const { id } = await params;
  try {
    if (!env.DB) throw new Error("D1 unavailable");
    await env.DB.prepare("DELETE FROM contracts WHERE id=?").bind(id).run();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete contract failed", error);
    return NextResponse.json({ error: "Could not delete the contract." }, { status: 503 });
  }
}
