export {
  SegmentoClient,
  captureLead,
  trackWalletConnect,
  trackWalletTransaction,
  sendImpression,
} from "./SegmentoClient.js";
export { submitLead, redeemReferral, collectEvent, sendHeartbeat } from "./api.js";
export { encodeToken, decodeToken } from "./token.js";
export { getReferralCode, REFERRAL_PARAM } from "./referral.js";
export type { TokenPayload } from "./token.js";
export type {
  AnalyticsEvent,
  ApiOptions,
  CaptureLeadOptions,
  CollectEventOptions,
  HeartbeatOptions,
  SolanaWalletProof,
  SubmitLeadRequest,
  WalletProof,
} from "./types.js";
export {
  setSessionCookie,
  getSessionCookie,
  clearSessionCookie,
} from "./cookies.js";
