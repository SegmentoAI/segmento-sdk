/** URL query parameter that carries the referral code */
export const REFERRAL_PARAM = "ref";

/**
 * Reads the referral code from the current page URL.
 * Returns `null` when the parameter is absent or when called outside a browser.
 *
 * @example
 * // URL: https://example.com/signup?ref=ABC123
 * getReferralCode(); // → "ABC123"
 *
 * @param param  Query parameter name to look up (defaults to "ref")
 */
export function getReferralCode(param = REFERRAL_PARAM): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(param);
}
