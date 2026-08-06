import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/landing/reveal";
import { Eyebrow } from "@/components/landing/eyebrow";
import { QuestionsExplorer, type QuestionListItem } from "@/components/questions/questions-explorer";
import { findRankedQuestions } from "@/lib/question-ranking";
import { serializeQuestion } from "@/lib/serialize-question";
import { markdownToExcerpt } from "@/lib/markdown";
import { QUESTION_CATEGORIES, QUESTION_CATEGORY_SLUGS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Creator Business Questions & Answers — CreatorOS Knowledge Base",
  description:
    "CreatorOS Questions is a public knowledge base for creator business, social media management, monetization, and content management — pricing, platform support, analytics, brand collaborations, and more. No account required to ask.",
  alternates: { canonical: "/questions" },
  openGraph: {
    title: "Creator Business Questions & Answers | CreatorOS",
    description:
      "A public knowledge base on creator business, the creator economy, and monetization — answered by the CreatorOS team.",
    url: "/questions",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Creator Business Questions & Answers | CreatorOS",
    description: "A public knowledge base on creator business, the creator economy, and monetization.",
  },
};

// ISR: the list is search/filter driven client-side after the first paint,
// so a moderate revalidate window keeps this cheap while staying fresh.
export const revalidate = 300;

export default async function QuestionsPage() {
  // Ranked by total upvotes (real + manual) desc, then publishedAt desc —
  // see findRankedQuestions for why this is a raw query rather than a
  // Prisma orderBy.
  const questions = await findRankedQuestions({ take: 12 });

  const initialQuestions: QuestionListItem[] = questions.map((q) => {
    const serialized = serializeQuestion(q);
    return {
      id: q.id,
      username: q.username,
      question: q.question,
      slug: q.slug ?? "",
      category: q.category,
      publishedAt: q.publishedAt ? q.publishedAt.toISOString() : null,
      excerpt: q.answer ? markdownToExcerpt(q.answer) : "",
      totalUpvotes: serialized.totalUpvotes,
    };
  });

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
                CreatorOS Questions is a public knowledge base where creators and users find
                answers on creator business, social media management, monetization, and content
                management. No account needed — just a username. Every question is reviewed and
                answered by the CreatorOS team, and every published answer gets its own indexable
                page covering topics like creator tools, brand collaborations, and the creator
                economy at large.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="border-t border-border px-6 py-16 sm:px-10 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="sr-only">Browse questions by category</h2>
            <nav aria-label="Question categories" className="mb-8 flex flex-wrap items-center gap-2">
              {QUESTION_CATEGORIES.map((c) => (
                <Link
                  key={c}
                  href={`/questions/category/${QUESTION_CATEGORY_SLUGS[c]}`}
                  className="rounded-full border border-border px-3.5 py-1.5 font-mono-ui text-[11px] uppercase tracking-[0.1em] text-text-muted transition-colors hover:border-border-strong hover:text-text"
                >
                  {c}
                </Link>
              ))}
            </nav>
            <QuestionsExplorer initialQuestions={initialQuestions} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
