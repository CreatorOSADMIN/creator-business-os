import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/landing/reveal";
import { Eyebrow } from "@/components/landing/eyebrow";
import { prisma } from "@/lib/prisma";
import { markdownToExcerpt } from "@/lib/markdown";
import { getSiteUrl } from "@/lib/site-url";
import {
  QUESTION_CATEGORIES,
  QUESTION_CATEGORY_SLUGS,
  getCategoryBySlug,
  type QuestionCategoryValue,
} from "@/lib/constants";

// Short, unique blurb per category so each indexable page has distinct copy
// instead of a templated one-liner. Keeps the existing "General"/"Other"
// buckets honest rather than forcing keyword-stuffed descriptions onto them.
const CATEGORY_INTROS: Record<QuestionCategoryValue, string> = {
  General:
    "General questions from creators about running CreatorOS and building a creator business day to day.",
  "Getting Started":
    "Answers for creators getting started with CreatorOS — setup, early access, and what to expect first.",
  "Pricing & Plans":
    "Questions about CreatorOS pricing and plans, so creators can plan monetization without surprises.",
  "Platforms & Integrations":
    "How CreatorOS connects to YouTube, Instagram, TikTok, Twitch, X, and other social media management tools creators already use.",
  Analytics:
    "Questions about CreatorOS analytics — the creator tools for tracking growth, engagement, and content performance across platforms.",
  "Brand Deals":
    "Answers about brand collaborations on CreatorOS — negotiating, tracking, and managing deals as part of a creator business.",
  "Account & Billing":
    "Account and billing questions for CreatorOS members managing their creator economy toolkit.",
  Other:
    "Other creator business questions that don't fit neatly elsewhere, answered by the CreatorOS team.",
};

export const revalidate = 300;

export async function generateStaticParams() {
  return QUESTION_CATEGORIES.map((label) => ({ category: QUESTION_CATEGORY_SLUGS[label] }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};

  const title = `${category} Questions — CreatorOS Knowledge Base`;
  const description = CATEGORY_INTROS[category];
  const url = `/questions/category/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function QuestionCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const questions = await prisma.question.findMany({
    where: { status: "published", category, slug: { not: null } },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/questions/category/${slug}`;

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Questions", item: `${siteUrl}/questions` },
      { "@type": "ListItem", position: 2, name: category, item: pageUrl },
    ],
  };

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-bg">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
        />

        <section className="px-6 pb-12 pt-20 sm:px-10 sm:pt-28">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <nav aria-label="Breadcrumb" className="font-mono-ui text-xs uppercase tracking-[0.15em] text-text-faint">
                <Link href="/questions" className="text-text-muted transition-colors hover:text-text">
                  Questions
                </Link>
                <span className="mx-2">/</span>
                <span className="text-text-faint">{category}</span>
              </nav>

              <Eyebrow>Questions &amp; Answers</Eyebrow>
              <h1 className="mt-6 max-w-2xl text-balance font-display text-[clamp(2.25rem,6vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.03em] text-text">
                {category} questions.
              </h1>
              <p className="mt-8 max-w-xl text-balance border-t border-border pt-8 text-lg leading-relaxed text-text-muted">
                {CATEGORY_INTROS[category]}
              </p>
            </Reveal>
          </div>
        </section>

        <section className="border-t border-border px-6 py-16 sm:px-10 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex flex-wrap items-center gap-2">
              <Link
                href="/questions"
                className="rounded-full border border-border px-3.5 py-1.5 font-mono-ui text-[11px] uppercase tracking-[0.1em] text-text-muted transition-colors hover:border-border-strong hover:text-text"
              >
                All
              </Link>
              {QUESTION_CATEGORIES.map((c) => (
                <Link
                  key={c}
                  href={`/questions/category/${QUESTION_CATEGORY_SLUGS[c]}`}
                  className={`rounded-full border px-3.5 py-1.5 font-mono-ui text-[11px] uppercase tracking-[0.1em] transition-colors ${
                    c === category
                      ? "border-accent text-accent"
                      : "border-border text-text-muted hover:border-border-strong hover:text-text"
                  }`}
                >
                  {c}
                </Link>
              ))}
            </div>

            {questions.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm text-text-muted">
                  No published {category.toLowerCase()} questions yet.
                </p>
                <Link
                  href="/questions"
                  className="mt-4 inline-block rounded-full border border-border-strong px-5 py-2 font-mono-ui text-xs uppercase tracking-[0.15em] text-text transition-colors hover:border-accent hover:text-accent"
                >
                  Browse all questions
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {questions.map((q) => (
                  <Link
                    key={q.id}
                    href={`/questions/${q.slug}`}
                    className="group rounded-xl border border-border bg-bg-elevated p-5 transition-colors hover:border-border-strong"
                  >
                    <span className="font-mono-ui text-[10px] uppercase tracking-[0.15em] text-accent">
                      {category}
                    </span>
                    <h2 className="mt-2 font-display text-lg font-bold leading-snug text-text group-hover:text-accent">
                      {q.question}
                    </h2>
                    {q.answer && (
                      <p className="mt-2 line-clamp-2 text-sm text-text-muted">
                        {markdownToExcerpt(q.answer)}
                      </p>
                    )}
                    <div className="mt-4 flex items-center justify-between font-mono-ui text-[11px] uppercase tracking-[0.1em] text-text-faint">
                      <span>Asked by {q.username}</span>
                      {q.publishedAt && <span>{new Date(q.publishedAt).toLocaleDateString()}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-14 border-t border-border pt-8 text-center">
              <Link
                href="/early-access"
                className="inline-flex items-center gap-2 font-mono-ui text-xs uppercase tracking-[0.15em] text-accent transition-colors hover:text-text"
              >
                Join CreatorOS Early Access →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
