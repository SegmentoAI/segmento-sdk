export { SegmentoModal } from "./SegmentoModal.js";
export type { SegmentoModalOptions, RequiredFieldsConfig } from "./SegmentoModal.js";

import { SegmentoModal, _defaultConfig } from "./SegmentoModal.js";
import type { RequiredFieldsConfig } from "./SegmentoModal.js";

/**
 * Registers the `<segmento-modal>` custom element and sets the default
 * required-field behaviour applied to every modal instance.
 *
 * @example
 * defineSegmentoModal({ emailRequired: true, walletRequired: true });
 * // All SegmentoModal instances will now require email and a wallet signature
 */
export function defineSegmentoModal(config: RequiredFieldsConfig = {}): void {
  Object.assign(_defaultConfig, config);

  if (typeof customElements !== "undefined" && !customElements.get("segmento-modal")) {
    customElements.define("segmento-modal", SegmentoModal);
  }
}
