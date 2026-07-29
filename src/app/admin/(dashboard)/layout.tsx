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
    <div className="flex min-h-screen flex-col bg-[var(--surface)] sm:flex-row">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-white px-4 py-3 sm:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-[var(--foreground)] font-mono-label text-[11px] font-semibold text-white">
            OS
          </span>
          <span className="font-display text-base font-medium">CreatorOS</span>
        </div>
        <LogoutButton />
      </div>
      <nav className="flex gap-1 overflow-x-auto border-b border-[var(--border-subtle)] bg-white px-3 py-2 text-sm sm:hidden">
        <Link
          href="/admin"
          className="whitespace-nowrap rounded-lg px-3 py-2 font-medium text-[var(--foreground)] hover:bg-[var(--accent-soft)]"
        >
          Dashboard
        </Link>
        <Link
          href="/admin/creators"
          className="whitespace-nowrap rounded-lg px-3 py-2 font-medium text-[var(--foreground)] hover:bg-[var(--accent-soft)]"
        >
          Creators
        </Link>
        <Link
          href="/admin/analytics"
          className="whitespace-nowrap rounded-lg px-3 py-2 font-medium text-[var(--foreground)] hover:bg-[var(--accent-soft)]"
        >
          Analytics
        </Link>
        <Link
          href="/admin/announcements"
          className="whitespace-nowrap rounded-lg px-3 py-2 font-medium text-[var(--foreground)] hover:bg-[var(--accent-soft)]"
        >
          Annunci
        </Link>
      </nav>

      {/* Desktop sidebar */}
      <aside className="relative hidden w-60 shrink-0 border-r border-[var(--border-subtle)] bg-white sm:block">
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
          <Link
            href="/admin/analytics"
            className="block rounded-lg px-3 py-2 font-medium text-[var(--foreground)] hover:bg-[var(--accent-soft)]"
          >
            Analytics
          </Link>
          <Link
            href="/admin/announcements"
            className="block rounded-lg px-3 py-2 font-medium text-[var(--foreground)] hover:bg-[var(--accent-soft)]"
          >
            Annunci
          </Link>
        </nav>
        <div className="absolute bottom-0 w-60 border-t border-[var(--border-subtle)] p-4">
          <p className="truncate text-xs text-[var(--ink-muted)]">{session.email}</p>
          <LogoutButton />
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
