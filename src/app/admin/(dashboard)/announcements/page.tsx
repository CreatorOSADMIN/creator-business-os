"use client";

import { useState } from "react";

interface SendResult {
  sent: number;
  failed: number;
  total: number;
}

export default function AdminAnnouncementsPage() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SendResult | null>(null);

  const canSend = subject.trim().length > 0 && body.trim().length > 0 && !sending;

  async function handleSend() {
    if (!canSend) return;
    const confirmed = window.confirm(
      "Stai per inviare questo annuncio a tutti i creator iscritti.\nVuoi continuare?"
    );
    if (!confirmed) return;

    setSending(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || "Invio non riuscito. Riprova.");
      }
    } catch {
      setError("Invio non riuscito. Riprova.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl tracking-tight">Annunci</h1>
      <p className="mt-1.5 text-sm text-[var(--ink-muted)]">
        Invia un&apos;email a tutti i creator iscritti alla lista Early Access.
      </p>

      <div className="card mt-6 max-w-2xl space-y-5 p-5 sm:p-6">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">
            Oggetto
          </label>
          <input
            className="input"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Oggetto dell'email"
            maxLength={200}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">
            Corpo
          </label>
          <textarea
            className="input min-h-64"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Scrivi il contenuto dell'annuncio…"
            maxLength={20000}
          />
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleSend} disabled={!canSend} className="btn btn-primary">
            {sending ? "Invio in corso…" : "Invia annuncio"}
          </button>
        </div>

        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

        {result && (
          <div className="badge-accent rounded-lg border p-4 text-sm">
            <p className="font-medium text-[var(--foreground)]">Annuncio inviato.</p>
            <p className="mt-1 text-[var(--ink-muted)]">
              Inviate: {result.sent} · Fallite: {result.failed} · Totale: {result.total}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
