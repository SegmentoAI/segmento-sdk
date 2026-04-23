export { SegmentoClient } from "./SegmentoClient.js";
export { submitLead, redeemReferral } from "./api.js";
export { encodeToken, decodeToken } from "./token.js";
export { getReferralCode, REFERRAL_PARAM } from "./referral.js";
export type { TokenPayload } from "./token.js";
export type { ApiOptions, SolanaWalletProof, SubmitLeadRequest, WalletProof } from "./types.js";
export { setSessionCookie, getSessionCookie, clearSessionCookie } from "./cookies.js";
