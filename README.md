# Segmento SDK

TypeScript SDK for Segmento. Track real onchain activity.

## Packages

| Package                                         | Description                                            |
| ----------------------------------------------- | ------------------------------------------------------ |
| [`@segmento/core`](packages/core)               | API client, token validation, referral code extraction |
| [`@segmento/lead`](packages/lead)               | Solana wallet signing                                  |
| [`@segmento/waitlist-ui`](packages/waitlist-ui) | Drop-in modal web component                            |

---

## Quick start

Initialize SDK and track wallet events.

```bash
npm install @segmento/core
```

```ts
import { SegmentoClient } from "@segmento/core";

// Initialize SDK once at the top level
SegmentoClient.init("<your project token>");

// after SDK has been initialized you can do this anywhere
import { trackWalletConnect, trackWalletTransaction } from "@segmento/core";

trackWalletConnect({
  walletAddress: "<connected user wallet address>",
  chain: "starknet",
});

trackWalletTransaction({
  walletAddress: "<connected user wallet address>",
  chain: "starknet",
  tx: "<transaction hash>",
});
```
