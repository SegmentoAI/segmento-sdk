# Segmento SDK — Examples

Two standalone HTML pages that demonstrate the SDK packages running directly in the browser.
Both pages import from the built `dist/` files of each package — run `pnpm build` from the
repo root before opening them.

## Running the examples

From the repo root:

```bash
pnpm build          # build all packages
pnpm example        # serve the root at http://localhost:3333
```

Then open:

- `http://localhost:3333/example/ui-package/index.html` — `@segmento/waitlist-ui` modal demo
- `http://localhost:3333/example/custom-ui/index.html` — custom UI with `@segmento/lead` + `@segmento/solana`

---

## ui-package — Waitlist UI Modal

Drop-in modal component. No wallet or signing code needed in your app — everything is
handled inside `@segmento/waitlist-ui` (which bundles `@segmento/solana` internally).

**Flow:**

1. Click **Open Referral Modal**
2. Fill in Email and/or Telegram (Telegram and Wallet are required in this demo)
3. Click **Connect Wallet** — prompts Phantom connection, then shows the exact message to be signed
4. Click **Sign Message** — prompts the wallet signature
5. Click **Submit** — sends the lead to the Segmento backend

**What it shows:**
- `defineSegmentoModal({ telegramRequired, walletRequired })` configuring required fields
- `SegmentoClient.init(token)` — `project_id` never handled manually
- `onSuccess` callback closing the modal automatically after submission

**Relevant packages:** `@segmento/core`, `@segmento/waitlist-ui`

---

## custom-ui — Custom UI with Lead + Solana

Lower-level packages for building your own UI. Signing is handled explicitly via
`@segmento/solana`, and the resulting `WalletProof` is passed to `@segmento/lead` or
`SegmentoClient.submitLead`.

**Flow:**

1. **Connect Wallet** — calls `window.solana.connect()` (Phantom) and builds a `WalletAdapter`
2. **Sign & Submit** — calls `signMessage(wallet, projectName)` from `@segmento/solana` to
   produce a `WalletProof`, then calls `client.submitLead(...)` from `@segmento/core`

**What it shows:**
- `SegmentoClient.init(token)` decoding the project token and injecting `project_id` automatically
- `getReferralCode()` reading `?ref=` from the URL (try appending `?ref=TESTCODE`)
- The full `WalletProof` — address, message, base58 signature, timestamp

**Relevant packages:** `@segmento/core`, `@segmento/lead`, `@segmento/solana`

---

## Project token

Both demos use the same hardcoded mock token:

```
eyJ2IjoxLCJwaWQiOiJ0ZXN0LXByb2plY3QiLCJuYW1lIjoidGVzdCBwcm9qZWN0IiwiY2hrIjoiZmZjYjQzNDUifQ
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
