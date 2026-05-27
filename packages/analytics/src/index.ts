import { init as trackerInit, track as trackerTrack } from "./tracker.js";
import type { ApiOptions } from "@segmento/core";

type QueuedEvent = [string, Record<string, unknown> | undefined];

let initialized = false;
const queue: QueuedEvent[] = [];

export function initAnalytics(
  projectId: string,
  options?: ApiOptions,
): void {
  trackerInit(projectId, options);
  initialized = true;
  for (const [name, props] of queue.splice(0)) {
    trackerTrack(name, props);
  }
}

export function segmentoTag(
  name: string,
  properties?: Record<string, unknown>,
): void {
  if (!initialized) {
    queue.push([name, properties]);
    return;
  }
  trackerTrack(name, properties);
}
