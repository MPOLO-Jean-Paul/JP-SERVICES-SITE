import type { Metadata } from "next";
import { requireAdmin } from "@/server/auth/session";
import { logoutAction } from "@/server/actions/auth-logout";
import { AdminSidebar } from "@/components/admin/sidebar";

export const metadata: Metadata = { title: { default: "Administration", template: "%s | Administration JP-Services" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <AdminSidebar user={{ displayName: user.displayName, email: user.email, photoProfil: user.photoProfil }} logoutAction={logoutAction} />
      <main id="main-content" className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
