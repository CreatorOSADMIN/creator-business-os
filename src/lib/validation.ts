import { z } from "zod";
import {
  PLATFORMS,
  AUDIENCE_SIZES,
  PUBLISHING_FREQUENCIES,
  CREATOR_EXPERIENCE,
  PRODUCT_INTERESTS,
  CREATOR_STATUSES,
  QUESTION_STATUSES,
  QUESTION_CATEGORIES,
} from "./constants";

const platformValues = PLATFORMS.map((p) => p.value) as [string, ...string[]];
const audienceValues = AUDIENCE_SIZES.map((p) => p.value) as [string, ...string[]];
const frequencyValues = PUBLISHING_FREQUENCIES.map((p) => p.value) as [string, ...string[]];
const experienceValues = CREATOR_EXPERIENCE.map((p) => p.value) as [string, ...string[]];
const interestValues = PRODUCT_INTERESTS.map((p) => p.value) as [string, ...string[]];

export const creatorRegistrationSchema = z
  .object({
    fullName: z.string().trim().min(2, "Full name is required").max(200),
    creatorHandle: z.string().trim().min(2, "Creator name / handle is required").max(120),
    email: z.string().trim().toLowerCase().email("Enter a valid email address").max(200),
    country: z.string().trim().min(1, "Select your country"),

    platforms: z
      .array(z.enum(platformValues))
      .min(1, "Select at least one platform"),

    audienceSize: z.enum(audienceValues, { message: "Select your audience size" }),

    publishingFrequency: z.enum(frequencyValues, {
      message: "Select your publishing frequency",
    }),
    creatorExperience: z.enum(experienceValues, {
      message: "Select how long you've been creating",
    }),

    biggestChallenge: z
      .string()
      .trim()
      .min(10, "Please describe your biggest challenge (at least 10 characters)")
      .max(2000),

    productInterests: z.array(z.enum(interestValues)).min(1, "Select at least one option"),

    privacyAccepted: z.literal(true, {
      message: "You must accept the Privacy Policy to continue",
    }),
    marketingConsent: z.boolean().default(false),

    referralCode: z.string().trim().optional(),
    utmSource: z.string().trim().optional(),
    utmMedium: z.string().trim().optional(),
    utmCampaign: z.string().trim().optional(),
  });

export type CreatorRegistrationInput = z.infer<typeof creatorRegistrationSchema>;

export const adminLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const statusUpdateSchema = z.object({
  status: z.enum(CREATOR_STATUSES),
});

export const internalNoteSchema = z.object({
  internalNotes: z.string().max(10000),
});

// --- Public Q&A -------------------------------------------------------

const usernamePattern = /^[\p{L}\p{N} ._-]+$/u;

export const askQuestionSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2, "Enter a username (at least 2 characters)")
    .max(40, "Username must be 40 characters or fewer")
    .regex(usernamePattern, "Username can only contain letters, numbers, spaces, . _ -"),
  question: z
    .string()
    .trim()
    .min(10, "Your question must be at least 10 characters")
    .max(1000, "Your question must be 1000 characters or fewer"),
  category: z.enum(QUESTION_CATEGORIES).optional(),
  // Honeypot — real users never fill this (hidden via CSS).
  website: z.string().max(200).optional(),
  formRenderedAt: z.number().optional(),
});
export type AskQuestionInput = z.infer<typeof askQuestionSchema>;

const mediaUrlSchema = z.string().trim().url().max(2000);

export const questionAnswerSchema = z.object({
  answer: z.string().max(20000).optional(),
  answerImages: z.array(mediaUrlSchema).max(12).optional(),
  answerVideos: z.array(mediaUrlSchema).max(6).optional(),
  category: z.enum(QUESTION_CATEGORIES).optional().nullable(),
  status: z.enum(QUESTION_STATUSES).optional(),
  // Manually-editable publication date/time for the Questions admin panel.
  // Defaults client-side to "now" but can be moved to any valid date before
  // (or after) publishing; always re-validated here regardless of status.
  publishedAt: z.coerce.date().optional(),
  // Admin manual-upvote override, added on top of real per-IP votes —
  // never replaces them (see Question.manualUpvotes in schema.prisma).
  manualUpvotes: z.coerce.number().int().min(0).max(1_000_000).optional(),
});
export type QuestionAnswerInput = z.infer<typeof questionAnswerSchema>;

export const questionStatusSchema = z.object({
  status: z.enum(QUESTION_STATUSES),
});
