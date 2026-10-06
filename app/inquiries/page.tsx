import { redirect } from "next/navigation";

// The inbox moved into the admin console. Preserve the old link.
export default function LegacyInquiries() {
  redirect("/admin/inquiries");
}
