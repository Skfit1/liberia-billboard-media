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

export async function POST(request: Request) {
  if (!(await getAdminApiUser())) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const d = (raw && typeof raw === "object" ? raw : {}) as Body;

  const clientId = str(d, "client_id", 60);
  const billboardId = str(d, "billboard_id", 60);
  const inquiryId = str(d, "inquiry_id", 60);
  const campaignName = str(d, "campaign_name", 160);
  const startDate = str(d, "start_date", 30);
  const endDate = str(d, "end_date", 30);
  const terms = str(d, "terms", 1000);
  const amount = num(d, "amount");
  const submit = d["submit"] === true || d["submit"] === "true" || d["submit"] === 1;

  if (!clientId || !campaignName || !isDate(startDate) || !isDate(endDate))
    return NextResponse.json({ error: "Please complete the required contract fields." }, { status: 400 });
  if (endDate < startDate)
    return NextResponse.json({ error: "End date must be on or after the start date." }, { status: 400 });

  try {
    if (!env.DB) throw new Error("D1 unavailable");

    // A contract may only be started from an inquiry that is currently "quoted".
    if (inquiryId) {
      const inq = await env.DB.prepare("SELECT status FROM inquiries WHERE id=?").bind(inquiryId).first<{ status: string }>();
      if (!inq) return NextResponse.json({ error: "Linked inquiry not found." }, { status: 404 });
      if (inq.status !== "quoted")
        return NextResponse.json({ error: "A contract can only be started from a quoted inquiry." }, { status: 400 });
    }

    const submitted = submit ? 1 : 0;
    const status = computeContractStatus(submitted, startDate, endDate);

    await env.DB.prepare(
      "INSERT INTO contracts (id, client_id, billboard_id, inquiry_id, campaign_name, start_date, end_date, amount, terms, submitted, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
      .bind(
        crypto.randomUUID(),
        clientId,
        billboardId || null,
        inquiryId || null,
        campaignName,
        startDate,
        endDate,
        amount,
        terms || null,
        submitted,
        status,
        Date.now(),
      )
      .run();

    // Starting a contract from a quoted inquiry moves that inquiry to "contracted".
    if (inquiryId) {
      await env.DB.prepare("UPDATE inquiries SET status='contracted' WHERE id=?").bind(inquiryId).run();
    }

    return NextResponse.json({ ok: true, status }, { status: 201 });
  } catch (error) {
    console.error("Create contract failed", error);
    return NextResponse.json({ error: "Could not save the contract." }, { status: 503 });
  }
}
