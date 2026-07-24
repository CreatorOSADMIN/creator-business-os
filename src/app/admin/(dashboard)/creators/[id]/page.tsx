"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  CREATOR_STATUSES,
  STATUS_LABELS,
  PLATFORMS,
  AUDIENCE_SIZES,
  PUBLISHING_FREQUENCIES,
  CREATOR_EXPERIENCE,
  PRODUCT_INTERESTS,
} from "@/lib/constants";
import type { CreatorStatusValue } from "@/lib/constants";

interface CreatorDetail {
  id: string;
  fullName: string;
  creatorHandle: string;
  email: string;
  country: string;
  platforms: string[];
  audienceSize: string;
  publishingFrequency: string;
  creatorExperience: string;
  biggestChallenge: string;
  productInterests: string[];
  status: string;
  internalNotes: string | null;
  referralCode: string;
  referredBy: string | null;
  marketingConsent: boolean;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  createdAt: string;
}

interface ReferralSummary {
  id: string;
  fullName: string;
  creatorHandle: string;
  status: string;
  createdAt: string;
}

function labelFor(options: ReadonlyArray<{ value: string; label: string }>, value: string) {
  return options.find((o) => o.value === value)?.label ?? value;
}

export default function AdminCreatorDetailPage() {
  const params = useParams<{ id: string }>();
  const [creator, setCreator] = useState<CreatorDetail | null>(null);
  const [referrals, setReferrals] = useState<ReferralSummary[]>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/admin/creators/${params.id}`);
      if (cancelled) return;
      if (res.status === 404) {
        setError("Creator not found.");
        return;
      }
      const data = await res.json();
      if (cancelled) return;
      setCreator(data.creator);
      setReferrals(data.referrals);
      setNotes(data.creator.internalNotes || "");
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  async function updateStatus(status: string) {
    setSaving(true);
    const res = await fetch(`/api/admin/creators/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const data = await res.json();
      setCreator(data.creator);
    }
    setSaving(false);
  }

  async function saveNotes() {
    setSaving(true);
    const res = await fetch(`/api/admin/creators/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ internalNotes: notes }),
    });
    if (res.ok) {
      setSavedAt(Date.now());
    }
    setSaving(false);
  }

  if (error) {
    return (
      <div>
        <p className="text-sm text-[var(--danger)]">{error}</p>
        <Link href="/admin/creators" className="mt-3 inline-block text-sm text-[var(--accent)] underline">
          ← Back to creators
        </Link>
      </div>
    );
  }

  if (!creator) {
    return <p className="text-sm text-[var(--ink-muted)]">Loading…</p>;
  }

  return (
    <div>
      <Link href="/admin/creators" className="text-sm text-[var(--ink-muted)] hover:text-[var(--accent)]">
        ← Back to creators
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl tracking-tight">{creator.fullName}</h1>
          <p className="text-sm text-[var(--ink-muted)]">
            {creator.creatorHandle} · {creator.email}
          </p>
        </div>
        <select
          className="input w-auto"
          value={creator.status}
          disabled={saving}
          onChange={(e) => updateStatus(e.target.value)}
        >
          {CREATOR_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s as CreatorStatusValue]}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card title="Profile">
            <Row label="Country" value={creator.country} />
            <Row
              label="Platforms"
              value={
                <div className="space-y-1">
                  {creator.platforms.map((p) => (
                    <div key={p} className="font-medium">
                      {labelFor(PLATFORMS, p)}
                    </div>
                  ))}
                </div>
              }
            />
            <Row label="Audience size" value={labelFor(AUDIENCE_SIZES, creator.audienceSize)} />
            <Row label="Publishing frequency" value={labelFor(PUBLISHING_FREQUENCIES, creator.publishingFrequency)} />
            <Row label="Creating for" value={labelFor(CREATOR_EXPERIENCE, creator.creatorExperience)} />
          </Card>

          <Card title="Biggest challenge">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{creator.biggestChallenge}</p>
          </Card>

          <Card title="Product interests">
            <ul className="list-inside list-disc space-y-1 text-sm">
              {creator.productInterests.map((interest) => (
                <li key={interest}>{labelFor(PRODUCT_INTERESTS, interest)}</li>
              ))}
            </ul>
          </Card>

          <Card title="Internal Notes">
            <p className="mb-2 text-xs text-[var(--ink-muted)]">Not visible to the creator.</p>
            <textarea
              className="input min-h-32"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="mt-2 flex items-center gap-3">
              <button
                onClick={saveNotes}
                disabled={saving}
                className="rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-medium text-white disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save notes"}
              </button>
              {savedAt && <span className="text-xs text-[var(--ink-muted)]">Saved</span>}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Registration">
            <Row label="Registered" value={new Date(creator.createdAt).toLocaleString()} />
            <Row label="Marketing consent" value={creator.marketingConsent ? "Yes" : "No"} />
            {creator.utmSource && <Row label="UTM source" value={creator.utmSource} />}
            {creator.utmMedium && <Row label="UTM medium" value={creator.utmMedium} />}
            {creator.utmCampaign && <Row label="UTM campaign" value={creator.utmCampaign} />}
          </Card>

          <Card title="Referral">
            <Row label="Referral code" value={<span className="font-mono">{creator.referralCode}</span>} />
            <Row label="Referred by" value={creator.referredBy ? <span className="font-mono">{creator.referredBy}</span> : "—"} />
            {referrals.length > 0 && (
              <div className="mt-3 border-t border-[var(--border-subtle)] pt-3">
                <p className="mb-2 text-xs font-medium uppercase text-[var(--ink-muted)]">
                  Referred {referrals.length} creator{referrals.length > 1 ? "s" : ""}
                </p>
                <ul className="space-y-1 text-sm">
                  {referrals.map((r) => (
                    <li key={r.id}>
                      <Link href={`/admin/creators/${r.id}`} className="text-[var(--accent)] hover:underline">
                        {r.fullName}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-white p-5">
      <h2 className="font-medium">{title}</h2>
      <div className="mt-3 space-y-2.5">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="text-sm">
      <p className="text-xs uppercase text-[var(--ink-muted)]">{label}</p>
      <div className="mt-0.5">{value}</div>
    </div>
  );
}
