/** Data produced when a user signs the referral message with their Solana wallet */
export interface SolanaWalletPayload {
  /** Base58-encoded public key of the signing wallet */
  address: string;
  /** The plaintext message that was signed */
  message: string;
  /** Base58-encoded signature bytes */
  signature: string;
  /** Unix timestamp (ms) at the moment of signing */
  ts: number;
}

/** Minimal interface representing a Solana wallet adapter */
export interface WalletAdapter {
  publicKey: { toBase58(): string } | null;
  signMessage(message: Uint8Array): Promise<Uint8Array | { signature: Uint8Array }>;
}

export interface SegmentoConfig {
  /** Token identifying your project, issued by Segmento */
  segmentoToken: string;
  /** Human-readable project name shown inside the sign message */
  projectName: string;
  /** Whether a Telegram username must be collected and submitted */
  telegramRequired: boolean;
  /** Whether an email address must be collected and submitted */
  emailRequired: boolean;
  /** Whether a Solana wallet signature must be collected and submitted */
  walletRequired: boolean;
  /** Override the Segmento API endpoint (defaults to the hosted API) */
  endpoint?: string;
  /** Override the fetch implementation (defaults to global fetch) */
  fetchImpl?: typeof fetch;
}

export interface CreateReferralParams {
  telegram?: string;
  email?: string;
  /** Required when walletRequired is true */
  wallet?: WalletAdapter;
}

export interface ReferralPayload {
  segmento_token: string;
  telegram?: string;
  email?: string;
  wallet?: SolanaWalletPayload;
}

export interface ReferralResponse {
  referral_code: string;
}
