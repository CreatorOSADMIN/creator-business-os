"use client";

import { useEffect, useState } from "react";
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
  platformUrls: Record<string, string>;
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
  platformUrls: {},
  audienceSize: "",
  publishingFrequency: "",
  creatorExperience: "",
  biggestChallenge: "",
  productInterests: [],
  privacyAccepted: false,
  marketingConsent: false,
  website: "",
};

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

  function toggleArrayValue(field: "platforms" | "productInterests", value: string) {
    setForm((prev) => {
      const set = new Set(prev[field]);
      if (set.has(value)) {
        set.delete(value);
      } else {
        set.add(value);
      }
      const next = { ...prev, [field]: Array.from(set) };
      if (field === "platforms" && !set.has(value)) {
        const urls = { ...next.platformUrls };
        delete urls[value];
        next.platformUrls = urls;
      }
      return next;
    });
  }

  function setPlatformUrl(platform: string, url: string) {
    setForm((prev) => ({
      ...prev,
      platformUrls: { ...prev.platformUrls, [platform]: url },
    }));
  }

  useEffect(() => {
    if (Object.keys(errors).length === 0) return;
    const firstError = document.querySelector("[data-error='true']");
    firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [errors]);

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
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      const params = new URLSearchParams({
        id: data.creatorId,
        ref: data.referralCode,
      });
      router.push(`/early-access/success?${params.toString()}`);
    } catch {
      setServerError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-10 space-y-12">
      {/* Honeypot field — hidden from real users, catches simple bots */}
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <Section number="01" title="Basic Information">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full Name" error={errors.fullName} required>
            <input
              className="input"
              value={form.fullName}
              onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
              placeholder="Jane Doe"
            />
          </Field>
          <Field label="Creator Name / Handle" error={errors.creatorHandle} required>
            <input
              className="input"
              value={form.creatorHandle}
              onChange={(e) => setForm((p) => ({ ...p, creatorHandle: e.target.value }))}
              placeholder="@janedoe"
            />
          </Field>
          <Field label="Email Address" error={errors.email} required>
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="jane@example.com"
            />
          </Field>
          <Field label="Country" error={errors.country} required>
            <select
              className="input"
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
              <label
                key={platform.value}
                className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition ${
                  form.platforms.includes(platform.value)
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                    : "border-[var(--border-subtle)] text-[var(--ink-muted)] hover:border-[var(--foreground)]/30"
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={form.platforms.includes(platform.value)}
                  onChange={() => toggleArrayValue("platforms", platform.value)}
                />
                {platform.label}
              </label>
            ))}
          </div>
          {errors.platforms && <ErrorText>{errors.platforms}</ErrorText>}
        </div>

        {form.platforms.filter((p) => p !== "OTHER").length > 0 && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {form.platforms
              .filter((p) => p !== "OTHER")
              .map((platform) => {
                const label = PLATFORMS.find((p) => p.value === platform)?.label ?? platform;
                return (
                  <Field
                    key={platform}
                    label={`${label} Profile URL`}
                    error={errors[`platformUrls.${platform}`]}
                    required
                  >
                    <input
                      className="input"
                      value={form.platformUrls[platform] || ""}
                      onChange={(e) => setPlatformUrl(platform, e.target.value)}
                      placeholder={`https://...`}
                    />
                  </Field>
                );
              })}
          </div>
        )}
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
        <p className="text-sm font-medium">How often do you publish?</p>
        <div className="mt-3">
          <RadioGroup
            name="publishingFrequency"
            options={PUBLISHING_FREQUENCIES}
            value={form.publishingFrequency}
            onChange={(value) => setForm((p) => ({ ...p, publishingFrequency: value }))}
            error={errors.publishingFrequency}
          />
        </div>
        <p className="mt-6 text-sm font-medium">How long have you been creating content?</p>
        <div className="mt-3">
          <RadioGroup
            name="creatorExperience"
            options={CREATOR_EXPERIENCE}
            value={form.creatorExperience}
            onChange={(value) => setForm((p) => ({ ...p, creatorExperience: value }))}
            error={errors.creatorExperience}
          />
        </div>
      </Section>

      <Section
        number="05"
        title="Creator Problem"
        subtitle="What is the biggest challenge you currently face as a creator?"
      >
        <Field label="" error={errors.biggestChallenge}>
          <textarea
            className="input min-h-32"
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
        <div className="space-y-2">
          {PRODUCT_INTERESTS.map((interest) => (
            <label
              key={interest.value}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--border-subtle)] p-3 text-sm hover:border-[var(--foreground)]/30"
            >
              <input
                type="checkbox"
                className="mt-0.5"
                checked={form.productInterests.includes(interest.value)}
                onChange={() => toggleArrayValue("productInterests", interest.value)}
              />
              {interest.label}
            </label>
          ))}
        </div>
        {errors.productInterests && <ErrorText>{errors.productInterests}</ErrorText>}
      </Section>

      <Section number="07" title="Early Access Benefit">
        <p className="rounded-lg border border-[var(--border-subtle)] bg-[var(--accent-soft)] p-4 text-sm text-[var(--accent-strong)]">
          By joining the CreatorOS Early Access Program, you will be eligible for a 50% discount
          on the first three months of your paid subscription after launch, subject to the final
          terms of the program.
        </p>
      </Section>

      <Section number="08" title="Consent">
        <div className="space-y-4">
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={form.privacyAccepted}
              onChange={(e) => setForm((p) => ({ ...p, privacyAccepted: e.target.checked }))}
            />
            <span>
              I have read and accept the{" "}
              <a href="/privacy" target="_blank" className="text-[var(--accent)] underline">
                Privacy Policy
              </a>{" "}
              and{" "}
              <a href="/terms" target="_blank" className="text-[var(--accent)] underline">
                Terms of Service
              </a>
              . <span className="text-[var(--danger)]">*</span>
            </span>
          </label>
          {errors.privacyAccepted && <ErrorText>{errors.privacyAccepted}</ErrorText>}

          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={form.marketingConsent}
              onChange={(e) => setForm((p) => ({ ...p, marketingConsent: e.target.checked }))}
            />
            <span>
              I&apos;d like to receive updates and communications about CreatorOS. (optional)
            </span>
          </label>
        </div>
      </Section>

      {serverError && (
        <div className="rounded-lg border border-[var(--danger)]/30 bg-red-50 p-4 text-sm text-[var(--danger)]">
          {serverError}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-[var(--accent)] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)] disabled:opacity-60 sm:w-auto"
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
    <div className="border-t border-[var(--border-subtle)] pt-8">
      <div className="flex items-baseline gap-3">
        <span className="font-mono-label text-xs text-[var(--ink-muted)]">{number}</span>
        <h2 className="font-display text-xl tracking-tight">{title}</h2>
      </div>
      {subtitle && <p className="mt-2 text-sm text-[var(--ink-muted)]">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div data-error={error ? "true" : "false"}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium">
          {label} {required && <span className="text-[var(--danger)]">*</span>}
        </label>
      )}
      {children}
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-xs text-[var(--danger)]">{children}</p>;
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
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={`cursor-pointer rounded-lg border px-4 py-2.5 text-sm transition ${
              value === option.value
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                : "border-[var(--border-subtle)] text-[var(--ink-muted)] hover:border-[var(--foreground)]/30"
            }`}
          >
            <input
              type="radio"
              name={name}
              className="sr-only"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}
