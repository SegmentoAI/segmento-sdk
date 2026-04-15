import type { WalletProof } from "@segmento/core";

export type { WalletProof };

export interface SegmentoConfig {
  /** Token identifying your project, issued by Segmento */
  segmentoToken: string;
  /** Human-readable project name shown inside the sign message */
  projectName: string;
  /** Whether a Telegram username must be collected and submitted */
  telegramRequired: boolean;
  /** Whether an email address must be collected and submitted */
  emailRequired: boolean;
  /** Whether a wallet proof must be provided */
  walletRequired: boolean;
  /** Override the Segmento API endpoint (defaults to the hosted API) */
  endpoint?: string;
  /** Override the fetch implementation (defaults to global fetch) */
  fetchImpl?: typeof fetch;
}

export interface CreateReferralParams {
  telegram?: string;
  email?: string;
  /** Required when walletRequired is true — obtain via e.g. @segmento/solana signMessage() */
  wallet?: WalletProof;
}

export interface ReferralPayload {
  segmento_token: string;
  telegram?: string;
  email?: string;
  wallet?: WalletProof;
}

export interface ReferralResponse {
  referral_code: string;
}
