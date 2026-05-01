import type { ApiOptions, CaptureLeadOptions, SubmitLeadRequest, TrackWalletConnectOptions, TrackWalletTransactionOptions } from "./types.js";

const DEFAULT_BASE_URL = "https://referral.segmento.tech/manager-api";

function getBaseUrl(options: ApiOptions): string {
  return (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
}

export async function submitLead(
  request: SubmitLeadRequest,
  options: ApiOptions = {},
): Promise<void> {
  const baseUrl = getBaseUrl(options);
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
  const baseUrl = getBaseUrl(options);
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

export async function captureLead(
  options: CaptureLeadOptions,
  apiOptions: ApiOptions = {},
): Promise<void> {
  const baseUrl = getBaseUrl(apiOptions);
  const fetchImpl = apiOptions.fetchImpl ?? fetch;

  const response = await fetchImpl(`${baseUrl}/capture-lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      project_id: options.projectId,
      referral_code: options.referralCode,
      email: options.email,
      telegram: options.telegram,
      origin_url: options.originUrl,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new Error(`Segmento API error ${response.status}: ${text}`);
  }
}

export function trackWalletConnect(
  options: TrackWalletConnectOptions,
  apiOptions: ApiOptions = {},
): void {
  const baseUrl = getBaseUrl(apiOptions);
  const fetchImpl = apiOptions.fetchImpl ?? fetch;

  fetchImpl(`${baseUrl}/wallet-connect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      project_id: options.projectId,
      origin_url: options.originUrl,
      wallet_address: options.walletAddress,
      referral_code: options.referralCode,
      meta: options.meta,
    }),
  }).catch(() => {});
}

export function trackWalletTransaction(
  options: TrackWalletTransactionOptions,
  apiOptions: ApiOptions = {},
): void {
  const baseUrl = getBaseUrl(apiOptions);
  const fetchImpl = apiOptions.fetchImpl ?? fetch;

  const { tx, meta, ...rest } = options;
  const combinedMeta = tx ? { tx, ...meta } : meta;

  fetchImpl(`${baseUrl}/wallet-transaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      project_id: rest.projectId,
      origin_url: rest.originUrl,
      wallet_address: rest.walletAddress,
      referral_code: rest.referralCode,
      meta: combinedMeta,
    }),
  }).catch(() => {});
}
