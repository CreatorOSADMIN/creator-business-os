import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { prisma } from "@/lib/prisma";
import { markdownToHtml, markdownToExcerpt } from "@/lib/markdown";
import { serializeQuestion } from "@/lib/serialize-question";
import { UpvoteButton } from "@/components/questions/upvote-button";
import { getSiteUrl } from "@/lib/site-url";
import { QUESTION_CATEGORY_SLUGS, type QuestionCategoryValue } from "@/lib/constants";

// ISR: published answers rarely change after the fact, but a short window
// lets edits/corrections roll out without a full redeploy.
export const revalidate = 3600;

async function getPublishedQuestion(slug: string) {
  const question = await prisma.question.findFirst({ where: { slug, status: "published" } });
  return question ? serializeQuestion(question) : null;
}

export async function generateStaticParams() {
  const questions = await prisma.question.findMany({
    where: { status: "published", slug: { not: null } },
    select: { slug: true },
  });
  return questions.filter((q) => q.slug).map((q) => ({ slug: q.slug as string }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const question = await getPublishedQuestion(slug);
  if (!question) return {};

  const description = question.answer
    ? markdownToExcerpt(question.answer, 160)
    : `${question.username} asked: ${question.question}`.slice(0, 160);

  const url = `/questions/${question.slug}`;

  return {
    title: question.question,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: question.question,
      description,
      url,
      type: "article",
      publishedTime: question.publishedAt?.toISOString(),
    },
    twitter: {
      card: "summary",
      title: question.question,
      description,
    },
  };
}

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const question = await getPublishedQuestion(slug);
  if (!question) notFound();

  const related = await prisma.question.findMany({
    where: {
      status: "published",
      slug: { not: null, notIn: [question.slug as string] },
      ...(question.category ? { category: question.category } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: 4,
  });

  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/questions/${question.slug}`;
  const answerHtml = question.answer ? markdownToHtml(question.answer) : null;
  const publishedDate = question.publishedAt ? new Date(question.publishedAt) : null;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: question.question,
      text: question.question,
      answerCount: answerHtml ? 1 : 0,
      dateCreated: question.createdAt.toISOString(),
      author: { "@type": "Person", name: question.username },
      ...(answerHtml
        ? {
            acceptedAnswer: {
              "@type": "Answer",
              text: markdownToExcerpt(question.answer as string, 5000),
              dateCreated: (publishedDate ?? question.createdAt).toISOString(),
              url: pageUrl,
              author: { "@type": "Organization", name: "CreatorOS" },
            },
          }
        : {}),
    },
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Questions", item: `${siteUrl}/questions` },
      { "@type": "ListItem", position: 2, name: question.question, item: pageUrl },
    ],
  };

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-bg">
        <script
          type="application/ld+json"
          // Built entirely from admin-authored, sanitized-at-render content
          // (see lib/markdown.ts) — no raw user HTML reaches this script tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
        />

        <section className="px-6 pb-16 pt-16 sm:px-10 sm:pt-24">
          <div className="mx-auto max-w-3xl">
            <nav aria-label="Breadcrumb" className="font-mono-ui text-xs uppercase tracking-[0.15em] text-text-faint">
              <Link href="/questions" className="text-text-muted transition-colors hover:text-text">
                Questions
              </Link>
              <span className="mx-2">/</span>
              <span className="text-text-faint">{question.category || "Answer"}</span>
            </nav>

            <h1 className="mt-6 text-balance font-display text-[clamp(1.75rem,4.5vw,3rem)] font-bold leading-[1.05] tracking-[-0.02em] text-text">
              {question.question}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-3 font-mono-ui text-xs uppercase tracking-[0.1em] text-text-faint">
              <span>
                Asked by <span className="text-text-muted">{question.username}</span>
              </span>
              {publishedDate && (
                <>
                  <span aria-hidden="true">·</span>
                  <time dateTime={publishedDate.toISOString()}>
                    {publishedDate.toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </>
              )}
              {question.category && (
                <>
                  <span aria-hidden="true">·</span>
                  {question.category in QUESTION_CATEGORY_SLUGS ? (
                    <Link
                      href={`/questions/category/${QUESTION_CATEGORY_SLUGS[question.category as QuestionCategoryValue]}`}
                      className="text-accent transition-colors hover:underline"
                    >
                      {question.category}
                    </Link>
                  ) : (
                    <span className="text-accent">{question.category}</span>
                  )}
                </>
              )}
            </div>

            <div className="mt-6">
              <UpvoteButton slug={question.slug as string} initialUpvotes={question.totalUpvotes} />
            </div>

            <div className="mt-10 border-t border-border pt-10">
              <h2 className="font-mono-ui text-xs uppercase tracking-[0.2em] text-accent">Answer</h2>
              {answerHtml ? (
                <div
                  className="prose-answer mt-4 max-w-none text-base leading-relaxed text-text-muted [&_a]:text-accent [&_a]:underline [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-text [&_h3]:mt-6 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-text [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mt-4 [&_p:first-child]:mt-0 [&_strong]:text-text [&_ul]:list-disc"
                  dangerouslySetInnerHTML={{ __html: answerHtml }}
                />
              ) : (
                <p className="mt-4 text-sm text-text-muted">This question hasn&apos;t been answered yet.</p>
              )}
            </div>

            {question.answerImages.length > 0 && (
              <div className="mt-10 border-t border-border pt-10">
                <h2 className="font-mono-ui text-xs uppercase tracking-[0.2em] text-accent">Images</h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {question.answerImages.map((src) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={src}
                      src={src}
                      alt={question.question}
                      className="w-full rounded-xl border border-border object-cover"
                      loading="lazy"
                    />
                  ))}
                </div>
              </div>
            )}

            {question.answerVideos.length > 0 && (
              <div className="mt-10 border-t border-border pt-10">
                <h2 className="font-mono-ui text-xs uppercase tracking-[0.2em] text-accent">Videos</h2>
                <div className="mt-4 flex flex-col gap-4">
                  {question.answerVideos.map((src) => (
                <video key={src} src={src} controls className="w-full rounded-xl border border-border" />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-14 border-t border-border pt-8">
              <Link
                href="/questions"
                className="inline-flex items-center gap-2 font-mono-ui text-xs uppercase tracking-[0.15em] text-text-muted transition-colors hover:text-text"
              >
                ← Back to Questions
              </Link>
            </div>

            {related.length > 0 && (
              <div className="mt-14 border-t border-border pt-10">
                <h2 className="font-mono-ui text-xs uppercase tracking-[0.2em] text-text-faint">
                  Related questions
                </h2>
                <ul className="mt-4 flex flex-col gap-3">
                  {related.map((r) => (
                    <li key={r.id}>
                      <Link
                        href={`/questions/${r.slug}`}
                        className="text-sm text-text-muted transition-colors hover:text-accent"
                      >
                        {r.question}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
