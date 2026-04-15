import { useEffect, useRef } from "react";
import { SegmentoClient } from "@segmento/core";
import { SegmentoModal } from "@segmento/waitlist-ui";
import type { SegmentoModalOptions } from "@segmento/waitlist-ui";

export interface SegmentoWaitlistModalProps extends SegmentoModalOptions {
  /** Segmento project token. Initialises SegmentoClient on first render. */
  token: string;
  open: boolean;
}

function registerCustomElement() {
  if (typeof customElements !== "undefined" && !customElements.get("segmento-modal")) {
    customElements.define("segmento-modal", SegmentoModal);
  }
}

/**
 * React component wrapper around the Segmento waitlist modal.
 * Mount it anywhere in your tree and control visibility with the `open` prop.
 *
 * @example
 * <SegmentoWaitlistModal token="YOUR_TOKEN" open={isOpen} onClose={() => setIsOpen(false)} />
 */
export function SegmentoWaitlistModal({ token, open, ...options }: SegmentoWaitlistModalProps) {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    SegmentoClient.init(token);
  }, [token]);

  useEffect(() => {
    if (!open) return;

    registerCustomElement();
    const modal = new SegmentoModal(optionsRef.current);
    modal.open();

    return () => {
      modal.remove();
    };
  }, [open]);

  return null;
}

/**
 * Imperatively open the Segmento waitlist modal without a React component.
 * Returns the underlying SegmentoModal instance so callers can close it programmatically.
 *
 * @example
 * const modal = openSegmentoWaitlistModal("YOUR_TOKEN", { emailRequired: true });
 */
export function openSegmentoWaitlistModal(token: string, options: SegmentoModalOptions = {}): SegmentoModal {
  SegmentoClient.init(token);
  registerCustomElement();
  const modal = new SegmentoModal(options);
  modal.open();
  return modal;
}
