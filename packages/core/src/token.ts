/** Shape of the data encoded inside a Segmento project token */
export interface TokenPayload {
  /** Token format version */
  v: 1;
  /** Unique project identifier */
  pid: string;
  /** Human-readable project name */
  name: string;
  /** FNV-1a (32-bit) checksum of "1:{pid}:{name}" encoded as 8-char lowercase hex */
  chk: string;
}

/**
 * Decodes and validates a Segmento project token.
 * Throws a descriptive error if the token is malformed or the checksum is wrong.
 */
export function decodeToken(token: string): TokenPayload {
  let json: string;
  try {
    json = atob(base64urlToBase64(token));
  } catch {
    throw new Error("Invalid Segmento token: not valid base64url");
  }

  let payload: unknown;
  try {
    payload = JSON.parse(json);
  } catch {
    throw new Error("Invalid Segmento token: payload is not valid JSON");
  }

  assertTokenPayload(payload);

  const expectedChk = fnv1a32(`${payload.v}:${payload.pid}:${payload.name}`);
  if (payload.chk !== expectedChk) {
    throw new Error("Invalid Segmento token: checksum mismatch");
  }

  return payload;
}

/**
 * Encodes a project token. Intended for use in your backend/dashboard when
 * issuing tokens to SDK users — not needed at runtime in the browser.
 */
export function encodeToken(pid: string, name: string): string {
  const payload: TokenPayload = {
    v: 1,
    pid,
    name,
    chk: fnv1a32(`1:${pid}:${name}`),
  };
  return base64ToBase64url(btoa(JSON.stringify(payload)));
}

// ── Validation ────────────────────────────────────────────────────────────────

function assertTokenPayload(value: unknown): asserts value is TokenPayload {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid Segmento token: payload must be a JSON object");
  }
  const p = value as Record<string, unknown>;

  if (p["v"] !== 1) {
    throw new Error(`Invalid Segmento token: unsupported version "${p["v"]}"`);
  }
  if (!p["pid"] || typeof p["pid"] !== "string") {
    throw new Error("Invalid Segmento token: missing or invalid field \"pid\"");
  }
  if (!p["name"] || typeof p["name"] !== "string") {
    throw new Error("Invalid Segmento token: missing or invalid field \"name\"");
  }
  if (!p["chk"] || typeof p["chk"] !== "string") {
    throw new Error("Invalid Segmento token: missing or invalid field \"chk\"");
  }
}

// ── Checksum: FNV-1a 32-bit ───────────────────────────────────────────────────

function fnv1a32(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    // Multiply by FNV prime (0x01000193) using 32-bit arithmetic
    hash = (Math.imul(hash, 0x01000193) >>> 0);
  }
  return hash.toString(16).padStart(8, "0");
}

// ── Base64url helpers ─────────────────────────────────────────────────────────

function base64urlToBase64(s: string): string {
  return s.replace(/-/g, "+").replace(/_/g, "/").padEnd(
    s.length + ((4 - (s.length % 4)) % 4),
    "=",
  );
}

function base64ToBase64url(s: string): string {
  return s.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
