# @segmento/core

API client and utilities for the [Segmento](https://segmento.tech) SDK. Handles project token validation, impression tracking, lead submission, referral code extraction, and wallet event tracking.

## Installation

```bash
npm install @segmento/core
```

## Usage

### Initialise the client

Call once at page load. Automatically fires a referral impression, stores the `?ref=` code in a session cookie, and stores the instance globally for use anywhere in your app.

```ts
import { SegmentoClient } from "@segmento/core";

SegmentoClient.init("your_project_token");
```

### Access the instance anywhere

```ts
const client = SegmentoClient.getInstanceOrThrow();
console.log(client.projectId);   // decoded from token
console.log(client.projectName); // decoded from token
```

### Submit a lead

`project_id` is injected automatically from the token.

```ts
const client = SegmentoClient.getInstanceOrThrow();

await client.submitLead({
  email: "user@example.com",
  telegram: "@handle",
});
```

### Capture a lead

`project_id`, `origin_url`, and `referral_code` are injected automatically.

```ts
import { captureLead } from "@segmento/core";

await captureLead({ email: "alice@example.com", telegram: "@alice" });
```

### Track wallet events

`project_id`, `origin_url`, and `referral_code` are injected automatically. Both calls are fire-and-forget.

```ts
import { trackWalletConnect, trackWalletTransaction } from "@segmento/core";

// on wallet connect
trackWalletConnect({ walletAddress: "abc123" });

// on transaction
trackWalletTransaction({ walletAddress: "abc123", txSignature: "sig456" });
```

Or via the client instance:

```ts
const client = SegmentoClient.getInstanceOrThrow();
client.trackWalletConnect({ walletAddress: "abc123" });
client.trackWalletTransaction({ walletAddress: "abc123", txSignature: "sig456" });
```

### Read referral code from the URL

Reads the `?ref=` query parameter by default.

```ts
import { getReferralCode } from "@segmento/core";

const code = getReferralCode();         // ?ref=
const code = getReferralCode("invite"); // ?invite=
```

### Generate a project token

Intended for use in your backend or dashboard when issuing tokens to SDK users.

```ts
import { encodeToken } from "@segmento/core";

const token = encodeToken("my-project-id", "My Project");
```

## API

| Export | Description |
|---|---|
| `SegmentoClient.init(token, options?)` | Decode token, fire impression, store instance globally |
| `SegmentoClient.getInstance()` | Return the globally stored instance, or `null` |
| `SegmentoClient.getInstanceOrThrow()` | Return the globally stored instance, throws if not initialised |
| `client.submitLead(request)` | POST lead to the Segmento API |
| `client.captureLead(params?)` | Capture lead |
| `client.trackWalletConnect(params?)` | Track wallet connect event |
| `client.trackWalletTransaction(params?)` | Track wallet transaction event |
| `client.projectId` | Decoded project ID |
| `client.projectName` | Decoded project name |
| `captureLead(params?)` | Standalone — capture lead, reads instance from global |
| `trackWalletConnect(params?)` | Standalone — reads instance from global |
| `trackWalletTransaction(params?)` | Standalone — reads instance from global |
| `sendImpression(options?)` | Fire referral impression manually |
| `getReferralCode(param?)` | Read referral code from URL |
| `encodeToken(pid, name)` | Generate a project token |
| `decodeToken(token)` | Decode and validate a token |
