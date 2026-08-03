"use client";

import { cloneElement, isValidElement, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PLATFORMS,
  AUDIENCE_SIZES,
  PUBLISHING_FREQUENCIES,
  CREATOR_EXPERIENCE,
  PRODUCT_INTERESTS,
  COUNTRIES,
} from "@/lib/constants";
import { creatorRegistrationSchema } from "@/lib/validation";
import { trackEvent } from "@/lib/analytics";

interface Props {
  initialReferralCode?: string;
  initialUtmSource?: string;
  initialUtmMedium?: string;
  initialUtmCampaign?: string;
}

type FormState = {
  fullName: string;
  creatorHandle: string;
  email: string;
  country: string;
  platforms: string[];
  audienceSize: string;
  publishingFrequency: string;
  creatorExperience: string;
  biggestChallenge: string;
  productInterests: string[];
  privacyAccepted: boolean;
  marketingConsent: boolean;
  website: string; // honeypot
};

const initialState: FormState = {
  fullName: "",
  creatorHandle: "",
  email: "",
  country: "",
  platforms: [],
  audienceSize: "",
  publishingFrequency: "",
  creatorExperience: "",
  biggestChallenge: "",
  productInterests: [],
  privacyAccepted: false,
  marketingConsent: false,
  website: "",
};

// Used to carry over in-progress form data when the user restarts with a
// different email (see EarlyAccessRestartButton). Session-scoped only: never
// persisted to the database, and always cleared as soon as it's restored.
const DRAFT_STORAGE_KEY = "creatoros:early-access-draft";
const DRAFT_MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours

const inputClass =
  "w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text placeholder:text-text-faint transition-colors focus:border-accent focus:outline-none focus-visible:outline-none";

const checkboxClass = "mt-0.5 h-4 w-4 shrink-0 accent-accent";

export function EarlyAccessForm({
  initialReferralCode,
  initialUtmSource,
  initialUtmMedium,
  initialUtmCampaign,
}: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  // Anti-bot: timestamp captured when the form becomes interactive. Sent
  // alongside (not part of) the validated payload so the API can reject
  // submissions completed implausibly fast, without exposing the check to
  // the client bundle's validation logic.
  const [formRenderedAt] = useState(() => Date.now());

  // Fires once when the form mounts (i.e. the person opened /early-access).
  useEffect(() => {
    trackEvent("early_access_form_open");
    trackEvent("early_access_form_start");
  }, []);

  // Restore a saved draft (minus the email) after "Use a different email".
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      if (!raw) return;

      const saved = JSON.parse(raw) as { savedAt?: number; data?: Partial<FormState> };
      if (!saved.data || !saved.savedAt || Date.now() - saved.savedAt > DRAFT_MAX_AGE_MS) return;

      // Intentional one-time sync from an external system (sessionStorage)
      // on mount, not a derived/cascading render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm((prev) => ({ ...prev, ...saved.data, email: "" }));
    } catch {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  }, []);

  function toggleArrayValue(field: "platforms" | "productInterests", value: string) {
    setForm((prev) => {
      const set = new Set(prev[field]);
      if (set.has(value)) {
        set.delete(value);
      } else {
        set.add(value);
      }
      return { ...prev, [field]: Array.from(set) };
    });
  }

  useEffect(() => {
    if (Object.keys(errors).length === 0) return;
    const firstError = document.querySelector("[data-error='true']");
    firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [errors]);

  useEffect(() => {
    if (!serverError) return;
    document
      .querySelector("[data-server-error='true']")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [serverError]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    const payload = {
      ...form,
      referralCode: initialReferralCode,
      utmSource: initialUtmSource,
      utmMedium: initialUtmMedium,
      utmCampaign: initialUtmCampaign,
    };

    const parsed = creatorRegistrationSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, formRenderedAt }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      // Save a draft of the entered data (minus email/honeypot) in case the
      // user comes back via "Use a different email" on the pending page.
      trackEvent("early_access_form_submit");
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { email: _email, website: _website, ...draft } = form;
        sessionStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({ savedAt: Date.now(), data: draft })
        );
      } catch {
        // sessionStorage unavailable (e.g. private browsing) — non-fatal,
        // the user just re-enters the form manually.
      }

      const params = new URLSearchParams({
        email: data.email || form.email,
        sent: data.emailSent === false ? "0" : "1",
      });
      router.push(`/early-access/pending?${params.toString()}`);
    } catch {
      setServerError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-14">
      {/* Honeypot field — hidden from real users, catches simple bots */}
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
        style={{ display: "none" }}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <Section number="01" title="Basic Information">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="fullName" label="Full Name" error={errors.fullName} required>
            <input className={inputClass}
              value={form.fullName}
              onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
              placeholder="Jane Doe"
            />
          </Field>
          <Field id="creatorHandle" label="Creator Name / Handle" error={errors.creatorHandle} required>
            <input className={inputClass}
              value={form.creatorHandle}
              onChange={(e) => setForm((p) => ({ ...p, creatorHandle: e.target.value }))}
              placeholder="@janedoe"
            />
          </Field>
          <Field id="email" label="Email Address" error={errors.email} required>
            <input className={inputClass}
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="jane@example.com"
            />
          </Field>
          <Field id="country" label="Country" error={errors.country} required>
            <select className={inputClass}
              value={form.country}
              onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
            >
              <option value="">Select your country</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      <Section number="02" title="Social Platforms" subtitle="Which platforms do you actively use?">
        <div data-error={errors.platforms ? "true" : "false"}>
          <div className="flex flex-wrap gap-3">
            {PLATFORMS.map((platform) => (
              <CheckboxPill
                key={platform.value}
                label={platform.label}
                checked={form.platforms.includes(platform.value)}
                onChange={() => toggleArrayValue("platforms", platform.value)}
              />
            ))}
          </div>
          {errors.platforms && <ErrorText>{errors.platforms}</ErrorText>}
        </div>
      </Section>

      <Section number="03" title="Audience" subtitle="What is your approximate total audience?">
        <RadioGroup
          name="audienceSize"
          options={AUDIENCE_SIZES}
          value={form.audienceSize}
          onChange={(value) => setForm((p) => ({ ...p, audienceSize: value }))}
          error={errors.audienceSize}
        />
      </Section>

      <Section number="04" title="Creator Activity">
        <div className="flex flex-col gap-8">
          <div>
            <p className="text-sm text-text-muted">How often do you publish?</p>
            <div className="mt-4">
              <RadioGroup
                name="publishingFrequency"
                options={PUBLISHING_FREQUENCIES}
                value={form.publishingFrequency}
                onChange={(value) => setForm((p) => ({ ...p, publishingFrequency: value }))}
                error={errors.publishingFrequency}
              />
            </div>
          </div>
          <div>
            <p className="text-sm text-text-muted">How long have you been creating content?</p>
            <div className="mt-4">
              <RadioGroup
                name="creatorExperience"
                options={CREATOR_EXPERIENCE}
                value={form.creatorExperience}
                onChange={(value) => setForm((p) => ({ ...p, creatorExperience: value }))}
                error={errors.creatorExperience}
              />
            </div>
          </div>
        </div>
      </Section>

      <Section
        number="05"
        title="Creator Problem"
        subtitle="What is the biggest challenge you currently face as a creator?"
      >
        <Field id="biggestChallenge" label="" error={errors.biggestChallenge}>
          <textarea className={`${inputClass} min-h-32 resize-y`}
            aria-label="Biggest challenge you currently face as a creator"
            value={form.biggestChallenge}
            onChange={(e) => setForm((p) => ({ ...p, biggestChallenge: e.target.value }))}
            placeholder="Tell us in your own words..."
          />
        </Field>
      </Section>

      <Section
        number="06"
        title="Product Interest"
        subtitle="Which part of CreatorOS would be most valuable to you?"
      >
        <div className="flex flex-wrap gap-3">
          {PRODUCT_INTERESTS.map((interest) => (
            <CheckboxPill
              key={interest.value}
              label={interest.label}
              checked={form.productInterests.includes(interest.value)}
              onChange={() => toggleArrayValue("productInterests", interest.value)}
            />
          ))}
        </div>
        {errors.productInterests && <ErrorText>{errors.productInterests}</ErrorText>}
      </Section>

      <Section number="07" title="Early Access Benefit">
        <p className="text-sm leading-relaxed text-text-muted">
          By joining the CreatorOS Early Access Program, you will be eligible for a 50% discount
          on the first three months of your paid subscription after launch, subject to the final
          terms of the program.
        </p>
      </Section>

      <Section number="08" title="Consent">
        <div className="flex flex-col gap-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              className={checkboxClass}
              checked={form.privacyAccepted}
              onChange={(e) => setForm((p) => ({ ...p, privacyAccepted: e.target.checked }))}
            />
            <span className="text-sm leading-relaxed text-text-muted">
              I have read and accept the{" "}
              <a href="/privacy" target="_blank" className="text-text underline underline-offset-2 hover:text-accent">
                Privacy Policy
              </a>{" "}
              and{" "}
              <a href="/terms" target="_blank" className="text-text underline underline-offset-2 hover:text-accent">
                Terms of Service
              </a>
              . <span className="text-accent">*</span>
            </span>
          </label>
          {errors.privacyAccepted && <ErrorText>{errors.privacyAccepted}</ErrorText>}

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              className={checkboxClass}
              checked={form.marketingConsent}
              onChange={(e) => setForm((p) => ({ ...p, marketingConsent: e.target.checked }))}
            />
            <span className="text-sm leading-relaxed text-text-muted">
              I&apos;d like to receive updates and communications about CreatorOS. (optional)
            </span>
          </label>
        </div>
      </Section>

      {serverError && (
        <p
          data-server-error="true"
          className="rounded-lg border border-border-strong bg-bg-elevated px-4 py-3 text-sm text-text"
        >
          {serverError}
        </p>
      )}

      <div className="border-t border-border pt-10">
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-accent px-8 py-3.5 font-mono-ui text-xs font-medium uppercase tracking-[0.15em] text-bg transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {submitting ? "Submitting…" : "Join the Early Access Program"}
        </button>
      </div>
    </form>
  );
}

function Section({
  number,
  title,
  subtitle,
  children,
}: {
  number: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-border pt-10">
      <div className="flex items-baseline gap-3">
        <span className="font-mono-ui text-xs text-text-faint">{number}</span>
        <h2 className="font-display text-lg font-bold text-text">{title}</h2>
      </div>
      {subtitle && <p className="mt-2 text-sm text-text-muted">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  const errorId = `${id}-error`;
  const input = isValidElement(children)
    ? cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? errorId : undefined,
      })
    : children;

  return (
    <div data-error={error ? "true" : "false"} className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="font-mono-ui text-xs uppercase tracking-[0.15em] text-text-faint">
          {label} {required && <span className="text-accent">*</span>}
        </label>
      )}
      {input}
      {error && <ErrorText id={errorId}>{error}</ErrorText>}
    </div>
  );
}

function ErrorText({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <p id={id} className="mt-1 text-xs text-accent">
      {children}
    </p>
  );
}

function CheckboxPill({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`cursor-pointer rounded-full border px-4 py-2 font-mono-ui text-xs uppercase tracking-[0.1em] transition-colors ${
        checked
          ? "border-accent bg-accent/10 text-accent"
          : "border-border-strong text-text-muted hover:border-accent hover:text-accent"
      }`}
    >
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      {label}
    </label>
  );
}

function RadioGroup({
  name,
  options,
  value,
  onChange,
  error,
}: {
  name: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div data-error={error ? "true" : "false"}>
      <div role="radiogroup" aria-label={name} className="flex flex-wrap gap-3">
        {options.map((option) => (
          <label
            key={option.value}
            className={`cursor-pointer rounded-full border px-4 py-2 font-mono-ui text-xs uppercase tracking-[0.1em] transition-colors ${
              value === option.value
                ? "border-accent bg-accent/10 text-accent"
                : "border-border-strong text-text-muted hover:border-accent hover:text-accent"
            }`}
          >
            <input
              type="radio"
              name={name}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}
