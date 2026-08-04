import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/landing/reveal";
import { Eyebrow } from "@/components/landing/eyebrow";
import { QuestionsExplorer, type QuestionListItem } from "@/components/questions/questions-explorer";
import { prisma } from "@/lib/prisma";
import { markdownToExcerpt } from "@/lib/markdown";

export const metadata: Metadata = {
  title: "Questions & Answers",
  description:
    "Ask CreatorOS anything and browse answers from the team — pricing, platform support, analytics, brand deals, and more. No account required to ask.",
  alternates: { canonical: "/questions" },
  openGraph: {
    title: "Questions & Answers | CreatorOS",
    description:
      "Ask CreatorOS anything and browse answers from the team — pricing, platform support, analytics, brand deals, and more.",
    url: "/questions",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Questions & Answers | CreatorOS",
    description: "Ask CreatorOS anything and browse answers from the team.",
  },
};

// ISR: the list is search/filter driven client-side after the first paint,
// so a moderate revalidate window keeps this cheap while staying fresh.
export const revalidate = 300;

export default async function QuestionsPage() {
  const questions = await prisma.question.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
    take: 12,
  });

  const initialQuestions: QuestionListItem[] = questions.map((q) => ({
    id: q.id,
    username: q.username,
    question: q.question,
    slug: q.slug ?? "",
    category: q.category,
    publishedAt: q.publishedAt ? q.publishedAt.toISOString() : null,
    excerpt: q.answer ? markdownToExcerpt(q.answer) : "",
  }));

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-bg">
        <section className="px-6 pb-12 pt-20 sm:px-10 sm:pt-28">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <Eyebrow>Questions &amp; Answers</Eyebrow>
              <h1 className="mt-6 max-w-2xl text-balance font-display text-[clamp(2.25rem,6vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.03em] text-text">
                Ask us anything.
              </h1>
              <p className="mt-8 max-w-xl text-balance border-t border-border pt-8 text-lg leading-relaxed text-text-muted">
                No account needed — just a username. Every question is reviewed and answered by the
                CreatorOS team.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="border-t border-border px-6 py-16 sm:px-10 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <QuestionsExplorer initialQuestions={initialQuestions} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
