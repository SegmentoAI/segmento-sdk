import { collectEvent } from "@segmento/core";
import type { ApiOptions } from "@segmento/core";
import {
  getSessionId,
  captureFromUrl,
  getReferralCode,
  getUtms,
} from "./session.js";

interface TrackerState {
  projectId: string;
  options: ApiOptions;
}

let state: TrackerState | null = null;
let historyPatched = false;

export function init(projectId: string, options: ApiOptions = {}): void {
  if (typeof window === "undefined") return;
  state = { projectId, options };
  captureFromUrl();
  pageview();
  patchHistory();
}

export function pageview(): void {
  if (!state) return;
  collectEvent(
    {
      projectId: state.projectId,
      eventType: "pageview",
      sessionId: getSessionId(),
      pageUrl: window.location.href,
      pageReferrer: document.referrer || undefined,
      pageTitle: document.title,
      referralCode: getReferralCode() ?? undefined,
      ...getUtms(),
    },
    state.options,
  );
}

export function track(
  name: string,
  properties?: Record<string, unknown>,
): void {
  if (!state) return;
  collectEvent(
    {
      projectId: state.projectId,
      eventType: "custom",
      eventName: name,
      sessionId: getSessionId(),
      pageUrl: window.location.href,
      pageReferrer: document.referrer || undefined,
      pageTitle: document.title,
      referralCode: getReferralCode() ?? undefined,
      properties: properties as Record<string, string | number | boolean>,
      ...getUtms(),
    },
    state.options,
  );
}

function patchHistory(): void {
  if (historyPatched || typeof history === "undefined") return;
  historyPatched = true;

  const wrap =
    (original: typeof history.pushState) =>
    function (
      this: History,
      ...args: Parameters<typeof history.pushState>
    ): void {
      original.apply(this, args);
      pageview();
    };

  history.pushState = wrap(history.pushState);
  window.addEventListener("popstate", pageview);
}
