import { describe, it, expect, vi } from "vitest";
import { submitLead } from "./api.js";

describe("submitLead", () => {
  it("POSTs to correct URL with serialized body", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });

    await submitLead(
      { project_id: "proj-1", email: "a@b.com" },
      { baseUrl: "https://test.api", fetchImpl: mockFetch },
    );

    expect(mockFetch).toHaveBeenCalledWith(
      "https://test.api/lead",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: "proj-1", email: "a@b.com" }),
      }),
    );
  });

  it("uses default base URL when none provided", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    await submitLead({ project_id: "x" }, { fetchImpl: mockFetch });
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toMatch(/^https:\/\//);
    expect(url).toMatch(/\/lead$/);
  });

  it("throws with status and body on non-ok response", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      text: async () => "Unprocessable Entity",
      statusText: "Unprocessable Entity",
    });

    await expect(
      submitLead({ project_id: "x" }, { fetchImpl: mockFetch }),
    ).rejects.toThrow("Segmento API error 422: Unprocessable Entity");
  });

  it("falls back to statusText when response body unreadable", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => { throw new Error("stream error"); },
      statusText: "Internal Server Error",
    });

    await expect(
      submitLead({ project_id: "x" }, { fetchImpl: mockFetch }),
    ).rejects.toThrow("Segmento API error 500: Internal Server Error");
  });
});
