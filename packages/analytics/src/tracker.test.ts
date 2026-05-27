import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@segmento/core", () => ({
  collectEvent: vi.fn(),
}));

const mockCollect = vi.mocked(
  (await import("@segmento/core")).collectEvent,
);

function setLocation(href: string, search = "") {
  Object.defineProperty(window, "location", {
    value: { href, search, pathname: "/" },
    writable: true,
    configurable: true,
  });
}

beforeEach(() => {
  sessionStorage.clear();
  vi.clearAllMocks();
  setLocation("https://example.com/", "");
  Object.defineProperty(document, "referrer", {
    value: "",
    writable: true,
    configurable: true,
  });
  Object.defineProperty(document, "title", {
    value: "Test Page",
    writable: true,
    configurable: true,
  });
});

describe("session — getSessionId", () => {
  it("generates and persists a UUID", async () => {
    vi.resetModules();
    const { getSessionId } = await import("./session.js");
    const id1 = getSessionId();
    const id2 = getSessionId();
    expect(id1).toBeTruthy();
    expect(id1).toBe(id2);
  });

  it("writes session ID to sessionStorage", async () => {
    sessionStorage.clear();
    vi.resetModules();
    const { getSessionId } = await import("./session.js");
    const id = getSessionId();
    expect(sessionStorage.getItem("sgm_sid")).toBe(id);
  });
});

describe("session — captureFromUrl", () => {
  it("stores ref from URL", async () => {
    setLocation("https://example.com/?ref=abc123", "?ref=abc123");
    vi.resetModules();
    const { captureFromUrl, getReferralCode } = await import("./session.js");
    captureFromUrl();
    expect(getReferralCode()).toBe("abc123");
  });

  it("stores UTM params from URL", async () => {
    setLocation(
      "https://example.com/?utm_source=twitter&utm_campaign=launch",
      "?utm_source=twitter&utm_campaign=launch",
    );
    vi.resetModules();
    const { captureFromUrl, getUtms } = await import("./session.js");
    captureFromUrl();
    const utms = getUtms();
    expect(utms.utmSource).toBe("twitter");
    expect(utms.utmCampaign).toBe("launch");
    expect(utms.utmMedium).toBeUndefined();
  });

  it("ref survives URL change after capture", async () => {
    setLocation("https://example.com/?ref=xyz", "?ref=xyz");
    vi.resetModules();
    const { captureFromUrl, getReferralCode } = await import("./session.js");
    captureFromUrl();
    setLocation("https://example.com/dashboard", "");
    expect(getReferralCode()).toBe("xyz");
  });
});

describe("tracker — pageview", () => {
  it("sends pageview event on init", async () => {
    setLocation("https://example.com/page", "");
    vi.resetModules();
    const { initAnalytics } = await import("./index.js");
    initAnalytics("proj_test");

    expect(mockCollect).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: "proj_test",
        eventType: "pageview",
        pageUrl: "https://example.com/page",
        pageTitle: "Test Page",
      }),
      expect.any(Object),
    );
  });

  it("includes session_id on pageview", async () => {
    vi.resetModules();
    const { initAnalytics } = await import("./index.js");
    initAnalytics("proj_test");
    const call = mockCollect.mock.calls[0][0];
    expect(call.sessionId).toBeTruthy();
  });

  it("includes referral_code when ref was in URL", async () => {
    setLocation("https://example.com/?ref=myref", "?ref=myref");
    vi.resetModules();
    const { initAnalytics } = await import("./index.js");
    initAnalytics("proj_test");
    const call = mockCollect.mock.calls[0][0];
    expect(call.referralCode).toBe("myref");
  });

  it("includes UTMs when present in URL", async () => {
    setLocation(
      "https://example.com/?utm_source=newsletter",
      "?utm_source=newsletter",
    );
    vi.resetModules();
    const { initAnalytics } = await import("./index.js");
    initAnalytics("proj_test");
    const call = mockCollect.mock.calls[0][0];
    expect(call.utmSource).toBe("newsletter");
  });
});

describe("tracker — custom event", () => {
  it("sends custom event with correct shape", async () => {
    vi.resetModules();
    const { initAnalytics, segmentoTag } = await import("./index.js");
    initAnalytics("proj_test");
    mockCollect.mockClear();

    segmentoTag("wallet_connected", { wallet_address: "8xKp", chain: "solana" });

    expect(mockCollect).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: "proj_test",
        eventType: "custom",
        eventName: "wallet_connected",
        properties: { wallet_address: "8xKp", chain: "solana" },
      }),
      expect.any(Object),
    );
  });
});

describe("segmentoTag — queue before init", () => {
  it("queues events and replays on initAnalytics", async () => {
    vi.resetModules();
    const { initAnalytics, segmentoTag } = await import("./index.js");

    segmentoTag("signup", { plan: "free" });
    segmentoTag("clicked_cta");

    const beforeInit = mockCollect.mock.calls.map((c) => c[0].eventName);
    expect(beforeInit).not.toContain("signup");

    initAnalytics("proj_test");

    const afterInit = mockCollect.mock.calls.map((c) => c[0].eventName);
    expect(afterInit).toContain("signup");
    expect(afterInit).toContain("clicked_cta");
  });
});
