import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getEarlyAccessProgress } from "@/lib/early-access-progress";
import { TrackEventOnMount } from "@/components/analytics/track-event-on-mount";
import { TrackedLink } from "@/components/analytics/tracked-link";

// Keeps the Early Access progress bar fresh without a client-side fetch or
// polling: the homepage revalidates on this cadence and re-reads the real
// verified-creator count from the database.
export const revalidate = 60;

export default async function HomePage() {
  const { progress, goal } = await getEarlyAccessProgress();
  return (
    <>
      <SiteHeader />
      <TrackEventOnMount event="homepage_view" />
      <main className="flex-1">
        <h1>CreatorOS</h1>
        <p>
          <TrackedLink href="/early-access" event="early_access_click" eventProps={{ location: "hero" }}>
            Request Early Access
          </TrackedLink>
        </p>
        <p>
          {progress}% of {goal} spots filled
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
