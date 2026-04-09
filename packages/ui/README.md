# @segmento/ui

Drop-in referral modal for the [Segmento](https://segmento.tech) SDK. A shadow-DOM custom element that handles wallet connect, message signing, and lead submission — no framework required.

## Installation

```bash
npm install @segmento/ui @segmento/core @segmento/lead
```

## Usage

```ts
import { SegmentoClient } from "@segmento/core";
import { defineSegmentoModal, SegmentoModal } from "@segmento/ui";

// Register the custom element and set required fields
defineSegmentoModal({
  emailRequired:    true,
  walletRequired:   true,
  telegramRequired: false,
});

// Initialise the client with your project token
const client = SegmentoClient.init("your_project_token");

// Create the modal
const modal = new SegmentoModal({
  client,
  onConnectWallet: async () => {
    // Return any object with publicKey.toBase58() and signMessage(bytes)
    const resp = await window.solana.connect();
    return {
      publicKey: { toBase58: () => resp.publicKey.toBase58() },
      signMessage: (bytes) => window.solana.signMessage(bytes, "utf8").then(r => r.signature),
    };
  },
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
| `client` | `SegmentoClient` | Yes | Initialised Segmento client |
| `onConnectWallet` | `() => Promise<WalletAdapter>` | Yes | Called when user clicks "Connect Wallet" |
| `title` | `string` | No | Modal heading (default: `"Join the referral program"`) |
| `onSuccess` | `() => void` | No | Called after successful submission |
| `onClose` | `() => void` | No | Called when modal is dismissed |

### Theming

All colors are CSS strings and optional.

| Option | Default | Description |
|---|---|---|
| `bgColor` | `#0f172b` | Modal background |
| `primaryColor` | `#5ee9b5` | Submit button, focus rings |
| `secondaryColor` | `#f472b6` | Success states, signed wallet button |
| `textColor` | `#f1f5f9` | Headings and input values |
| `labelColor` | `#94a3b8` | Field labels and muted text |

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
