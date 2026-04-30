import { sendImpression } from "@segmento/core";
import type { ApiOptions } from "@segmento/core";

export function segmentoAnalytics(options: ApiOptions = {}): void {
  sendImpression(options);
}
