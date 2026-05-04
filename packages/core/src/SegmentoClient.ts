import { decodeToken } from "./token.js";
import type { TokenPayload } from "./token.js";
import { submitLead, captureLead as captureLeadRaw, trackWalletConnect as trackWalletConnectRaw, trackWalletTransaction as trackWalletTransactionRaw, redeemReferral } from "./api.js";
import { getReferralCode } from "./referral.js";
import { getSessionCookie, setSessionCookie } from "./cookies.js";
import type { ApiOptions, SubmitLeadRequest } from "./types.js";

const REF_COOKIE = "sgm_ref";
const IMPRESSION_COOKIE = "sgm_impression_sent";

export function sendImpression(options: ApiOptions = {}): void {
  const ref = getReferralCode();
  if (ref) {
    setSessionCookie(REF_COOKIE, ref);
  }

  if (getSessionCookie(IMPRESSION_COOKIE)) {
    return;
  }

  setSessionCookie(IMPRESSION_COOKIE, "1");
  if (window.location?.href) {
    redeemReferral(window.location.href, options);
  }
}

type CaptureLeadParams = {
  email?: string;
  telegram?: string;
  meta?: Record<string, unknown>;
};

type WalletConnectParams = {
  walletAddress?: string;
  meta?: Record<string, unknown>;
};

type WalletTransactionParams = {
  walletAddress?: string;
  tx?: string;
  meta?: Record<string, unknown>;
};

/**
 * Initialised Segmento client. Obtain an instance via {@link SegmentoClient.init}.
 *
 * @example
 * import { SegmentoClient } from "@segmento/core";
 *
 * // Call once — instance is stored globally and picked up by any modal automatically
 * SegmentoClient.init("your_project_token");
 */
export class SegmentoClient {
  /** Decoded project ID from the token */
  readonly projectId: string;
  /** Decoded project name from the token */
  readonly projectName: string;

  private readonly apiOptions: ApiOptions;

  private constructor(
    decoded: TokenPayload,
    apiOptions: ApiOptions,
  ) {
    this.projectId = decoded.pid;
    this.projectName = decoded.name;
    this.apiOptions = apiOptions;
  }

  /**
   * Initialises the SDK by decoding and validating the project token.
   * Throws if the token is malformed or has an invalid checksum.
   *
   * @param token  Project token generated in the Segmento dashboard
   * @param options  Optional API overrides (base URL, fetch implementation)
   */
  static init(token: string, options: ApiOptions = {}): SegmentoClient {
    const decoded = decodeToken(token);
    const instance = new SegmentoClient(decoded, options);
    (window as unknown as { __segmento: SegmentoClient }).__segmento = instance;
    sendImpression(options);
    return instance;
  }

  /** Returns the instance stored by the last {@link SegmentoClient.init} call, or null. */
  static getInstance(): SegmentoClient | null {
    return (
      (window as unknown as { __segmento?: SegmentoClient }).__segmento ?? null
    );
  }

  /** Returns the instance stored by the last {@link SegmentoClient.init} call. Throws if not initialised. */
  static getInstanceOrThrow(): SegmentoClient {
    const instance = SegmentoClient.getInstance();
    if (!instance) {
      throw new Error("SegmentoClient not initialised. Call SegmentoClient.init() first.");
    }
    return instance;
  }

  /**
   * Submits a lead to the Segmento backend. The `project_id` is injected
   * automatically from the decoded token.
   */
  async submitLead(
    request: Omit<SubmitLeadRequest, "project_id">,
  ): Promise<void> {
    return submitLead(
      { ...request, project_id: this.projectId },
      this.apiOptions,
    );
  }

  /** Captures a lead. `project_id`, `origin_url`, and `referral_code` are injected automatically. */
  captureLead(params: CaptureLeadParams = {}): Promise<void> {
    return captureLeadRaw(
      {
        projectId: this.projectId,
        originUrl: window.location.href,
        referralCode: getReferralCode() ?? getSessionCookie(REF_COOKIE) ?? undefined,
        ...params,
      },
      this.apiOptions,
    );
  }

  /** Tracks a wallet connect event. `project_id`, `origin_url`, and `referral_code` are injected automatically. */
  trackWalletConnect(params: WalletConnectParams = {}): void {
    trackWalletConnectRaw(
      {
        projectId: this.projectId,
        originUrl: window.location.href,
        referralCode: getReferralCode() ?? getSessionCookie(REF_COOKIE) ?? undefined,
        ...params,
      },
      this.apiOptions,
    );
  }

  /** Tracks a wallet transaction event. `project_id`, `origin_url`, and `referral_code` are injected automatically. */
  trackWalletTransaction(params: WalletTransactionParams = {}): void {
    trackWalletTransactionRaw(
      {
        projectId: this.projectId,
        originUrl: window.location.href,
        referralCode: getReferralCode() ?? getSessionCookie(REF_COOKIE) ?? undefined,
        ...params,
      },
      this.apiOptions,
    );
  }
}

export function captureLead(params: CaptureLeadParams = {}): Promise<void> {
  return SegmentoClient.getInstanceOrThrow().captureLead(params);
}

export function trackWalletConnect(params: WalletConnectParams = {}): void {
  SegmentoClient.getInstanceOrThrow().trackWalletConnect(params);
}

export function trackWalletTransaction(params: WalletTransactionParams = {}): void {
  SegmentoClient.getInstanceOrThrow().trackWalletTransaction(params);
}
