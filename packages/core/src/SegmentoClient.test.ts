import { describe, it, expect, beforeEach, vi } from "vitest";
import { SegmentoClient } from "./SegmentoClient.js";
import { encodeToken } from "./token.js";

const token = encodeToken("proj-abc", "Test Project");

beforeEach(() => {
  vi.stubGlobal("window", {} as Window & typeof globalThis);
});

describe("SegmentoClient.init", () => {
  it("decodes token and exposes projectId and projectName", () => {
    const client = SegmentoClient.init(token);
    expect(client.projectId).toBe("proj-abc");
    expect(client.projectName).toBe("Test Project");
  });

  it("stores instance on window.__segmento", () => {
    const client = SegmentoClient.init(token);
    expect((window as unknown as Record<string, unknown>)["__segmento"]).toBe(client);
  });

  it("throws on malformed token", () => {
    expect(() => SegmentoClient.init("not-a-token")).toThrow();
  });
});

describe("SegmentoClient.getInstance", () => {
  it("returns null when init has not been called", () => {
    expect(SegmentoClient.getInstance()).toBeNull();
  });

  it("returns the last init instance", () => {
    const client = SegmentoClient.init(token);
    expect(SegmentoClient.getInstance()).toBe(client);
  });
});

describe("SegmentoClient.submitLead", () => {
  it("injects project_id from token and calls API", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    const client = SegmentoClient.init(token, { fetchImpl: mockFetch });

    await client.submitLead({ email: "a@b.com" });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.project_id).toBe("proj-abc");
    expect(body.email).toBe("a@b.com");
  });

  it("throws on API error", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => "Bad Request",
      statusText: "Bad Request",
    });
    const client = SegmentoClient.init(token, { fetchImpl: mockFetch });
    await expect(client.submitLead({})).rejects.toThrow("Segmento API error 400");
  });
});
