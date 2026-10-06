import { requireAdmin } from "../admin-auth";
import { chatGPTSignOutPath } from "../chatgpt-auth";
import { AdminNav } from "./_nav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireAdmin("/admin");
  return (
    <div className="admin-shell">
      <AdminNav email={user.email} signOutHref={chatGPTSignOutPath("/")} />
      <div className="admin-main">{children}</div>
    </div>
  );
}
