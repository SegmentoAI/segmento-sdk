import { describe, it, expect } from "vitest";
import { verifySignature } from "./verify.js";

// ---------------------------------------------------------------------------
// Real-data tests — paste values from an actual wallet signing session below
// ---------------------------------------------------------------------------
const REAL_MESSAGE = ""; // message that was signed
const REAL_ADDRESS = ""; // base58 wallet address (public key)
const REAL_SIGNATURE = ""; // base58 signature returned by the wallet

describe("verifySignature — real data", () => {
  it.skipIf(!REAL_MESSAGE || !REAL_ADDRESS || !REAL_SIGNATURE)(
    "validates a real wallet signature",
    async () => {
      const result = await verifySignature(
        REAL_MESSAGE,
        REAL_ADDRESS,
        REAL_SIGNATURE,
      );
      expect(result).toBe(true);
    },
  );

  it.skipIf(!REAL_MESSAGE || !REAL_ADDRESS || !REAL_SIGNATURE)(
    "rejects a tampered message",
    async () => {
      const result = await verifySignature(
        REAL_MESSAGE + " tampered",
        REAL_ADDRESS,
        REAL_SIGNATURE,
      );
      expect(result).toBe(false);
    },
  );
});

// ---------------------------------------------------------------------------
// Unit tests — deterministic, no real keys needed
// ---------------------------------------------------------------------------
describe("verifySignature — unit", () => {
  it("returns false for a garbage signature", async () => {
    const result = await verifySignature(
      "hello",
      "11111111111111111111111111111111", // system program address — valid base58 pubkey
      "invalidsignature",
    );
    expect(result).toBe(false);
  });

  it("returns false for a wrong address", async () => {
    const result = await verifySignature(
      "hello",
      "22222222222222222222222222222222",
      "22222222222222222222222222222222222222222222222222222222222222222222222222222222222222",
    );
    expect(result).toBe(false);
  });
});
