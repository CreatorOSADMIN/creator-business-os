/**
 * Structured audit logging for sensitive admin actions.
 *
 * Writes a single-line JSON record to stdout for every admin write action
 * (creator deletion, creator edits, announcement sends). This is
 * intentionally log-only — no database table, no new dependency — so it can
 * be picked up by whatever log aggregation the deployment already uses
 * (Vercel logs, journald, etc.) without a schema change.
 */

export type AuditAction =
  | "creator.delete"
  | "creator.update"
  | "announcement.send"
  | "question.update"
  | "question.publish"
  | "question.delete";

interface AuditLogInput {
  action: AuditAction;
  /** Email of the admin performing the action, from the session. */
  actor: string;
  /** Creator affected by this action, if any. */
  creatorId?: string;
  /** Question affected by this action, if any. */
  questionId?: string;
  /** Small, non-sensitive extra context (e.g. changed fields, send counts). */
  metadata?: Record<string, string | number | boolean | null>;
}

export function logAdminAction({ action, actor, creatorId, questionId, metadata }: AuditLogInput): void {
  const record = {
    type: "admin_audit",
    timestamp: new Date().toISOString(),
    action,
    actor,
    ...(creatorId ? { creatorId } : {}),
    ...(questionId ? { questionId } : {}),
    ...(metadata ? { metadata } : {}),
  };
  // Kept as a plain console.log (not console.error) so it doesn't get mixed
  // in with real error monitoring/alerting pipelines.
  console.log(`[audit] ${JSON.stringify(record)}`);
}
