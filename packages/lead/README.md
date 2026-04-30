# @segmento/lead

Referral lead submission for the [Segmento](https://segmento.tech) SDK. Validates required fields and submits the lead to the Segmento backend. Referral code is read automatically from the URL or session cookie.

## Installation

```bash
npm install @segmento/lead
```

## Usage

```ts
import { Segmento } from "@segmento/lead";

const segmento = new Segmento({
  segmentoToken: "your_token",
  projectName: "My Project",
  telegramRequired: true,
  emailRequired: true,
  walletRequired: false,
});

const { referral_code } = await segmento.createReferral({
  telegram: "@alice",
  email: "alice@example.com",
});
```

`referral_code` in the response is the newly generated code for this user to share.

The referral code from `?ref=` (or the `sgm_ref` session cookie set by `@segmento/core` or `@segmento/analytics`) is included in the submission automatically — no need to read it manually.

### With wallet proof

Use `@segmento/solana` to produce a `WalletProof` before calling `createReferral`:

```ts
import { Segmento } from "@segmento/lead";
import { signMessage } from "@segmento/solana";

const segmento = new Segmento({
  segmentoToken: "your_token",
  projectName: "My Project",
  telegramRequired: false,
  emailRequired: false,
  walletRequired: true,
});

const walletProof = await signMessage(walletAdapter, "My Project");

const { referral_code } = await segmento.createReferral({
  wallet: walletProof,
});
```

## API

| Export | Description |
|---|---|
| `new Segmento(config)` | Create a lead client for a project |
| `segmento.createReferral(params)` | Validate and submit the lead, returns `{ referral_code }` |

### Config

| Option | Type | Required | Description |
|---|---|---|---|
| `segmentoToken` | `string` | Yes | Project token from the Segmento dashboard |
| `projectName` | `string` | Yes | Human-readable project name |
| `telegramRequired` | `boolean` | Yes | Whether a Telegram username must be provided |
| `emailRequired` | `boolean` | Yes | Whether an email must be provided |
| `walletRequired` | `boolean` | Yes | Whether a wallet proof must be provided |
| `endpoint` | `string` | No | Override the Segmento API endpoint |
| `fetchImpl` | `typeof fetch` | No | Override the fetch implementation |
