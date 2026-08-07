"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

const CA_PLATFORMS = ["TikTok", "Instagram", "YouTube"] as const;

const CA_GOALS = [
  "Maximize Views",
  "Gain Followers",
  "Increase Comments",
  "Improve Engagement",
] as const;

const URL_SLOTS = Array.from({ length: 10 }, (_, i) => i);

// Session-only handoff to the simulated loading + report pages. Nothing is
// sent anywhere — this is purely a frontend demo, no backend involved.
const DEMO_STORAGE_KEY = "creatoros:content-analysis-demo";

type FormErrors = {
  platform?: string;
  goal?: string;
  urls?: string;
};

const inputClass =
  "w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text placeholder:text-text-faint transition-colors focus:border-accent focus:outline-none focus-visible:outline-none";

export function AnalysisForm() {
  const router = useRouter();
  const [platform, setPlatform] = useState<string>("");
  const [goal, setGoal] = useState<string>("");
  const [urls, setUrls] = useState<string[]>(() => Array(10).fill(""));
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function updateUrl(index: number, value: string) {
    setUrls((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const filledUrls = urls.map((u) => u.trim()).filter(Boolean);
    const nextErrors: FormErrors = {};
    if (!platform) nextErrors.platform = "Select a platform.";
    if (!goal) nextErrors.goal = "Select a goal.";
    if (filledUrls.length === 0) nextErrors.urls = "Paste at least one video link.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    trackEvent("cta_click", { location: "content_analysis_analyze", platform, goal });

    try {
      sessionStorage.setItem(
        DEMO_STORAGE_KEY,
        JSON.stringify({ platform, goal, urls: filledUrls })
      );
    } catch {
      // sessionStorage unavailable (e.g. private browsing) — the loading
      // and report pages fall back to their own placeholder copy.
    }

    router.push("/content-analysis/analyzing");
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-10">
      <div>
        <p className="font-mono-ui text-xs uppercase tracking-[0.15em] text-text-faint">
          Platform <span className="text-accent">*</span>
        </p>
        <div data-error={errors.platform ? "true" : "false"} className="mt-4">
          <div className="flex flex-wrap gap-3">
            {CA_PLATFORMS.map((p) => (
              <SelectPill key={p} label={p} checked={platform === p} onClick={() => setPlatform(p)} />
            ))}
          </div>
          {errors.platform && <ErrorText>{errors.platform}</ErrorText>}
        </div>
      </div>

      <div>
        <p className="font-mono-ui text-xs uppercase tracking-[0.15em] text-text-faint">
          Goal <span className="text-accent">*</span>
        </p>
        <div data-error={errors.goal ? "true" : "false"} className="mt-4">
          <div className="flex flex-wrap gap-3">
            {CA_GOALS.map((g) => (
              <SelectPill key={g} label={g} checked={goal === g} onClick={() => setGoal(g)} />
            ))}
          </div>
          {errors.goal && <ErrorText>{errors.goal}</ErrorText>}
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-4">
          <p className="font-mono-ui text-xs uppercase tracking-[0.15em] text-text-faint">
            Video Links <span className="text-accent">*</span>
          </p>
          <p className="text-xs text-text-faint">Up to 10, same platform</p>
        </div>
        <div data-error={errors.urls ? "true" : "false"} className="mt-4 grid gap-3 sm:grid-cols-2">
          {URL_SLOTS.map((i) => (
            <label key={i} className="flex flex-col gap-1.5">
              <span className="font-mono-ui text-xs text-text-faint">Video {i + 1}</span>
              <input
                className={inputClass}
                type="url"
                inputMode="url"
                value={urls[i]}
                onChange={(e) => updateUrl(i, e.target.value)}
                placeholder="https://..."
              />
            </label>
          ))}
        </div>
        {errors.urls && <ErrorText>{errors.urls}</ErrorText>}
      </div>

      <div className="border-t border-border pt-10">
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-accent px-8 py-3.5 font-mono-ui text-xs font-medium uppercase tracking-[0.15em] text-bg transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {submitting ? "Starting…" : "Analyze"}
        </button>
      </div>
    </form>
  );
}

function SelectPill({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={checked}
      className={`cursor-pointer rounded-full border px-4 py-2 font-mono-ui text-xs uppercase tracking-[0.1em] transition-colors ${
        checked
          ? "border-accent bg-accent/10 text-accent"
          : "border-border-strong text-text-muted hover:border-accent hover:text-accent"
      }`}
    >
      {label}
    </button>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-xs text-accent">{children}</p>;
}
