export { SegmentoModal } from "./SegmentoModal.js";
export type { SegmentoModalOptions, RequiredFieldsConfig } from "./SegmentoModal.js";

import { SegmentoModal, _defaultConfig } from "./SegmentoModal.js";
import { SegmentoClient } from "@segmento/core";
import type { RequiredFieldsConfig } from "./SegmentoModal.js";

/**
 * Registers the `<segmento-modal>` custom element and sets the default
 * required-field behaviour applied to every modal instance.
 *
 * @example
 * defineSegmentoModal({ token: "YOUR_TOKEN", emailRequired: true });
 */
export function defineSegmentoModal(config: RequiredFieldsConfig & { token?: string } = {}): void {
  const { token, ...rest } = config;
  if (token) SegmentoClient.init(token);
  Object.assign(_defaultConfig, rest);

  if (typeof customElements !== "undefined" && !customElements.get("segmento-modal")) {
    customElements.define("segmento-modal", SegmentoModal);
  }
}
