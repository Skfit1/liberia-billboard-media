// Shared domain logic for inquiries, clients and contracts.
// Pure functions only (no server imports) so both API routes and client
// components can import from here.

/* ------------------------------------------------------------------ */
/* Client matching / normalization                                     */
/* ------------------------------------------------------------------ */

export const normalizeEmail = (v: string | null | undefined) =>
  (v || "").trim().toLowerCase();

export const normalizeName = (v: string | null | undefined) =>
  (v || "").trim().toLowerCase().replace(/\s+/g, " ");

// Reduce a phone number to its digits so "+231 770-111 222" and
// "0770111222" can be compared. Keeps the last 9 digits to ignore
// country-code / leading-zero variations.
export const normalizePhone = (v: string | null | undefined) => {
  const digits = (v || "").replace(/\D/g, "");
  return digits.length > 9 ? digits.slice(-9) : digits;
};

export type ClientLike = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
};

/**
 * Find an existing client that matches the given identity, using email,
 * then phone, then name. Returns the matched client id or null.
 */
export function matchClient(
  candidates: ClientLike[],
  identity: { name?: string | null; email?: string | null; phone?: string | null },
): string | null {
  const email = normalizeEmail(identity.email);
  const phone = normalizePhone(identity.phone);
  const name = normalizeName(identity.name);

  if (email) {
    const byEmail = candidates.find((c) => normalizeEmail(c.email) === email);
    if (byEmail) return byEmail.id;
  }
  if (phone) {
    const byPhone = candidates.find((c) => normalizePhone(c.phone) === phone);
    if (byPhone) return byPhone.id;
  }
  if (name) {
    const byName = candidates.find((c) => normalizeName(c.name) === name);
    if (byName) return byName.id;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Inquiry statuses                                                    */
/* ------------------------------------------------------------------ */

export const INQUIRY_STATUSES = ["new", "quoted", "contracted"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const inquiryStatusLabel = (s: string): string =>
  ({ new: "New", quoted: "Quoted", contracted: "Contracted" }[s] ?? s);

/* ------------------------------------------------------------------ */
/* Contract statuses (derived from submitted flag + dates)             */
/* ------------------------------------------------------------------ */

export const CONTRACT_STATUSES = ["pending", "coming_soon", "active", "expired"] as const;
export type ContractStatus = (typeof CONTRACT_STATUSES)[number];

export const contractStatusLabel = (s: string): string =>
  ({ pending: "Pending", coming_soon: "Coming Soon", active: "Active", expired: "Expired" }[s] ?? s);

// Parse a YYYY-MM-DD string as a UTC day boundary (ms).
function dayMs(dateStr: string | null | undefined): number | null {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const t = Date.parse(dateStr + "T00:00:00Z");
  return Number.isNaN(t) ? null : t;
}

/**
 * Compute a contract's effective status.
 * - Not submitted -> "pending".
 * - Submitted: derived from today vs start/end.
 *   start <= today < end  -> active
 *   start > today         -> coming_soon
 *   today >= end          -> expired
 */
export function computeContractStatus(
  submitted: number | boolean | null | undefined,
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  now: number = Date.now(),
): ContractStatus {
  const isSubmitted = submitted === 1 || submitted === true;
  if (!isSubmitted) return "pending";

  // Compare on whole-day (UTC) boundaries.
  const today = Date.parse(new Date(now).toISOString().slice(0, 10) + "T00:00:00Z");
  const start = dayMs(startDate);
  const end = dayMs(endDate);

  if (start != null && start > today) return "coming_soon";
  if (end != null && today >= end) return "expired";
  return "active";
}
