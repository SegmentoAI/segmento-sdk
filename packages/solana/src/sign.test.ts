import { describe, it, expect } from "vitest";
import { getSignMessage, signMessage } from "./sign.js";
import type { WalletAdapter } from "./types.js";

const TC_URL = "https://github.com/SegmentoAI/terms-and-conditions/blob/v1.0/terms.md";

describe("getSignMessage", () => {
  it("includes the project name", () => {
    expect(getSignMessage("MyApp")).toContain("MyApp");
  });

  it("includes the T&C URL", () => {
    expect(getSignMessage("x")).toContain(TC_URL);
  });

  it("is stable for the same input", () => {
    expect(getSignMessage("Foo")).toBe(getSignMessage("Foo"));
  });

  it("differs for different project names", () => {
    expect(getSignMessage("Alpha")).not.toBe(getSignMessage("Beta"));
  });
});

describe("signMessage", () => {
  it("throws when wallet.publicKey is null", async () => {
    const wallet: WalletAdapter = {
      publicKey: null,
      signMessage: async () => new Uint8Array(),
    };
    await expect(signMessage(wallet, "MyApp")).rejects.toThrow("Wallet not connected");
  });

  it("returns WalletProof with correct address and message", async () => {
    const wallet: WalletAdapter = {
      publicKey: { toBase58: () => "PubKey123" },
      signMessage: async () => new Uint8Array([1, 2, 3]),
    };
    const proof = await signMessage(wallet, "MyApp");
    expect(proof.address).toBe("PubKey123");
    expect(proof.message).toBe(getSignMessage("MyApp"));
  });

  it("returns WalletProof with string signature and numeric ts", async () => {
    const wallet: WalletAdapter = {
      publicKey: { toBase58: () => "addr" },
      signMessage: async () => new Uint8Array([10, 20, 30]),
    };
    const proof = await signMessage(wallet, "App");
    expect(typeof proof.signature).toBe("string");
    expect(proof.signature.length).toBeGreaterThan(0);
    expect(typeof proof.ts).toBe("number");
  });

  it("handles adapter returning { signature: Uint8Array }", async () => {
    const sigBytes = new Uint8Array([4, 5, 6]);
    const wallet: WalletAdapter = {
      publicKey: { toBase58: () => "addr2" },
      signMessage: async () => ({ signature: sigBytes }),
    };
    const proof = await signMessage(wallet, "App");
    expect(proof.address).toBe("addr2");
    expect(typeof proof.signature).toBe("string");
  });

  it("produces same signature for same bytes", async () => {
    const sigBytes = new Uint8Array([99, 100, 101]);
    const wallet: WalletAdapter = {
      publicKey: { toBase58: () => "addr" },
      signMessage: async () => sigBytes,
    };
    const p1 = await signMessage(wallet, "App");
    const p2 = await signMessage(wallet, "App");
    expect(p1.signature).toBe(p2.signature);
  });

  it("encodes leading zero bytes as '1' prefix in base58", async () => {
    const wallet: WalletAdapter = {
      publicKey: { toBase58: () => "addr" },
      signMessage: async () => new Uint8Array([0, 0, 1]),
    };
    const proof = await signMessage(wallet, "App");
    expect(proof.signature.startsWith("11")).toBe(true);
  });
});
