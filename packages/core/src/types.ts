export type MetaValue = string | number | boolean;

/** Generic signed wallet proof — chain-agnostic shape passed through lead submissions */
export interface WalletProof {
  /** Wallet address (chain-specific encoding, e.g. base58 for Solana) */
  address: string;
  /** Plaintext message that was signed */
  message: string;
  /** Encoded signature bytes */
  signature: string;
  /** Unix timestamp (ms) at time of signing */
  ts: number;
}

export interface SolanaWalletProof {
  wallet_address: string;
  message: string;
  timestamp: number;
  signature: string;
}

export interface SubmitLeadRequest {
  project_id: string;
  /** Referral code from the URL — omit if not present */
  referral_code?: string;
  email?: string;
  telegram?: string;
  solana_wallet?: SolanaWalletProof;
}

export interface TrackWalletConnectOptions {
  projectId: string;
  originUrl: string;
  walletAddress?: string;
  walletChain?: string;
  referralCode?: string;
  meta?: Record<string, MetaValue>;
}

export interface TrackWalletTransactionOptions {
  projectId: string;
  originUrl: string;
  walletAddress?: string;
  walletChain?: string;
  referralCode?: string;
  tx?: string;
  meta?: Record<string, MetaValue>;
}

export interface CaptureLeadOptions {
  projectId: string;
  referralCode?: string;
  email?: string;
  telegram?: string;
  originUrl?: string;
  meta?: Record<string, MetaValue>;
}

export interface CollectEventOptions {
  projectId: string;
  eventType: string;
  eventName?: string;
  sessionId?: string;
  pageUrl: string;
  pageReferrer?: string;
  pageTitle?: string;
  referralCode?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  properties?: Record<string, MetaValue>;
}

export interface AnalyticsEvent {
  id: string;
  project_id: string;
  event_type: string;
  event_name: string | null;
  session_id: string | null;
  page_url: string;
  hostname: string;
  page_referrer: string | null;
  page_title: string | null;
  referral_code: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  country_code: string | null;
  ip_hash: string | null;
  ua_string_hash: string | null;
  browser: string | null;
  os: string | null;
  device_type: string | null;
  properties: Record<string, unknown> | null;
  created_at: string;
}

export interface ApiOptions {
  /** Base URL of the Segmento backend (defaults to the hosted API) */
  baseUrl?: string;
  /** Base URL for the analytics collect endpoint (defaults to the hosted analytics API) */
  analyticsUrl?: string;
  /** Override the fetch implementation (defaults to global fetch) */
  fetchImpl?: typeof fetch;
}
