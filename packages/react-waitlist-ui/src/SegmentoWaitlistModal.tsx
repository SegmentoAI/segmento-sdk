import { useEffect, useRef } from "react";
import { SegmentoModal } from "@segmento/waitlist-ui";
import type { SegmentoModalOptions } from "@segmento/waitlist-ui";

export interface SegmentoWaitlistModalProps extends SegmentoModalOptions {
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
 * <SegmentoWaitlistModal open={isOpen} onClose={() => setIsOpen(false)} />
 */
export function SegmentoWaitlistModal({ open, ...options }: SegmentoWaitlistModalProps) {
  // Keep a stable ref to the latest options so the effect closure doesn't go stale
  const optionsRef = useRef(options);
  optionsRef.current = options;

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
 * const modal = openSegmentoWaitlistModal({ emailRequired: true });
 */
export function openSegmentoWaitlistModal(options: SegmentoModalOptions = {}): SegmentoModal {
  registerCustomElement();
  const modal = new SegmentoModal(options);
  modal.open();
  return modal;
}
