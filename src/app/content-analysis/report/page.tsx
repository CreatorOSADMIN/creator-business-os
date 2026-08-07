import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ContentAnalysisReportContent } from "@/components/content-analysis/report-content";

export const metadata: Metadata = {
  title: "Your Content Analysis",
  description: "A preview of the kind of content report CreatorOS generates from your videos.",
  robots: { index: false, follow: false },
};

// The report body is a client component: it reads the demo session from
// sessionStorage and runs the local simulation engine, falling back to
// static placeholder copy when no session is present.
export default function ContentAnalysisReportPage() {
  return (
    <>
      <SiteHeader />
      <ContentAnalysisReportContent />
      <SiteFooter />
    </>
  );
}
