"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import {
  CA_GOALS,
  CA_PLATFORMS,
  CA_DEMO_STORAGE_KEY,
  buildDemoSession,
  isValidPlatformUrl,
  type CaGoal,
  type CaPlatform,
} from "@/lib/content-analysis";
import { VideoUrlList } from "@/components/content-analysis/video-url-list";
import { CONTENT_ANALYSIS_FREE_LIMIT } from "@/lib/constants";

type FormErrors = {
  platform?: string;
  goal?: string;
  urls?: string;
};

export function AnalysisForm() {
  const router = useRouter();
  const [platform, setPlatform] = useState<CaPlatform | "">("");
  const [goal, setGoal] = useState<CaGoal | "">("");
  const [urls, setUrls] = useState<string[]>([""]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [urlErrors, setUrlErrors] = useState<(string | undefined)[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [remainingFreeAnalyses, setRemainingFreeAnalyses] = useState<number | null>(null);
  const [limitReached, setLimitReached] = useState(false);

  function updateUrl(index: number, value: string) {
    setUrls((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function addUrl() {
    setUrls((prev) => (prev.length >= 10 ? prev : [...prev, ""]));
  }

  function removeUrl(index: number) {
    setUrls((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
    setUrlErrors((prev) => prev.filter((_, i) => i !== index));
  }

  function selectPlatform(next: CaPlatform) {
    setPlatform(next);
    // Field format depends on platform, so previous per-field errors no
    // longer apply once the platform changes.
    setUrlErrors([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    const nextErrors: FormErrors = {};
    if (!platform) nextErrors.platform = "Select a platform.";
    if (!goal) nextErrors.goal = "Select a goal.";

    const filled = urls
      .map((url, index) => ({ url: url.trim(), index }))
      .filter((entry) => entry.url.length > 0);

    const nextUrlErrors: (string | undefined)[] = urls.map(() => undefined);

    if (filled.length === 0) {
      nextErrors.urls = "Paste at least one video link.";
    } else if (platform) {
      for (const { url, index } of filled) {
        if (!isValidPlatformUrl(url, platform)) {
          nextUrlErrors[index] = `Enter a valid ${platform} video URL.`;
        }
      }
      if (nextUrlErrors.some(Boolean)) {
        nextErrors.urls = "Fix the highlighted links below.";
      }
    }

    setUrlErrors(nextUrlErrors);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    // nextErrors already guarantees platform/goal are set at this point,
    // but narrow explicitly so buildDemoSession gets valid literal types.
    if (!platform || !goal) return;

    setErrors({});
    setSubmitting(true);

    const validUrls = filled.map((entry) => entry.url);
    trackEvent("cta_click", { location: "content_analysis_analyze", platform, goal });

    let analysisId: string | undefined;
    try {
      const res = await fetch("/api/content-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, goal, videoUrls: validUrls }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "FREE_ANALYSES_EXHAUSTED") {
          setLimitReached(true);
          setRemainingFreeAnalyses(0);
        }
        setServerError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      analysisId = data.id;
      if (typeof data.remainingFreeAnalyses === "number") {
        setRemainingFreeAnalyses(data.remainingFreeAnalyses);
      }
    } catch {
      setServerError("Network error. Please check your connection and try again.");
      setSubmitting(false);
      return;
    }

    try {
      const session = buildDemoSession(platform, goal, validUrls, analysisId);
      sessionStorage.setItem(CA_DEMO_STORAGE_KEY, JSON.stringify(session));
    } catch {
      // sessionStorage unavailable (e.g. private browsing) — the loading
      // and report pages fall back to their own placeholder copy.
    }

    router.push(
      analysisId
        ? `/content-analysis/analyzing?id=${encodeURIComponent(analysisId)}`
        : "/content-analysis/analyzing"
    );
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
              <SelectPill
                key={p}
                label={p}
                checked={platform === p}
                onClick={() => selectPlatform(p)}
              />
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

      <div data-error={errors.urls ? "true" : "false"}>
        <VideoUrlList
          platform={platform}
          urls={urls}
          errors={urlErrors}
          onChange={updateUrl}
          onAdd={addUrl}
          onRemove={removeUrl}
        />
        {errors.urls && <ErrorText>{errors.urls}</ErrorText>}
      </div>

      <div className="border-t border-border pt-10">
        <button
          type="submit"
          disabled={submitting || limitReached}
          className="w-full rounded-full bg-accent px-8 py-3.5 font-mono-ui text-xs font-medium uppercase tracking-[0.15em] text-bg transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {submitting ? "Starting…" : limitReached ? "Free analyses used" : "Analyze"}
        </button>
        {remainingFreeAnalyses !== null && (
          <p className="mt-3 font-mono-ui text-xs uppercase tracking-[0.1em] text-text-faint">
            {limitReached
              ? `${CONTENT_ANALYSIS_FREE_LIMIT} / ${CONTENT_ANALYSIS_FREE_LIMIT} free analyses used`
              : `${remainingFreeAnalyses} free ${remainingFreeAnalyses === 1 ? "analysis" : "analyses"} remaining`}
          </p>
        )}
        {serverError && <ErrorText>{serverError}</ErrorText>}
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
