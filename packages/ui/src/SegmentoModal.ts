import { signMessage, getSignMessage } from "@segmento/lead";
import type { WalletAdapter } from "@segmento/lead";
import type { SegmentoClient } from "@segmento/core";

export interface RequiredFieldsConfig {
  /** Telegram field must be filled before submitting. Default: false */
  telegramRequired?: boolean;
  /** Email field must be filled before submitting. Default: false */
  emailRequired?: boolean;
  /** Wallet must be connected and message signed before submitting. Default: false */
  walletRequired?: boolean;
  /** Modal background color. Default: #0f172b */
  bgColor?: string;
  /** Primary action color — submit button, focus rings, required markers. Default: #5ee9b5 */
  primaryColor?: string;
  /** Secondary color — success states, signed wallet button. Default: #f472b6 */
  secondaryColor?: string;
  /** Main text color — headings and input values. Default: #f1f5f9 */
  textColor?: string;
  /** Label / muted text color — field labels, placeholders, status text. Default: #94a3b8 */
  labelColor?: string;
}

export interface SegmentoModalOptions extends RequiredFieldsConfig {
  /** Initialised SegmentoClient instance */
  client: SegmentoClient;
  /** Called when the user clicks "Connect Wallet". Should resolve with a WalletAdapter. */
  onConnectWallet: () => Promise<WalletAdapter>;
  /** Modal heading. Defaults to "Join the referral program". */
  title?: string;
  /** Called after the lead is successfully submitted. */
  onSuccess?: () => void;
  /** Called when the modal is closed before completing. */
  onClose?: () => void;
}

type WalletState = "disconnected" | "connected" | "signed";

/** Mutated once by defineSegmentoModal() — do not modify directly */
export const _defaultConfig: RequiredFieldsConfig = {};

export class SegmentoModal extends HTMLElement {
  private shadow: ShadowRoot;
  private opts: SegmentoModalOptions;
  private wallet: WalletAdapter | null = null;
  private walletState: WalletState = "disconnected";
  private signedPayload: Awaited<ReturnType<typeof signMessage>> | null = null;

  constructor(options: SegmentoModalOptions) {
    super();
    // Merge module-level defaults so per-instance options take precedence
    this.opts = { ..._defaultConfig, ...options };
    this.shadow = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.bindEvents();
  }

  open() {
    if (this.parentElement !== document.body) {
      document.body.appendChild(this);
    }
    this.shadow.querySelector("dialog")?.showModal();
  }

  close() {
    this.shadow.querySelector("dialog")?.close();
    this.opts.onClose?.();
  }

  // ── Render ────────────────────────────────────────────────────────────────

  private render() {
    const { telegramRequired, emailRequired, walletRequired } = this.opts;
    const title = this.opts.title ?? "Join the referral program";
    const req = (flag?: boolean) =>
      flag ? ' <span style="color:#ef4444">*</span>' : "";

    const bgColor        = this.opts.bgColor        ?? "#18181b";
    const primaryColor   = this.opts.primaryColor   ?? "#6366f1";
    const secondaryColor = this.opts.secondaryColor ?? "#10b981";
    const textColor      = this.opts.textColor      ?? "#fafafa";
    const labelColor     = this.opts.labelColor     ?? "#71717a";

    this.shadow.innerHTML = /* html */ `
      <style>
        *, *::before, *::after { box-sizing: border-box; }
        :host {
          display: contents;
          --sg-bg:        ${bgColor};
          --sg-primary:   ${primaryColor};
          --sg-secondary: ${secondaryColor};
          --sg-text:      ${textColor};
          --sg-label:     ${labelColor};
        }

        dialog {
          border: none; border-radius: 14px; padding: 28px 28px 24px;
          width: calc(100% - 32px); max-width: 420px;
          background: var(--sg-bg);
          box-shadow: 0 24px 64px rgba(0,0,0,0.22);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        dialog::backdrop { background: rgba(0,0,0,0.55); }

        .modal-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px;
        }
        .modal-title { margin: 0; font-size: 18px; font-weight: 700; color: var(--sg-text); }

        .close-btn {
          background: none; border: none; cursor: pointer;
          color: var(--sg-label); font-size: 20px; line-height: 1; padding: 2px 4px;
        }
        .close-btn:hover { color: var(--sg-text); }

        .field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }
        .field-label { font-size: 13px; font-weight: 500; color: var(--sg-label); }

        .field-input {
          padding: 9px 11px;
          border: 1.5px solid color-mix(in srgb, var(--sg-text) 15%, transparent);
          border-radius: 8px;
          font-size: 14px; color: var(--sg-text);
          background: color-mix(in srgb, var(--sg-bg) 80%, black);
          outline: none; transition: border-color 0.15s;
        }
        .field-input:focus { border-color: var(--sg-primary); }
        .field-input.err   { border-color: #ef4444; }
        .field-input::placeholder { color: var(--sg-label); opacity: 0.5; }

        .field-error { font-size: 12px; color: #ef4444; display: none; }
        .field-error.show { display: block; }

        .divider { border: none; border-top: 1px solid #1e293b; margin: 16px 0; }

        .btn {
          display: block; width: 100%; padding: 11px 16px;
          border: none; border-radius: 9px;
          font-size: 14px; font-weight: 600; cursor: pointer;
          transition: background 0.15s, opacity 0.15s;
        }
        .btn + .btn { margin-top: 8px; }
        .btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .btn-wallet {
          background: color-mix(in srgb, var(--sg-primary) 8%, white);
          color: var(--sg-primary);
          border: 1.5px solid color-mix(in srgb, var(--sg-primary) 22%, white);
        }
        .btn-wallet:hover:not(:disabled) {
          background: color-mix(in srgb, var(--sg-primary) 15%, white);
        }
        .btn-wallet.signed {
          background: color-mix(in srgb, var(--sg-secondary) 10%, white);
          color: var(--sg-secondary);
          border-color: color-mix(in srgb, var(--sg-secondary) 28%, white);
          cursor: default;
        }

        .sign-preview {
          display: none; margin-bottom: 10px; padding: 12px 14px;
          background: color-mix(in srgb, var(--sg-bg) 80%, black);
          border: 1px solid color-mix(in srgb, var(--sg-text) 12%, transparent);
          border-radius: 8px;
          font-size: 12px; line-height: 1.6; color: var(--sg-label); white-space: pre-wrap;
        }
        .sign-preview.show { display: block; }
        .sign-preview a { color: var(--sg-primary); }

        .btn-submit { background: var(--sg-primary); color: #ffffff; margin-top: 10px; }
        .btn-submit:hover:not(:disabled) {
          background: color-mix(in srgb, var(--sg-primary) 85%, black);
        }

        .status { margin-top: 12px; font-size: 13px; text-align: center; min-height: 18px; color: var(--sg-label); }
        .status.ok  { color: var(--sg-secondary); }
        .status.err { color: #dc2626; }
      </style>

      <dialog aria-labelledby="sg-title">
        <div class="modal-header">
          <h2 class="modal-title" id="sg-title">${escapeHtml(title)}</h2>
          <button class="close-btn" aria-label="Close">&#x2715;</button>
        </div>

        <div class="field">
          <label class="field-label" for="sg-email">Email${req(emailRequired)}</label>
          <input class="field-input" id="sg-email" type="email" placeholder="you@example.com" autocomplete="email" />
          <span class="field-error" id="sg-email-err"></span>
        </div>

        <div class="field">
          <label class="field-label" for="sg-telegram">Telegram username${req(telegramRequired)}</label>
          <input class="field-input" id="sg-telegram" type="text" placeholder="@username" autocomplete="off" />
          <span class="field-error" id="sg-telegram-err"></span>
        </div>

        <hr class="divider" />

        <div class="sign-preview" id="sg-sign-preview"></div>
        <button class="btn btn-wallet" id="sg-wallet-btn">
          ${walletRequired ? "Connect Wallet *" : "Connect Wallet"}
        </button>
        <button class="btn btn-submit" id="sg-submit-btn" disabled>Submit</button>

        <div class="status" id="sg-status"></div>
      </dialog>
    `;
  }

  // ── Events ────────────────────────────────────────────────────────────────

  private bindEvents() {
    const $ = <T extends Element>(sel: string) =>
      this.shadow.querySelector<T>(sel)!;

    $(".close-btn").addEventListener("click", () => this.close());
    $("#sg-wallet-btn").addEventListener("click", () =>
      this.handleWalletClick(),
    );
    $("#sg-submit-btn").addEventListener("click", () => this.handleSubmit());

    // Re-evaluate submit state on every keystroke
    $("#sg-email").addEventListener("input", () => this.updateSubmitBtn());
    $("#sg-telegram").addEventListener("input", () => this.updateSubmitBtn());
  }

  // ── Submit button state ───────────────────────────────────────────────────

  private updateSubmitBtn() {
    const { telegramRequired, emailRequired, walletRequired } = this.opts;

    const email =
      this.shadow.querySelector<HTMLInputElement>("#sg-email")?.value.trim() ??
      "";
    const telegram =
      this.shadow
        .querySelector<HTMLInputElement>("#sg-telegram")
        ?.value.trim() ?? "";
    const signed = this.walletState === "signed";

    const requiredSatisfied =
      (!telegramRequired || !!telegram) &&
      (!emailRequired || !!email) &&
      (!walletRequired || signed);

    const hasAtLeastOne = !!email || !!telegram || signed;

    const btn = this.shadow.querySelector<HTMLButtonElement>("#sg-submit-btn");
    if (btn) btn.disabled = !(requiredSatisfied && hasAtLeastOne);
  }

  // ── Wallet flow ───────────────────────────────────────────────────────────

  private async handleWalletClick() {
    if (this.walletState === "signed") return;

    const btn = this.shadow.querySelector<HTMLButtonElement>("#sg-wallet-btn")!;
    const status = this.shadow.querySelector<HTMLDivElement>("#sg-status")!;

    if (this.walletState === "disconnected") {
      btn.disabled = true;
      btn.textContent = "Connecting…";
      status.textContent = "";
      status.className = "status";

      try {
        this.wallet = await this.opts.onConnectWallet();
        this.walletState = "connected";
        btn.textContent = "Sign Message";
        btn.disabled = false;
        status.textContent = `Wallet connected: ${this.wallet.publicKey?.toBase58().slice(0, 8)}…`;
        status.className = "status ok";

        // Show the exact message the user is about to sign
        const preview =
          this.shadow.querySelector<HTMLDivElement>("#sg-sign-preview")!;
        const msg = getSignMessage(this.opts.client.projectName);
        const tc =
          "https://github.com/SegmentoAI/terms-and-conditions/blob/v1.0/terms.md";
        preview.innerHTML = escapeHtml(msg).replace(
          escapeHtml(tc),
          `<a href="${tc}" target="_blank" rel="noopener">${tc}</a>`,
        );
        preview.classList.add("show");
      } catch (err: unknown) {
        btn.textContent = "Connect Wallet";
        btn.disabled = false;
        status.textContent = `Could not connect: ${errorMessage(err)}`;
        status.className = "status err";
      }
      return;
    }

    // walletState === "connected" → sign
    btn.disabled = true;
    btn.textContent = "Waiting for signature…";
    status.textContent = "";
    status.className = "status";

    try {
      this.signedPayload = await signMessage(
        this.wallet!,
        this.opts.client.projectName,
      );
      this.walletState = "signed";
      btn.textContent = "✓ Message Signed";
      btn.classList.add("signed");
      status.textContent = "Message signed — ready to submit";
      status.className = "status ok";
      this.updateSubmitBtn();
    } catch (err: unknown) {
      btn.textContent = "Sign Message";
      btn.disabled = false;
      status.textContent = `Signing failed: ${errorMessage(err)}`;
      status.className = "status err";
    }
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  private async handleSubmit() {
    if (!this.validate()) return;

    const submitBtn =
      this.shadow.querySelector<HTMLButtonElement>("#sg-submit-btn")!;
    const status = this.shadow.querySelector<HTMLDivElement>("#sg-status")!;

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";
    status.textContent = "";
    status.className = "status";

    try {
      const email = this.shadow
        .querySelector<HTMLInputElement>("#sg-email")!
        .value.trim();
      const telegram = this.shadow
        .querySelector<HTMLInputElement>("#sg-telegram")!
        .value.trim();

      await this.opts.client.submitLead({
        email: email || undefined,
        telegram: telegram || undefined,
        solana_wallet: this.signedPayload
          ? {
              wallet_address: this.signedPayload.address,
              message: this.signedPayload.message,
              signature: this.signedPayload.signature,
              timestamp: this.signedPayload.ts,
            }
          : undefined,
      });

      status.textContent = "Lead submitted successfully!";
      status.className = "status ok";
      submitBtn.textContent = "✓ Submitted";
      this.opts.onSuccess?.();
    } catch (err: unknown) {
      status.textContent = `Submission failed: ${errorMessage(err)}`;
      status.className = "status err";
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit";
    }
  }

  // ── Validation ────────────────────────────────────────────────────────────

  private validate(): boolean {
    const { telegramRequired, emailRequired } = this.opts;
    let ok = true;

    const emailInput =
      this.shadow.querySelector<HTMLInputElement>("#sg-email")!;
    const emailErr =
      this.shadow.querySelector<HTMLSpanElement>("#sg-email-err")!;
    const emailVal = emailInput.value.trim();

    if (
      emailRequired &&
      (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal))
    ) {
      emailInput.classList.add("err");
      emailErr.textContent = "A valid email is required";
      emailErr.classList.add("show");
      ok = false;
    } else if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      // Optional but filled with invalid format
      emailInput.classList.add("err");
      emailErr.textContent = "Please enter a valid email";
      emailErr.classList.add("show");
      ok = false;
    } else {
      emailInput.classList.remove("err");
      emailErr.classList.remove("show");
    }

    const telegramInput =
      this.shadow.querySelector<HTMLInputElement>("#sg-telegram")!;
    const telegramErr =
      this.shadow.querySelector<HTMLSpanElement>("#sg-telegram-err")!;

    if (telegramRequired && !telegramInput.value.trim()) {
      telegramInput.classList.add("err");
      telegramErr.textContent = "Telegram username is required";
      telegramErr.classList.add("show");
      ok = false;
    } else {
      telegramInput.classList.remove("err");
      telegramErr.classList.remove("show");
    }

    return ok;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
