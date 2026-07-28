import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHash } from "crypto";

const prismaMock = {
  emailVerificationToken: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  creator: {
    update: vi.fn(),
  },
  $transaction: vi.fn(),
};

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

const { hashToken, generateVerificationToken, verifyCreatorEmailToken } = await import(
  "@/lib/email-verification"
);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("hashToken", () => {
  it("produces a deterministic sha256 hex digest", () => {
    expect(hashToken("abc")).toBe(createHash("sha256").update("abc").digest("hex"));
  });
});

describe("generateVerificationToken", () => {
  it("returns a raw token whose hash matches hashToken", () => {
    const { rawToken, tokenHash } = generateVerificationToken();
    expect(rawToken).toHaveLength(64); // 32 bytes as hex
    expect(tokenHash).toBe(hashToken(rawToken));
  });
});

describe("verifyCreatorEmailToken", () => {
  it("succeeds for a valid, unused, unexpired token", async () => {
    const rawToken = "raw-valid-token";
    prismaMock.emailVerificationToken.findUnique.mockResolvedValue({
      id: "tok_1",
      creatorId: "creator_1",
      usedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      creator: { id: "creator_1", referralCode: "ABC123", referredBy: null, emailVerifiedAt: null },
    });
    prismaMock.$transaction.mockResolvedValue([{}, {}]);

    const result = await verifyCreatorEmailToken(rawToken);

    expect(result).toEqual({ ok: true, creatorId: "creator_1", referralCode: "ABC123" });
    expect(prismaMock.emailVerificationToken.findUnique).toHaveBeenCalledWith({
      where: { tokenHash: hashToken(rawToken) },
      include: expect.any(Object),
    });
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
  });

  it("rejects an expired token", async () => {
    prismaMock.emailVerificationToken.findUnique.mockResolvedValue({
      id: "tok_2",
      creatorId: "creator_2",
      usedAt: null,
      expiresAt: new Date(Date.now() - 60_000),
      creator: { id: "creator_2", referralCode: "XYZ789", referredBy: null, emailVerifiedAt: null },
    });

    const result = await verifyCreatorEmailToken("raw-expired-token");

    expect(result).toEqual({ ok: false, reason: "expired" });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("rejects a token that was already used and never completed verification", async () => {
    prismaMock.emailVerificationToken.findUnique.mockResolvedValue({
      id: "tok_3",
      creatorId: "creator_3",
      usedAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
      creator: { id: "creator_3", referralCode: "QWE111", referredBy: null, emailVerifiedAt: null },
    });

    const result = await verifyCreatorEmailToken("raw-used-token");

    expect(result).toEqual({ ok: false, reason: "invalid" });
  });

  it("treats a used token as a valid re-open if the creator ended up verified", async () => {
    prismaMock.emailVerificationToken.findUnique.mockResolvedValue({
      id: "tok_4",
      creatorId: "creator_4",
      usedAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
      creator: {
        id: "creator_4",
        referralCode: "ZZZ999",
        referredBy: null,
        emailVerifiedAt: new Date(),
      },
    });

    const result = await verifyCreatorEmailToken("raw-reopened-token");

    expect(result).toEqual({ ok: true, creatorId: "creator_4", referralCode: "ZZZ999" });
  });

  it("rejects a token that doesn't exist", async () => {
    prismaMock.emailVerificationToken.findUnique.mockResolvedValue(null);

    const result = await verifyCreatorEmailToken("nonexistent-token");

    expect(result).toEqual({ ok: false, reason: "invalid" });
  });

  it("rejects an empty/invalid input without querying the database", async () => {
    const result = await verifyCreatorEmailToken("");

    expect(result).toEqual({ ok: false, reason: "invalid" });
    expect(prismaMock.emailVerificationToken.findUnique).not.toHaveBeenCalled();
  });
});
