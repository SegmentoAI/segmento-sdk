# @segmento/waitlist-ui

Drop-in referral modal for the [Segmento](https://segmento.tech) SDK. A shadow-DOM custom element that handles wallet connect, message signing, and lead submission — no framework required.

## Installation

```bash
npm install @segmento/waitlist-ui @segmento/core @segmento/lead
```

## Usage

```ts
import { SegmentoClient } from "@segmento/core";
import { defineSegmentoModal, SegmentoModal } from "@segmento/waitlist-ui";

// Initialise once — stored globally, no need to pass it to the modal
SegmentoClient.init("your_project_token");

// Register the custom element and set required fields
defineSegmentoModal({
  emailRequired:    true,
  walletRequired:   true,
  telegramRequired: false,
});

// Create the modal — client is resolved automatically from the global instance
const modal = new SegmentoModal({
  onSuccess: () => console.log("Lead submitted!"),
  onClose:   () => console.log("Modal closed"),
});

// Open on demand
document.getElementById("join-btn").addEventListener("click", () => modal.open());
```

## Configuration

### `defineSegmentoModal(config?)`

Sets defaults applied to every modal instance. Call once at app startup.

| Option | Type | Default | Description |
|---|---|---|---|
| `emailRequired` | `boolean` | `false` | Email must be filled before submitting |
| `telegramRequired` | `boolean` | `false` | Telegram handle must be filled |
| `walletRequired` | `boolean` | `false` | Wallet must be connected and signed |

### `new SegmentoModal(options)`

Per-instance options (extend `RequiredFieldsConfig`):

| Option | Type | Required | Description |
|---|---|---|---|
| `client` | `SegmentoClient` | No | Client instance. Defaults to the global set by `SegmentoClient.init()` |
| `onConnectWallet` | `() => Promise<WalletAdapter>` | No | Custom wallet connection. Defaults to `window.solana` |
| `title` | `string` | No | Modal heading (default: `"Join the waitlist"`) |
| `onSuccess` | `() => void` | No | Called after successful submission |
| `onClose` | `() => void` | No | Called when modal is dismissed |

### Theming

All colors are CSS strings and optional.

| Option | Default | Description |
|---|---|---|
| `bgColor` | `#0c1117` | Modal background |
| `primaryColor` | `#5ee9b5` | Submit button, focus rings, wallet button |
| `secondaryColor` | `#5ee9b5` | Success states, signed wallet button |
| `textColor` | `#f0f6fc` | Headings and input values |
| `labelColor` | `#6b7f99` | Field labels and muted text |

```ts
defineSegmentoModal({
  bgColor:      "#18181b",
  primaryColor: "#6366f1",
});
```

## Referral codes

The modal automatically reads `?ref=` from the current URL and includes it in the submission. No extra setup needed.

## Browser support

Uses native `<dialog>` (top layer) and shadow DOM. Works in all modern browsers.
