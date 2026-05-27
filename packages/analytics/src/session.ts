const SESSION_KEY = "sgm_sid";
const REF_KEY = "sgm_ref";
const UTM_KEY = "sgm_utms";

const UTM_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export interface UtmFields {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

function storage(): Storage | null {
  try {
    return typeof window !== "undefined" ? sessionStorage : null;
  } catch {
    return null;
  }
}

export function getSessionId(): string {
  const s = storage();
  if (!s) return "";
  let id = s.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    s.setItem(SESSION_KEY, id);
  }
  return id;
}

export function captureFromUrl(): void {
  const s = storage();
  if (!s) return;
  const params = new URLSearchParams(location.search);

  const ref = params.get("ref");
  if (ref) s.setItem(REF_KEY, ref);

  const utms: Record<string, string> = {};
  for (const key of UTM_PARAMS) {
    const val = params.get(key);
    if (val) utms[key] = val;
  }
  if (Object.keys(utms).length) {
    s.setItem(UTM_KEY, JSON.stringify(utms));
  }
}

export function getReferralCode(): string | null {
  return storage()?.getItem(REF_KEY) ?? null;
}

export function getUtms(): UtmFields {
  const raw = storage()?.getItem(UTM_KEY);
  if (!raw) return {};
  try {
    const stored = JSON.parse(raw) as Record<string, string>;
    return {
      utmSource: stored["utm_source"],
      utmMedium: stored["utm_medium"],
      utmCampaign: stored["utm_campaign"],
      utmTerm: stored["utm_term"],
      utmContent: stored["utm_content"],
    };
  } catch {
    return {};
  }
}
