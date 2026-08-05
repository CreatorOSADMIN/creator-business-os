"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { QUESTION_CATEGORIES } from "@/lib/constants";

interface QuestionDetail {
  id: string;
  username: string;
  question: string;
  slug: string | null;
  answer: string | null;
  answerImages: string[];
  answerVideos: string[];
  category: string | null;
  status: string;
  createdAt: string;
  publishedAt: string | null;
  realUpvotes: number;
  manualUpvotes: number;
  totalUpvotes: number;
}

const TOOLBAR = [
  { label: "B", title: "Bold", wrap: "**" },
  { label: "I", title: "Italic", wrap: "*" },
] as const;

// Formats a Date as the "yyyy-MM-ddTHH:mm" string a <input type="datetime-local">
// expects, using local time components (not UTC/toISOString) so the value
// displayed matches what the admin actually picked.
function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function AdminQuestionEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("");
  // Publication date shown/edited in the admin panel. Defaults to "now" for
  // a question that hasn't been published yet, and is otherwise editable
  // before publishing (see save()).
  const [publishedAt, setPublishedAt] = useState(() => toDatetimeLocal(new Date()));
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [manualUpvotes, setManualUpvotes] = useState("0");
  const [savingUpvotes, setSavingUpvotes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<"draft" | "publish" | "delete" | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await fetch(`/api/admin/questions/${params.id}`);
      if (!cancelled && res.ok) {
        const data = await res.json();
        const q: QuestionDetail = data.question;
        setQuestion(q);
        setAnswer(q.answer || "");
        setCategory(q.category || "");
        setImages(q.answerImages || []);
        setVideos(q.answerVideos || []);
        setManualUpvotes(String(q.manualUpvotes ?? 0));
        setPublishedAt(toDatetimeLocal(q.publishedAt ? new Date(q.publishedAt) : new Date()));
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  function insertMarkdown(wrap: string) {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart, selectionEnd, value } = el;
    const selected = value.slice(selectionStart, selectionEnd) || "text";
    const next = `${value.slice(0, selectionStart)}${wrap}${selected}${wrap}${value.slice(selectionEnd)}`;
    setAnswer(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(selectionStart + wrap.length, selectionStart + wrap.length + selected.length);
    });
  }

  function insertHeading() {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart, value } = el;
    const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
    const next = `${value.slice(0, lineStart)}## ${value.slice(lineStart)}`;
    setAnswer(next);
    requestAnimationFrame(() => el.focus());
  }

  function insertListItem() {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart, value } = el;
    const prefix = value.slice(0, selectionStart);
    const needsNewline = prefix.length > 0 && !prefix.endsWith("\n");
    const next = `${prefix}${needsNewline ? "\n" : ""}- ${value.slice(selectionStart)}`;
    setAnswer(next);
    requestAnimationFrame(() => el.focus());
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/questions/upload", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        if (data.kind === "video") {
          setVideos((v) => [...v, data.url]);
        } else {
          setImages((v) => [...v, data.url]);
        }
      } else {
        setMessage({ type: "error", text: data.error || "Upload failed." });
      }
    } catch {
      setMessage({ type: "error", text: "Upload failed." });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function save(status: "pending" | "published") {
    setSaving(status === "published" ? "publish" : "draft");
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/questions/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer,
          answerImages: images,
          answerVideos: videos,
          category: category || null,
          status,
          publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setQuestion(data.question);
        setMessage({
          type: "success",
          text: status === "published" ? "Published." : "Draft saved.",
        });
      } else {
        setMessage({ type: "error", text: data.error || "Unable to save." });
      }
    } catch {
      setMessage({ type: "error", text: "Unable to save." });
    } finally {
      setSaving(null);
    }
  }

  async function saveManualUpvotes() {
    const value = Math.max(0, Math.trunc(Number(manualUpvotes) || 0));
    setSavingUpvotes(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/questions/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manualUpvotes: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setQuestion(data.question);
        setManualUpvotes(String(data.question.manualUpvotes));
        setMessage({ type: "success", text: "Upvotes updated." });
      } else {
        setMessage({ type: "error", text: data.error || "Unable to update upvotes." });
      }
    } catch {
      setMessage({ type: "error", text: "Unable to update upvotes." });
    } finally {
      setSavingUpvotes(false);
    }
  }

  async function handleDelete() {
    if (!question) return;
    if (!window.confirm(`Delete this question from ${question.username}? This cannot be undone.`)) return;
    setSaving("delete");
    try {
      const res = await fetch(`/api/admin/questions/${params.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin/questions");
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage({ type: "error", text: data.error || "Unable to delete." });
        setSaving(null);
      }
    } catch {
      setMessage({ type: "error", text: "Unable to delete." });
      setSaving(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-[var(--ink-muted)]">Loading…</p>;
  }

  if (!question) {
    return (
      <div className="empty-state">
        <p className="text-sm">Question not found.</p>
        <Link href="/admin/questions" className="mt-3 inline-block text-sm text-[var(--accent)] hover:underline">
          ← Back to Questions
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/questions" className="text-sm text-[var(--ink-muted)] hover:text-[var(--foreground)]">
        ← Back to Questions
      </Link>

      <div className="card mt-4 p-5">
        <span className={`badge ${question.status === "published" ? "badge-accent" : "badge-neutral"}`}>
          {question.status === "published" ? "Published" : "Pending"}
        </span>
        <h1 className="mt-3 font-display text-xl tracking-tight">{question.question}</h1>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Asked by <span className="font-medium text-[var(--foreground)]">{question.username}</span> on{" "}
          {new Date(question.createdAt).toLocaleString()}
        </p>
        {question.slug && (
          <p className="mt-2 text-xs text-[var(--ink-muted)]">
            Public URL: <span className="font-mono">/questions/{question.slug}</span>
          </p>
        )}
      </div>

      <div className="card mt-5 p-5">
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">
          Upvotes
        </label>
        <p className="text-sm text-[var(--ink-muted)]">
          Current upvotes: <span className="font-medium text-[var(--foreground)]">{question.totalUpvotes}</span>{" "}
          <span className="text-xs">
            ({question.realUpvotes} from users, {question.manualUpvotes} manual)
          </span>
        </p>
        <div className="mt-2 flex items-center gap-2">
          <label className="text-xs text-[var(--ink-muted)]" htmlFor="manual-upvotes">
            Set custom upvotes
          </label>
          <input
            id="manual-upvotes"
            type="number"
            min={0}
            className="input w-28"
            value={manualUpvotes}
            onChange={(e) => setManualUpvotes(e.target.value)}
          />
          <button
            type="button"
            disabled={savingUpvotes}
            onClick={saveManualUpvotes}
            className="btn btn-secondary disabled:opacity-50"
          >
            {savingUpvotes ? "Saving…" : "Save"}
          </button>
        </div>
        <p className="mt-1 text-xs text-[var(--ink-muted)]">
          Added on top of real user votes — the public page always shows real + manual.
        </p>
      </div>

      <div className="card mt-5 p-5">
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">
          Category
        </label>
        <select className="input w-full max-w-xs" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">No category</option>
          {QUESTION_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <label className="mb-1.5 mt-5 block text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">
          Publication date
        </label>
        <input
          type="datetime-local"
          className="input w-full max-w-xs"
          value={publishedAt}
          onChange={(e) => setPublishedAt(e.target.value)}
        />
        <p className="mt-1 text-xs text-[var(--ink-muted)]">
          Defaults to now. Adjust before publishing to backdate or schedule the displayed date.
        </p>

        <label className="mb-1.5 mt-5 block text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">
          Answer
        </label>
        <div className="flex flex-wrap items-center gap-1.5 rounded-t-lg border border-b-0 border-[var(--border-subtle)] bg-[var(--surface-2)] p-2">
          {TOOLBAR.map((t) => (
            <button
              key={t.label}
              type="button"
              title={t.title}
              onClick={() => insertMarkdown(t.wrap)}
              className="flex h-7 w-7 items-center justify-center rounded text-sm font-semibold text-[var(--ink-muted)] hover:bg-[var(--surface-dark)] hover:text-[var(--foreground)]"
            >
              {t.label}
            </button>
          ))}
          <button
            type="button"
            title="Heading"
            onClick={insertHeading}
            className="flex h-7 items-center justify-center rounded px-2 text-xs font-semibold text-[var(--ink-muted)] hover:bg-[var(--surface-dark)] hover:text-[var(--foreground)]"
          >
            H2
          </button>
          <button
            type="button"
            title="Bullet list"
            onClick={insertListItem}
            className="flex h-7 items-center justify-center rounded px-2 text-xs font-semibold text-[var(--ink-muted)] hover:bg-[var(--surface-dark)] hover:text-[var(--foreground)]"
          >
            • List
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-secondary h-7 px-3 text-xs disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Upload image/video"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
            />
          </div>
        </div>
        <textarea
          ref={textareaRef}
          rows={12}
          className="input w-full rounded-t-none font-mono text-sm"
          placeholder="Write the answer using Markdown — **bold**, *italic*, ## headings, - bullet lists, [links](https://...)"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />

        {(images.length > 0 || videos.length > 0) && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((src) => (
              <div key={src} className="group relative overflow-hidden rounded-lg border border-[var(--border-subtle)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-24 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((v) => v.filter((i) => i !== src))}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            ))}
            {videos.map((src) => (
              <div key={src} className="group relative overflow-hidden rounded-lg border border-[var(--border-subtle)]">
                <video src={src} className="h-24 w-full object-cover" muted />
                <button
                  type="button"
                  onClick={() => setVideos((v) => v.filter((i) => i !== src))}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {message && (
        <p className={`mt-4 text-sm ${message.type === "success" ? "text-[var(--accent)]" : "text-[var(--danger)]"}`}>
          {message.text}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={saving !== null}
          onClick={() => save("pending")}
          className="btn btn-secondary disabled:opacity-50"
        >
          {saving === "draft" ? "Saving…" : "Save Draft"}
        </button>
        <button
          type="button"
          disabled={saving !== null}
          onClick={() => save("published")}
          className="btn btn-primary disabled:opacity-50"
        >
          {saving === "publish" ? "Publishing…" : "Publish"}
        </button>
        <button
          type="button"
          disabled={saving !== null}
          onClick={handleDelete}
          className="ml-auto text-sm text-[var(--danger)] hover:underline disabled:opacity-50"
        >
          {saving === "delete" ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
}
