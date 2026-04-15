import type {
  CreateReferralParams,
  ReferralPayload,
  ReferralResponse,
  SegmentoConfig,
} from "./types.js";

const DEFAULT_ENDPOINT = "https://api.segmento.io/v1/referral";

/**
 * Main entry point for the Segmento referral SDK.
 *
 * @example
 * const segmento = new Segmento({
 *   segmentoToken: "your_token",
 *   telegramRequired: true,
 *   emailRequired: true,
 *   walletRequired: true,
 * });
 *
 * // Sign with e.g. @segmento/solana before calling createReferral:
 * // const walletProof = await signMessage(adapter, projectName);
 * const { referral_code } = await segmento.createReferral({
 *   telegram: "@alice",
 *   email: "alice@example.com",
 *   wallet: walletProof,
 * });
 */
export class Segmento {
  readonly config: Readonly<SegmentoConfig>;
  private readonly endpoint: string;
  private readonly fetchImpl: typeof fetch;

  constructor(config: SegmentoConfig) {
    if (!config.segmentoToken) {
      throw new Error("segmentoToken is required");
    }
    this.config = Object.freeze({ ...config });
    this.endpoint = config.endpoint ?? DEFAULT_ENDPOINT;
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  /**
   * Validates required fields and submits the lead to the Segmento backend.
   * If walletRequired, a pre-signed {@link WalletProof} must be provided in params.
   */
  async createReferral(params: CreateReferralParams): Promise<ReferralResponse> {
    const { telegramRequired, emailRequired, walletRequired } = this.config;

    if (telegramRequired && !params.telegram?.trim()) {
      throw new Error("telegram is required");
    }
    if (emailRequired && !params.email?.trim()) {
      throw new Error("email is required");
    }
    if (walletRequired && !params.wallet) {
      throw new Error("wallet is required");
    }

    const payload: ReferralPayload = {
      segmento_token: this.config.segmentoToken,
    };

    if (telegramRequired && params.telegram) {
      payload.telegram = params.telegram.trim();
    }
    if (emailRequired && params.email) {
      payload.email = params.email.trim();
    }
    if (walletRequired && params.wallet) {
      payload.wallet = params.wallet;
    }

    const response = await this.fetchImpl(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText);
      throw new Error(`Segmento API error ${response.status}: ${text}`);
    }

    return response.json() as Promise<ReferralResponse>;
  }
}
