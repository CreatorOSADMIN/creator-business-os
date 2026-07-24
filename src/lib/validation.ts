import { z } from "zod";
import {
  PLATFORMS,
  AUDIENCE_SIZES,
  PUBLISHING_FREQUENCIES,
  CREATOR_EXPERIENCE,
  PRODUCT_INTERESTS,
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
  status: z.enum([
    "NEW",
    "CONTACTED",
    "INTERVIEW_SCHEDULED",
    "INTERESTED",
    "BETA",
    "PAID",
    "REJECTED",
  ]),
});

export const internalNoteSchema = z.object({
  internalNotes: z.string().max(10000),
});
