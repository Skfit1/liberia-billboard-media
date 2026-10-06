import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { getAdminApiUser } from "@/app/admin-auth";
import { INQUIRY_STATUSES } from "@/lib/domain";

type Body = Record<string, unknown>;

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

  // Quote fields.
  const quoteAmount = (() => {
    const v = d["quote_amount"];
    if (v === "" || v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isFinite(n) ? Math.round(n) : null;
  })();
  const quoteDetails =
    typeof d["quote_details"] === "string" ? (d["quote_details"] as string).trim().slice(0, 1000) : null;

  // "Quoted" checkbox drives the status transition. We never downgrade a
  // contracted inquiry from here.
  const quoted = d["quoted"] === true || d["quoted"] === "true" || d["quoted"] === 1;
  let status = typeof d["status"] === "string" ? (d["status"] as string) : "";
  if (!INQUIRY_STATUSES.includes(status as (typeof INQUIRY_STATUSES)[number])) status = "";

  try {
    if (!env.DB) throw new Error("D1 unavailable");
    const current = await env.DB.prepare("SELECT status FROM inquiries WHERE id=?").bind(id).first<{ status: string }>();
    if (!current) return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });

    // Resolve the next status: explicit status wins, else the Quoted checkbox
    // promotes New -> Quoted. Contracted inquiries are left untouched.
    let next = current.status || "new";
    if (status) next = status;
    else if (quoted && next !== "contracted") next = "quoted";

    await env.DB.prepare("UPDATE inquiries SET quote_amount=?, quote_details=?, status=? WHERE id=?")
      .bind(quoteAmount, quoteDetails, next, id)
      .run();
    return NextResponse.json({ ok: true, status: next });
  } catch (error) {
    console.error("Update inquiry failed", error);
    return NextResponse.json({ error: "Could not update the inquiry." }, { status: 503 });
  }
}
