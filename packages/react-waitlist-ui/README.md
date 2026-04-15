# @segmento/react-waitlist-ui

React wrapper for the [Segmento](https://segmento.tech) waitlist modal. Handles wallet connect, message signing, and lead submission.

## Installation

```bash
npm install @segmento/react-waitlist-ui
```

React 18+ is a peer dependency.

## Usage

### Component

```tsx
import { useState } from "react";
import { SegmentoWaitlistModal } from "@segmento/react-waitlist-ui";

function App() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Join waitlist</button>

      <SegmentoWaitlistModal
        token="YOUR_PROJECT_TOKEN"
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={() => setOpen(false)}
      />
    </>
  );
}
```

## API

### `<SegmentoWaitlistModal />`

| Prop               | Type                           | Required | Description                                           |
| ------------------ | ------------------------------ | -------- | ----------------------------------------------------- |
| `token`            | `string`                       | Yes      | Segmento project token                                |
| `open`             | `boolean`                      | Yes      | Controls modal visibility                             |
| `onClose`          | `() => void`                   | No       | Called when modal is dismissed                        |
| `onSuccess`        | `() => void`                   | No       | Called after successful submission                    |
| `title`            | `string`                       | No       | Modal heading (default: `"Join the waitlist"`)        |
| `emailRequired`    | `boolean`                      | No       | Email must be filled before submitting                |
| `telegramRequired` | `boolean`                      | No       | Telegram handle must be filled                        |
| `walletRequired`   | `boolean`                      | No       | Wallet must be connected and signed                   |
| `onConnectWallet`  | `() => Promise<WalletAdapter>` | No       | Custom wallet connection. Defaults to `window.solana` |

### `openSegmentoWaitlistModal(token, options?)`

Opens the modal imperatively. Returns the `SegmentoModal` instance so you can close it programmatically.

```ts
const modal = openSegmentoWaitlistModal("YOUR_PROJECT_TOKEN");
modal.close();
```

## Theming

All color props are optional CSS color strings.

| Prop             | Default   | Description                               |
| ---------------- | --------- | ----------------------------------------- |
| `bgColor`        | `#0c1117` | Modal background                          |
| `primaryColor`   | `#5ee9b5` | Submit button, focus rings, wallet button |
| `secondaryColor` | `#5ee9b5` | Success states, signed wallet button      |
| `textColor`      | `#f0f6fc` | Headings and input values                 |
| `labelColor`     | `#6b7f99` | Field labels and muted text               |

```tsx
<SegmentoWaitlistModal
  token="YOUR_PROJECT_TOKEN"
  open={open}
  bgColor="#18181b"
  primaryColor="#6366f1"
  onClose={() => setOpen(false)}
/>
```

## Referral codes

The modal automatically reads `?ref=` from the current URL and includes it in the submission. No extra setup needed.
