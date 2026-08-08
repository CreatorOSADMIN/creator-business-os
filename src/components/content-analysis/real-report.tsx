import { Reveal } from "@/components/landing/reveal";
import { Eyebrow } from "@/components/landing/eyebrow";
import { ContentAnalysisFinalCta } from "@/components/content-analysis/final-cta";
import { isSafeHttpUrl } from "@/lib/safe-url";
import { formatCompactNumber, formatDuration, formatPublishedDate } from "@/components/content-analysis/report-format";
import type { ContentAnalysisReportResult, ContentAnalysisReportVideo } from "@/lib/content-analysis-report";

function Stat({ label, value }: { label: string; value: string | null }) {
  if (value === null) return null;
  return (
    <div>
      <p className="font-mono-ui text-xs uppercase tracking-[0.15em] text-text-faint">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold tracking-[-0.02em] text-text">{value}</p>
    </div>
  );
}

function VideoCard({ video, index }: { video: ContentAnalysisReportVideo; index: number }) {
  const link = isSafeHttpUrl(video.canonicalUrl) ? video.canonicalUrl : null;
  const thumbnail = isSafeHttpUrl(video.thumbnailUrl) ? video.thumbnailUrl : null;

  return (
    <Reveal delay={index * 90}>
      <div className="grid grid-cols-1 gap-6 border-b border-border py-10 sm:grid-cols-12 sm:gap-8">
        <div className="sm:col-span-4">
          {thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnail}
              alt={video.title ?? "Video thumbnail"}
              className="aspect-video w-full rounded-xl border border-border object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-border bg-bg-elevated">
              <span className="font-mono-ui text-xs uppercase tracking-[0.15em] text-text-faint">
                No thumbnail
              </span>
            </div>
          )}
        </div>

        <div className="sm:col-span-8">
          <span className="font-mono-ui text-xs uppercase tracking-[0.15em] text-text-faint">
            {video.platform} · {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="mt-2 text-balance font-display text-xl font-bold text-text">
            {video.title ?? "Untitled video"}
          </h3>
          <p className="mt-1 text-sm text-text-muted">
            {video.authorName ?? "Unknown creator"}
            {video.publishedAt ? ` · ${formatPublishedDate(video.publishedAt)}` : ""}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
            <Stat label="Views" value={formatCompactNumber(video.views)} />
            <Stat label="Likes" value={formatCompactNumber(video.likes)} />
            <Stat label="Comments" value={formatCompactNumber(video.comments)} />
            <Stat label="Duration" value={formatDuration(video.durationSeconds)} />
          </div>

          {video.hashtags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {video.hashtags.slice(0, 8).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border-strong px-3 py-1 font-mono-ui text-xs text-text-muted"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="mt-6 inline-block font-mono-ui text-xs uppercase tracking-[0.15em] text-accent hover:underline"
            >
              View original →
            </a>
          )}
        </div>
      </div>
    </Reveal>
  );
}

export function ContentAnalysisRealReport({ result }: { result: ContentAnalysisReportResult }) {
  const { videos, failedUrls } = result;

  return (
    <main className="flex-1 bg-bg">
      <section className="px-6 pb-16 pt-20 sm:px-10 sm:pt-28">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <Eyebrow>Your Content Analysis</Eyebrow>
            <h1 className="mt-6 text-balance font-display text-[clamp(2.25rem,6vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.03em] text-text">
              Here&apos;s what we found.
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-6 max-w-xl text-balance text-sm leading-relaxed text-text-muted">
              Real, public metadata pulled directly from{" "}
              {videos.length === 1 ? "your video" : `your ${videos.length} videos`} — no
              simulated scores, just what&apos;s actually there.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-border px-6 py-16 sm:px-10 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="border-t border-border">
            {videos.map((video, i) => (
              <VideoCard key={`${video.platform}-${video.externalId}`} video={video} index={i} />
            ))}
          </div>
        </div>
      </section>

      {failedUrls.length > 0 && (
        <section className="border-t border-border px-6 py-16 sm:px-10 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <Eyebrow>Couldn&apos;t retrieve {failedUrls.length === 1 ? "this link" : "these links"}</Eyebrow>
            <ul className="mt-8 flex flex-col gap-3">
              {failedUrls.map((f) => (
                <li key={f.url} className="text-sm text-text-muted">
                  <span className="break-all text-text">{f.url}</span>
                  {" — "}
                  {f.reason}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <ContentAnalysisFinalCta location="content_analysis_report_final_cta" />
    </main>
  );
}
