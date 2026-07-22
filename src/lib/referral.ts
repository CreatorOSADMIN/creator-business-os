import { customAlphabet } from "nanoid";

// Uppercase alphanumeric, no ambiguous characters (0/O, 1/I) for readability.
const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

export function generateReferralCode(): string {
  return nanoid();
}
