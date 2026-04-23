import type { ApiOptions, SubmitLeadRequest } from "./types.js";

const DEFAULT_BASE_URL = "https://referral.segmento.tech/manager-api";

export async function submitLead(
  request: SubmitLeadRequest,
  options: ApiOptions = {},
): Promise<void> {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  const fetchImpl = options.fetchImpl ?? fetch;

  const response = await fetchImpl(`${baseUrl}/lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new Error(`Segmento API error ${response.status}: ${text}`);
  }
}

export async function redeemReferral(
  url: string,
  options: ApiOptions = {},
): Promise<void> {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  const fetchImpl = options.fetchImpl ?? fetch;

  const response = await fetchImpl(`${baseUrl}/redeem`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new Error(`Segmento API error ${response.status}: ${text}`);
  }
}
