import { describe, it, expect, afterEach, vi } from "vitest";
import { getReferralCode, REFERRAL_PARAM } from "./referral.js";

// Stub window.location.search without needing jsdom
function stubSearch(search: string) {
  vi.stubGlobal("window", {
    location: { search },
  });
}

describe("getReferralCode", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns null when window is undefined", () => {
    vi.stubGlobal("window", undefined);
    expect(getReferralCode()).toBeNull();
  });

  it("returns null when param absent", () => {
    stubSearch("");
    expect(getReferralCode()).toBeNull();
  });

  it("reads default ref param from URL", () => {
    stubSearch("?ref=ABC123");
    expect(getReferralCode()).toBe("ABC123");
  });

  it("reads custom param name", () => {
    stubSearch("?code=XYZ");
    expect(getReferralCode("code")).toBe("XYZ");
  });

  it("returns null when custom param absent", () => {
    stubSearch("?ref=ABC123");
    expect(getReferralCode("code")).toBeNull();
  });

  it("REFERRAL_PARAM constant is 'ref'", () => {
    expect(REFERRAL_PARAM).toBe("ref");
  });
});
