# Segmento SDK — Examples

Two standalone HTML pages that demonstrate the SDK packages running directly in the browser.
Both pages import from the built `dist/` files of each package — run `pnpm build` from the
repo root before opening them.

## Running the examples

From the repo root:

```bash
pnpm build          # build all packages
pnpm demo           # serve the root at http://localhost:3333
```

Then open:

- `http://localhost:3333/example/demo.html` — `@segmento/core` + `@segmento/lead` demo
- `http://localhost:3333/example/demo-ui.html` — `@segmento/ui` modal demo

---

## demo.html — Core + Lead

Tests the lower-level packages directly without the UI modal.

**Flow:**

1. **Connect Wallet** — calls `window.solana.connect()` (Phantom) and builds a `WalletAdapter`
2. **Sign & Submit** — calls `signMessage(wallet, projectName)` from `@segmento/lead` to
   produce a `SolanaWalletPayload`, then calls `client.submitLead(...)` from `@segmento/core`

**What it shows:**
- `SegmentoClient.init(token)` decoding the project token and injecting `project_id` automatically
- `getReferralCode()` reading `?ref=` from the URL (try appending `?ref=TESTCODE`)
- The full `SolanaWalletPayload` — address, message, base58 signature, timestamp

**Relevant packages:** `@segmento/core`, `@segmento/lead`

---

## demo-ui.html — UI Modal

Tests the drop-in modal component from `@segmento/ui`.

**Flow:**

1. Click **Open Referral Modal**
2. Fill in Email and/or Telegram (Telegram and Wallet are required in this demo)
3. Click **Connect Wallet** — prompts Phantom connection, then shows the exact message to be signed
4. Click **Sign Message** — prompts the wallet signature
5. Click **Submit** — sends the lead to the Segmento backend (no re-signing)

**What it shows:**
- `defineSegmentoModal({ telegramRequired, walletRequired })` configuring required fields
- `SegmentoClient.init(token)` passed to the modal — `project_id` never handled manually
- `onConnectWallet` callback wiring in the Phantom wallet adapter
- Dynamic submit button state — enabled only when all required fields are satisfied and at
  least one field has data
- Sign message preview rendered inside the modal after wallet connection, including the T&C link
- `onSuccess` callback closing the modal automatically after submission

**Relevant packages:** `@segmento/core`, `@segmento/lead`, `@segmento/ui`

---

## Project token

Both demos use the same hardcoded mock token:

```
eyJ2IjoxLCJwaWQiOiJ0ZXN0LXByb2plY3QiLCJuYW1lIjoidGVzdCBwcm9qZWN0IiwiY2hrIjoiZmZjYjQzNDUifQ
```

Decodes to:

```json
{ "v": 1, "pid": "proj_demo123", "name": "Demo Project", "chk": "367773ad" }
```

To generate a token for your own project use `encodeToken` from `@segmento/core`:

```ts
import { encodeToken } from "@segmento/core";
const token = encodeToken("your_project_id", "Your Project Name");
```

---

## Wallet requirement

Both demos require the [Phantom](https://phantom.app) browser extension.
Any Solana wallet that exposes `window.solana.connect()` and `window.solana.signMessage()`
will also work.
