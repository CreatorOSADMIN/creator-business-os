"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogoutButton } from "./logout-button";
import { DashboardIcon, CreatorsIcon, AnalyticsIcon, AnnouncementsIcon, MenuIcon, CloseIcon } from "./nav-icons";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: DashboardIcon, exact: true },
  { href: "/admin/creators", label: "Creators", icon: CreatorsIcon },
  { href: "/admin/analytics", label: "Analytics", icon: AnalyticsIcon },
  { href: "/admin/announcements", label: "Annunci", icon: AnnouncementsIcon },
] as const;

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--accent)] font-mono-label text-[11px] font-semibold text-[#08100e]">
        OS
      </span>
      <span className="font-display text-base font-medium tracking-tight text-[var(--foreground)]">CreatorOS</span>
    </div>
  );
}

function NavLink({
  href,
  label,
  Icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  Icon: typeof DashboardIcon;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
        active
          ? "bg-[var(--surface-2)] text-[var(--foreground)]"
          : "text-[var(--ink-muted)] hover:bg-[var(--surface-2)]/60 hover:text-[var(--foreground)]"
      }`}
    >
      <span
        className={`absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-[var(--accent)] transition-opacity duration-150 ${
          active ? "opacity-100" : "opacity-0"
        }`}
      />
      <Icon className={active ? "text-[var(--accent)]" : "text-[var(--ink-muted)] group-hover:text-[var(--foreground)]"} />
      <span>{label}</span>
    </Link>
  );
}

function UserProfile({ email }: { email: string }) {
  const initial = email.trim().charAt(0).toUpperCase() || "A";
  return (
    <div className="border-t border-[var(--border-subtle)] p-4">
      <div className="flex items-center gap-3 rounded-lg px-1 py-1.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-xs font-semibold text-[var(--foreground)]">
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-[var(--foreground)]">{email}</p>
          <p className="text-[11px] text-[var(--ink-muted)]">Administrator</p>
        </div>
      </div>
      <LogoutButton />
    </div>
  );
}

export function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile topbar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--surface-dark)] px-4 py-3 md:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Chiudi menu" : "Apri menu"}
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--ink-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {open && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-[57px] border-b border-[var(--border-subtle)] bg-[var(--surface-dark)] px-3 py-3 shadow-[var(--shadow-lg)]">
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  Icon={item.icon}
                  active={isActive(pathname, item.href, "exact" in item ? item.exact : false)}
                  onNavigate={() => setOpen(false)}
                />
              ))}
            </nav>
            <UserProfile email={email} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-[var(--border-subtle)] bg-[var(--surface-dark)] md:flex">
        <div className="flex h-16 shrink-0 items-center border-b border-[var(--border-subtle)] px-5">
          <Brand />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5 text-sm">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              Icon={item.icon}
              active={isActive(pathname, item.href, "exact" in item ? item.exact : false)}
            />
          ))}
        </nav>
        <UserProfile email={email} />
      </aside>
    </>
  );
}
