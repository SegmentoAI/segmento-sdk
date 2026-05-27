import { initAnalytics, segmentoTag } from "./index.js";

declare global {
  interface Window {
    segmentoTag: typeof segmentoTag;
  }
}

const script = document.currentScript as HTMLScriptElement | null;
const projectId = script?.dataset.projectId;
const analyticsUrl = script?.dataset.apiUrl;

window.segmentoTag = segmentoTag;

if (projectId) {
  initAnalytics(projectId, analyticsUrl ? { analyticsUrl } : {});
} else {
  console.warn("[Segmento] data-project-id missing on script tag");
}
