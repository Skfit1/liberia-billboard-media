import { notFound } from "next/navigation";
import { requireChatGPTUser, getChatGPTUser, type ChatGPTUser } from "./chatgpt-auth";

// The single account allowed to reach the admin dashboard.
export const ADMIN_EMAIL = "siafakonneh@gmail.com";

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && email.trim().toLowerCase() === ADMIN_EMAIL;
}

/**
 * Guard for admin API route handlers / mutations. Returns the admin user when
 * the request is authenticated as the admin, otherwise null (caller returns 403).
 */
export async function getAdminApiUser(): Promise<ChatGPTUser | null> {
  const user = await getChatGPTUser();
  if (!user || !isAdminEmail(user.email)) return null;
  return user;
}

/**
 * Server-side guard for every admin page/layout.
 * 1. Forces ChatGPT sign-in (redirect) when the visitor is anonymous.
 * 2. Renders a 404 for any signed-in visitor who is not the admin, so the
 *    admin surface is never revealed to other accounts.
 */
export async function requireAdmin(returnTo: string): Promise<ChatGPTUser> {
  const user = await requireChatGPTUser(returnTo);
  if (!isAdminEmail(user.email)) notFound();
  return user;
}
