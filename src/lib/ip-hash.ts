import { createHmac } from "crypto";
import { getServerEnv } from "@/lib/env";

/**
 * Salted, one-way hash of a client IP address for anti-abuse dedup (e.g.
 * QuestionUpvote.ipHash). Never store the raw IP: HMAC-SHA256 keyed with
 * SESSION_SECRET (already a required, long, secret env var — no new secret
 * to provision) means the hash can't be reversed or rainbow-tabled back to
 * the address, while still deterministically colliding for the same IP so
 * duplicate votes are caught.
 *
 * Handles IPv4 and IPv6 alike (raw byte pattern differs, but both are just
 * strings here) and normalizes IPv6 zone/scope + case so the same address
 * quoted slightly differently by different proxies still hashes the same.
 */
export function hashIp(ip: string): string {
  const normalized = ip.trim().toLowerCase().split("%")[0];
  return createHmac("sha256", getServerEnv().SESSION_SECRET).update(normalized).digest("hex");
}
