import {
  getReferralCode,
  setSessionCookie,
  getSessionCookie,
  redeemReferral,
} from "@segmento/core";
import type { ApiOptions } from "@segmento/core";

const REF_COOKIE = "sgm_ref";
const IMPRESSION_COOKIE = "sgm_impression_sent";

export function segmentoAnalytics(options: ApiOptions = {}): void {
  const ref = getReferralCode();
  if (ref) {
    setSessionCookie(REF_COOKIE, ref);
  }

  if (getSessionCookie(IMPRESSION_COOKIE)) {
    return;
  }

  setSessionCookie(IMPRESSION_COOKIE, "1");
  redeemReferral(window.location.href, options);
}
