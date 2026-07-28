import { describe, it, expect } from "vitest";
import { creatorRegistrationSchema, adminLoginSchema, statusUpdateSchema } from "@/lib/validation";

const validRegistration = {
  fullName: "Jane Doe",
  creatorHandle: "janedoe",
  email: "Jane@Example.com",
  country: "IT",
  platforms: ["YOUTUBE"],
  audienceSize: "5K_10K",
  publishingFrequency: "WEEKLY",
  creatorExperience: "1_2Y",
  biggestChallenge: "Finding time to edit videos consistently.",
  productInterests: ["AUDIENCE_INSIGHTS"],
  privacyAccepted: true,
};

describe("creatorRegistrationSchema", () => {
  it("accepts a valid registration and normalizes the email", () => {
    const result = creatorRegistrationSchema.safeParse(validRegistration);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("jane@example.com");
    }
  });

  it("rejects a duplicate/invalid-shaped payload with bad field data", () => {
    const result = creatorRegistrationSchema.safeParse({
      ...validRegistration,
      email: "not-an-email",
      platforms: [],
      privacyAccepted: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path[0]);
      expect(fields).toEqual(expect.arrayContaining(["email", "platforms", "privacyAccepted"]));
    }
  });

  it("rejects a missing required field", () => {
    const rest = { ...validRegistration } as Partial<typeof validRegistration>;
    delete rest.fullName;
    const result = creatorRegistrationSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects an unknown enum value", () => {
    const result = creatorRegistrationSchema.safeParse({
      ...validRegistration,
      audienceSize: "NOT_A_REAL_SIZE",
    });
    expect(result.success).toBe(false);
  });
});

describe("adminLoginSchema", () => {
  it("accepts valid credentials", () => {
    expect(adminLoginSchema.safeParse({ email: "admin@site.com", password: "x" }).success).toBe(
      true
    );
  });

  it("rejects an empty password", () => {
    expect(adminLoginSchema.safeParse({ email: "admin@site.com", password: "" }).success).toBe(
      false
    );
  });
});

describe("statusUpdateSchema", () => {
  it("accepts a known status", () => {
    expect(statusUpdateSchema.safeParse({ status: "INTERESTED" }).success).toBe(true);
  });

  it("rejects an unknown status", () => {
    expect(statusUpdateSchema.safeParse({ status: "MADE_UP" }).success).toBe(false);
  });
});
