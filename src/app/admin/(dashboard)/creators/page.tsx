"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import {
  CREATOR_STATUSES,
  STATUS_LABELS,
  STATUS_COLORS,
  PLATFORMS,
  COUNTRIES,
  AUDIENCE_SIZES,
} from "@/lib/constants";
import type { CreatorStatusValue } from "@/lib/constants";

interface CreatorRow {
  id: string;
  fullName: string;
  creatorHandle: string;
  email: string;
  country: string;
  platforms: string[];
  audienceSize: string;
  status: string;
  createdAt: string;
  emailVerifiedAt: string | null;
}

const SORT_OPTIONS = [
  { value: "createdAt", label: "Registration date" },
  { value: "audienceSize", label: "Audience size" },
  { value: "fullName", label: "Name" },
  { value: "status", label: "Status" },
] as const;

function audienceLabel(value: string) {
  return AUDIENCE_SIZES.find((a) => a.value === value)?.label ?? value;
}

function gmailComposeUrl(email: string) {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: email,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

export default function AdminCreatorsPage() {
  const [creators, setCreators] = useState<CreatorRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [platform, setPlatform] = useState("");
  const [country, setCountry] = useState("");
  const [audienceSize, setAudienceSize] = useState("");
  const [emailVerified, setEmailVerified] = useState("");
  const [sortBy, setSortBy] = useState<(typeof SORT_OPTIONS)[number]["value"]>("createdAt");
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      search,
      status,
      platform,
      country,
      audienceSize,
      emailVerified,
      sortBy,
      sort,
      page: String(page),
      pageSize: String(pageSize),
    });
    const res = await fetch(`/api/admin/creators?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setCreators(data.creators);
      setTotal(data.total);
    }
    setLoading(false);
  }, [search, status, platform, country, audienceSize, emailVerified, sortBy, sort, page]);

  async function handleDelete(creator: CreatorRow) {
    if (!window.confirm(`Eliminare definitivamente ${creator.fullName} (${creator.email})?`)) return;
    setDeletingId(creator.id);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/admin/creators/${creator.id}`, { method: "DELETE" });
      if (res.ok) {
        setActionMessage({ type: "success", text: `${creator.fullName} eliminato.` });
        await load();
      } else {
        const data = await res.json().catch(() => ({}));
        setActionMessage({ type: "error", text: data.error || "Impossibile eliminare il creator." });
      }
    } catch {
      setActionMessage({ type: "error", text: "Impossibile eliminare il creator." });
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(load, 250);
    return () => clearTimeout(timeout);
  }, [load]);

  const countryOptions = useMemo(() => COUNTRIES, []);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl tracking-tight">Creators</h1>
        <div className="flex items-center gap-3">
          <p className="text-sm text-[var(--ink-muted)]">{total} total</p>
          <a
            href="/api/admin/creators/export"
            className="input w-auto text-sm"
            download
          >
            Export CSV
          </a>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <input
          className="input max-w-xs"
          placeholder="Search name, handle, email…"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <select
          className="input w-auto"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">All statuses</option>
          {CREATOR_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s as CreatorStatusValue]}
            </option>
          ))}
        </select>
        <select
          className="input w-auto"
          value={platform}
          onChange={(e) => {
            setPage(1);
            setPlatform(e.target.value);
          }}
        >
          <option value="">All platforms</option>
          {PLATFORMS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        <select
          className="input w-auto"
          value={country}
          onChange={(e) => {
            setPage(1);
            setCountry(e.target.value);
          }}
        >
          <option value="">All countries</option>
          {countryOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className="input w-auto"
          value={audienceSize}
          onChange={(e) => {
            setPage(1);
            setAudienceSize(e.target.value);
          }}
        >
          <option value="">All audience sizes</option>
          {AUDIENCE_SIZES.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
        <select
          className="input w-auto"
          value={emailVerified}
          onChange={(e) => {
            setPage(1);
            setEmailVerified(e.target.value);
          }}
        >
          <option value="">Email: all</option>
          <option value="true">Verified</option>
          <option value="false">Not verified</option>
        </select>
        <select
          className="input w-auto"
          value={sortBy}
          onChange={(e) => {
            setPage(1);
            setSortBy(e.target.value as (typeof SORT_OPTIONS)[number]["value"]);
          }}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              Sort: {o.label}
            </option>
          ))}
        </select>
        <button
          className="input w-auto text-sm"
          onClick={() => setSort((s) => (s === "desc" ? "asc" : "desc"))}
        >
          {sort === "desc" ? "↓ Descending" : "↑ Ascending"}
        </button>
      </div>

      {actionMessage && (
        <p
          className={`mt-3 text-sm ${
            actionMessage.type === "success" ? "text-[var(--accent)]" : "text-[var(--danger)]"
          }`}
        >
          {actionMessage.text}
        </p>
      )}

      <div className="mt-5 overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-white">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="border-b border-[var(--border-subtle)] text-xs uppercase text-[var(--ink-muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Creator</th>
              <th className="px-4 py-3 font-medium">Country</th>
              <th className="px-4 py-3 font-medium">Platforms</th>
              <th className="px-4 py-3 font-medium">Audience</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Verified</th>
              <th className="px-4 py-3 font-medium">Registered</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {loading && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[var(--ink-muted)]">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && creators.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[var(--ink-muted)]">
                  No creators match these filters.
                </td>
              </tr>
            )}
            {!loading &&
              creators.map((creator) => (
                <tr key={creator.id} className="hover:bg-[var(--accent-soft)]/40">
                  <td className="px-4 py-3">
                    <Link href={`/admin/creators/${creator.id}`} className="block">
                      <p className="font-medium text-[var(--foreground)]">{creator.fullName}</p>
                      <p className="text-xs text-[var(--ink-muted)]">{creator.email}</p>
                    </Link>
                  </td>
                  <td className="px-4 py-3">{creator.country}</td>
                  <td className="px-4 py-3">{creator.platforms.join(", ")}</td>
                  <td className="px-4 py-3">{audienceLabel(creator.audienceSize)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUS_COLORS[creator.status as CreatorStatusValue] ?? "bg-neutral-100"
                      }`}
                    >
                      {STATUS_LABELS[creator.status as CreatorStatusValue] ?? creator.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {creator.emailVerifiedAt ? (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
                        Verified
                      </span>
                    ) : (
                      <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
                        Not verified
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[var(--ink-muted)]">
                    {new Date(creator.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 whitespace-nowrap text-sm">
                      <a
                        href={gmailComposeUrl(creator.email)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--accent)] hover:underline"
                      >
                        Contatta
                      </a>
                      <button
                        onClick={() => handleDelete(creator)}
                        disabled={deletingId === creator.id}
                        className="text-[var(--danger)] hover:underline disabled:opacity-50"
                      >
                        {deletingId === creator.id ? "Eliminazione…" : "Elimina"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          <button
            className="disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Previous
          </button>
          <span className="text-[var(--ink-muted)]">
            Page {page} of {totalPages}
          </span>
          <button
            className="disabled:opacity-40"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
