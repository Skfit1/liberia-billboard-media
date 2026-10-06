import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { getAdminApiUser } from "@/app/admin-auth";

const FORMATS = ["Digital billboard", "Static billboard"];
const STATUSES = ["available", "booked", "reserved", "maintenance"];

type Body = Record<string, unknown>;
const str = (d: Body, k: string, max: number) =>
  typeof d[k] === "string" ? (d[k] as string).trim().slice(0, max) : "";
const num = (d: Body, k: string): number | null => {
  const v = d[k];
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : null;
};

export async function POST(request: Request) {
  if (!(await getAdminApiUser())) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const d = (raw && typeof raw === "object" ? raw : {}) as Body;

  const code = str(d, "code", 40),
    name = str(d, "name", 120),
    city = str(d, "city", 80),
    location = str(d, "location", 160),
    format = str(d, "format", 40),
    facing = str(d, "facing", 40),
    notes = str(d, "notes", 500);
  let status = str(d, "status", 20) || "available";
  if (!FORMATS.includes(format) || !code || !name || !city || !location)
    return NextResponse.json({ error: "Please complete the required billboard fields." }, { status: 400 });
  if (!STATUSES.includes(status)) status = "available";

  try {
    if (!env.DB) throw new Error("D1 unavailable");
    await env.DB.prepare(
      "INSERT INTO billboards (id, code, name, city, location, format, width_ft, height_ft, facing, monthly_rate, status, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
      .bind(
        crypto.randomUUID(),
        code,
        name,
        city,
        location,
        format,
        num(d, "width_ft"),
        num(d, "height_ft"),
        facing || null,
        num(d, "monthly_rate"),
        status,
        notes || null,
        Date.now(),
      )
      .run();
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Create billboard failed", error);
    return NextResponse.json({ error: "Could not save the billboard." }, { status: 503 });
  }
}
