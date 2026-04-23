import { segmentoAnalytics } from "./segmentoAnalytics.js";

const script = document.currentScript as HTMLScriptElement | null;
const baseUrl = script?.dataset.apiUrl;

segmentoAnalytics(baseUrl ? { baseUrl } : {});
