import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { getAdminApiUser } from "@/app/admin-auth";

const STATUSES = ["prospect", "active", "past"];

type Body = Record<string, unknown>;
const str = (d: Body, k: string, max: number) =>
  typeof d[k] === "string" ? (d[k] as string).trim().slice(0, max) : "";

export async function POST(request: Request) {
  if (!(await getAdminApiUser())) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const d = (raw && typeof raw === "object" ? raw : {}) as Body;

  const name = str(d, "name", 120),
    company = str(d, "company", 120),
    email = str(d, "email", 160),
    phone = str(d, "phone", 40),
    city = str(d, "city", 80),
    notes = str(d, "notes", 500);
  let status = str(d, "status", 20) || "prospect";
  if (!STATUSES.includes(status)) status = "prospect";

  // Name is required; email is required because the clients table stores it NOT NULL.
  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ error: "A client needs a name and a valid email address." }, { status: 400 });

  try {
    if (!env.DB) throw new Error("D1 unavailable");
    await env.DB.prepare(
      "INSERT INTO clients (id, name, company, email, phone, city, status, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
      .bind(
        crypto.randomUUID(),
        name,
        company || null,
        email,
        phone || null,
        city || null,
        status,
        notes || null,
        Date.now(),
      )
      .run();
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Create client failed", error);
    return NextResponse.json({ error: "Could not save the client." }, { status: 503 });
  }
}
