import { describe, it, expect } from "vitest";
import { encodeToken, decodeToken } from "./token.js";

function toBase64url(s: string): string {
  return s.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

describe("encodeToken / decodeToken", () => {
  it("roundtrip: encodes then decodes correctly", () => {
    const token = encodeToken("proj-123", "My Project");
    const decoded = decodeToken(token);
    expect(decoded.v).toBe(1);
    expect(decoded.pid).toBe("proj-123");
    expect(decoded.name).toBe("My Project");
  });

  it("different projects produce different tokens", () => {
    expect(encodeToken("a", "A")).not.toBe(encodeToken("b", "B"));
  });

  it("throws on invalid base64url", () => {
    expect(() => decodeToken("!!!")).toThrow("not valid base64url");
  });

  it("throws on non-JSON payload", () => {
    const bad = toBase64url(btoa("not json"));
    expect(() => decodeToken(bad)).toThrow("not valid JSON");
  });

  it("throws on unsupported version", () => {
    const bad = toBase64url(btoa(JSON.stringify({ v: 2, pid: "x", name: "y", chk: "00000000" })));
    expect(() => decodeToken(bad)).toThrow('unsupported version "2"');
  });

  it("throws when pid missing", () => {
    const bad = toBase64url(btoa(JSON.stringify({ v: 1, name: "y", chk: "00000000" })));
    expect(() => decodeToken(bad)).toThrow('missing or invalid field "pid"');
  });

  it("throws when name missing", () => {
    const bad = toBase64url(btoa(JSON.stringify({ v: 1, pid: "x", chk: "00000000" })));
    expect(() => decodeToken(bad)).toThrow('missing or invalid field "name"');
  });

  it("throws on checksum mismatch", () => {
    const token = encodeToken("proj-123", "My Project");
    // Re-encode with a tampered name but same checksum
    const json = atob(token.replace(/-/g, "+").replace(/_/g, "/").padEnd(
      token.length + ((4 - (token.length % 4)) % 4), "=",
    ));
    const payload = JSON.parse(json);
    payload.name = "Tampered";
    const tampered = toBase64url(btoa(JSON.stringify(payload)));
    expect(() => decodeToken(tampered)).toThrow("checksum mismatch");
  });
});
