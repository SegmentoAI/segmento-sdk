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

export interface ApiOptions {
  /** Base URL of the Segmento backend (defaults to the hosted API) */
  baseUrl?: string;
  /** Override the fetch implementation (defaults to global fetch) */
  fetchImpl?: typeof fetch;
}
