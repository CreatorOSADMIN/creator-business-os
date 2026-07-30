import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/session";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <AdminNav email={session.email} />
      <div className="md:pl-64">
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
