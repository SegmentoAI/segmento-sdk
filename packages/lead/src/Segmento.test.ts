import { describe, it, expect, vi } from "vitest";
import { Segmento } from "./Segmento.js";
import type { WalletProof } from "@segmento/core";

const baseConfig = {
  segmentoToken: "tok-abc",
  projectName: "TestProject",
  telegramRequired: false,
  emailRequired: false,
  walletRequired: false,
};

const mockWalletProof: WalletProof = {
  address: "WalletAddr123",
  message: "sign me",
  signature: "sig123",
  ts: 1700000000000,
};

function mockOkFetch(response: unknown = { referral_code: "REF-123" }) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => response,
  });
}

function mockErrFetch(status: number, body: string) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    text: async () => body,
    statusText: body,
  });
}

describe("Segmento constructor", () => {
  it("throws when segmentoToken is empty", () => {
    expect(() => new Segmento({ ...baseConfig, segmentoToken: "" })).toThrow("segmentoToken is required");
  });

  it("freezes config", () => {
    const s = new Segmento(baseConfig);
    expect(Object.isFrozen(s.config)).toBe(true);
  });
});

describe("Segmento.createReferral — validation", () => {
  it("throws when telegram required but missing", async () => {
    const s = new Segmento({ ...baseConfig, telegramRequired: true });
    await expect(s.createReferral({})).rejects.toThrow("telegram is required");
  });

  it("throws when telegram required but whitespace only", async () => {
    const s = new Segmento({ ...baseConfig, telegramRequired: true });
    await expect(s.createReferral({ telegram: "   " })).rejects.toThrow("telegram is required");
  });

  it("throws when email required but missing", async () => {
    const s = new Segmento({ ...baseConfig, emailRequired: true });
    await expect(s.createReferral({})).rejects.toThrow("email is required");
  });

  it("throws when wallet required but missing", async () => {
    const s = new Segmento({ ...baseConfig, walletRequired: true });
    await expect(s.createReferral({})).rejects.toThrow("wallet is required");
  });
});

describe("Segmento.createReferral — payload", () => {
  it("sends segmento_token in every request", async () => {
    const fetch = mockOkFetch();
    const s = new Segmento({ ...baseConfig, fetchImpl: fetch });
    await s.createReferral({});
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.segmento_token).toBe("tok-abc");
  });

  it("includes trimmed telegram and email when required", async () => {
    const fetch = mockOkFetch();
    const s = new Segmento({
      ...baseConfig,
      telegramRequired: true,
      emailRequired: true,
      fetchImpl: fetch,
    });
    await s.createReferral({ telegram: "  @alice  ", email: "  alice@example.com  " });
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.telegram).toBe("@alice");
    expect(body.email).toBe("alice@example.com");
  });

  it("includes wallet proof when walletRequired", async () => {
    const fetch = mockOkFetch();
    const s = new Segmento({ ...baseConfig, walletRequired: true, fetchImpl: fetch });
    await s.createReferral({ wallet: mockWalletProof });
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.wallet).toEqual(mockWalletProof);
  });

  it("omits optional fields when not required and not provided", async () => {
    const fetch = mockOkFetch();
    const s = new Segmento({ ...baseConfig, fetchImpl: fetch });
    await s.createReferral({});
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body).not.toHaveProperty("telegram");
    expect(body).not.toHaveProperty("email");
    expect(body).not.toHaveProperty("wallet");
  });
});

describe("Segmento.createReferral — response", () => {
  it("returns referral_code from API", async () => {
    const s = new Segmento({ ...baseConfig, fetchImpl: mockOkFetch({ referral_code: "REF-XYZ" }) });
    const result = await s.createReferral({});
    expect(result.referral_code).toBe("REF-XYZ");
  });

  it("throws on non-ok API response", async () => {
    const s = new Segmento({ ...baseConfig, fetchImpl: mockErrFetch(422, "Invalid token") });
    await expect(s.createReferral({})).rejects.toThrow("Segmento API error 422: Invalid token");
  });

  it("uses custom endpoint when provided", async () => {
    const fetch = mockOkFetch();
    const s = new Segmento({ ...baseConfig, endpoint: "https://custom.api/referral", fetchImpl: fetch });
    await s.createReferral({});
    expect(fetch.mock.calls[0][0]).toBe("https://custom.api/referral");
  });
});
