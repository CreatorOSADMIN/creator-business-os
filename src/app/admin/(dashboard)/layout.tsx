import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/session";
import { LogoutButton } from "@/components/admin/logout-button";

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
    <div className="flex min-h-screen bg-[var(--surface)]">
      <aside className="hidden w-60 shrink-0 border-r border-[var(--border-subtle)] bg-white sm:block">
        <div className="flex h-16 items-center gap-2 border-b border-[var(--border-subtle)] px-6">
          <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-[var(--foreground)] font-mono-label text-[11px] font-semibold text-white">
            OS
          </span>
          <span className="font-display text-base font-medium">CreatorOS</span>
        </div>
        <nav className="space-y-1 px-3 py-4 text-sm">
          <Link
            href="/admin"
            className="block rounded-lg px-3 py-2 font-medium text-[var(--foreground)] hover:bg-[var(--accent-soft)]"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/creators"
            className="block rounded-lg px-3 py-2 font-medium text-[var(--foreground)] hover:bg-[var(--accent-soft)]"
          >
            Creators
          </Link>
        </nav>
        <div className="absolute bottom-0 w-60 border-t border-[var(--border-subtle)] p-4">
          <p className="truncate text-xs text-[var(--ink-muted)]">{session.email}</p>
          <LogoutButton />
        </div>
      </aside>
      <div className="flex-1">
        <main className="mx-auto max-w-6xl px-6 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
