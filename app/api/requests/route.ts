import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { matchClient, type ClientLike } from "@/lib/domain";

const formats = ["Digital billboard", "Static billboard", "Help me choose"];
const durations = ["2 weeks", "1 month", "3 months", "6 months", "Other / flexible"];

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Please check your details and try again." }, { status: 400 });
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    return NextResponse.json({ error: "Please check your details and try again." }, { status: 400 });

  const data = raw as Record<string, unknown>;
  const field = (key: string, max: number) =>
    typeof data[key] === "string" ? (data[key] as string).trim().slice(0, max) : "";
  const name = field("name", 100),
    company = field("company", 120),
    email = field("email", 200),
    phone = field("phone", 50),
    city = field("city", 120),
    format = field("format", 40),
    startDate = field("startDate", 30),
    duration = field("duration", 30),
    message = field("message", 1000);

  if (
    !name ||
    !phone ||
    !city ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !formats.includes(format) ||
    !durations.includes(duration) ||
    (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate))
  )
    return NextResponse.json({ error: "Please complete the required fields with valid details." }, { status: 400 });

  try {
    if (!env.DB) throw new Error("D1 unavailable");
    const now = Date.now();

    // 1) Resolve the client: match an existing one, else create a new client.
    let clientId: string;
    const existing = await env.DB.prepare("SELECT id, name, email, phone FROM clients").all<ClientLike>();
    const matched = matchClient(existing.results || [], { name, email, phone });
    if (matched) {
      clientId = matched;
    } else {
      clientId = crypto.randomUUID();
      await env.DB.prepare(
        "INSERT INTO clients (id, name, company, email, phone, city, status, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, 'prospect', ?, ?)",
      )
        .bind(clientId, name, company || null, email, phone, city, "Created from a website inquiry.", now)
        .run();
    }

    // 2) Persist the inquiry linked to the resolved client.
    await env.DB.prepare(
      "INSERT INTO inquiries (id, name, company, email, phone, city, format, start_date, duration, message, client_id, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)",
    )
      .bind(crypto.randomUUID(), name, company || null, email, phone, city, format, startDate || null, duration, message || null, clientId, now)
      .run();

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Could not save billboard inquiry", error);
    return NextResponse.json(
      { error: "We couldn’t send your request right now. Please try again shortly." },
      { status: 503 },
    );
  }
}
