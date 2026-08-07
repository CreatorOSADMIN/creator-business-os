import type { CaPlatform } from "@/lib/content-analysis";
import { CA_MAX_URLS } from "@/lib/content-analysis";

const inputClass =
  "w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text placeholder:text-text-faint transition-colors focus:border-accent focus:outline-none focus-visible:outline-none";

interface VideoUrlListProps {
  platform: CaPlatform | "";
  urls: string[];
  errors: (string | undefined)[];
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

// Reusable dynamic list of video URL fields (1–CA_MAX_URLS). Purely
// client-side: no external verification, only URL-format validation is
// surfaced via the `errors` prop.
export function VideoUrlList({
  platform,
  urls,
  errors,
  onChange,
  onAdd,
  onRemove,
}: VideoUrlListProps) {
  const label = platform ? `Paste ${platform} video links` : "Paste video links";

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-mono-ui text-xs uppercase tracking-[0.15em] text-text-faint">
          {label} <span className="text-accent">*</span>
        </p>
        <p className="text-xs text-text-faint">
          {urls.length}/{CA_MAX_URLS} · same platform
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {urls.map((url, i) => (
          <div key={i} className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-3">
            <label className="flex flex-1 flex-col gap-1.5">
              <span className="font-mono-ui text-xs text-text-faint">Video {i + 1}</span>
              <input
                className={inputClass}
                type="url"
                inputMode="url"
                value={url}
                onChange={(e) => onChange(i, e.target.value)}
                placeholder="https://..."
                aria-invalid={Boolean(errors[i])}
                aria-describedby={errors[i] ? `video-url-error-${i}` : undefined}
              />
              {errors[i] && (
                <p id={`video-url-error-${i}`} className="text-xs text-accent">
                  {errors[i]}
                </p>
              )}
            </label>

            {urls.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(i)}
                aria-label={`Remove video ${i + 1}`}
                className="h-9 shrink-0 rounded-lg border border-border-strong px-3 font-mono-ui text-xs uppercase tracking-[0.1em] text-text-muted transition-colors hover:border-accent hover:text-accent sm:mt-6"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      {urls.length < CA_MAX_URLS && (
        <button
          type="button"
          onClick={onAdd}
          className="mt-4 rounded-full border border-border-strong px-4 py-2 font-mono-ui text-xs uppercase tracking-[0.1em] text-text-muted transition-colors hover:border-accent hover:text-accent"
        >
          + Add another link
        </button>
      )}
    </div>
  );
}
