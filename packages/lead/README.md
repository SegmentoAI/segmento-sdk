# @segmento/lead

Solana wallet signing for the [Segmento](https://segmento.tech) SDK. Prompts the user to sign a waitlist message and returns a verifiable payload.

## Installation

```bash
npm install @segmento/lead
```

## Usage

```ts
import { signMessage, getSignMessage } from "@segmento/lead";

// Sign with the connected wallet
const payload = await signMessage(wallet, "My Project");

console.log(payload.address);   // base58 wallet address
console.log(payload.message);   // the message that was signed
console.log(payload.signature); // base58-encoded signature
console.log(payload.ts);        // Unix timestamp (ms)
```

The signed message follows the format:

```
I am signing up to the {projectName} waitlist. By signing this message I confirm
that I have read and agree to the Terms and Conditions: {tc_url}
```

## Wallet adapter

Pass any object that implements:

```ts
interface WalletAdapter {
  publicKey: { toBase58(): string } | null;
  signMessage(message: Uint8Array): Promise<Uint8Array>;
}
```

Compatible with `@solana/wallet-adapter-base` and the Phantom `window.solana` provider:

```ts
const wallet = {
  publicKey: { toBase58: () => phantomResp.publicKey.toBase58() },
  signMessage: (bytes) => phantom.signMessage(bytes, "utf8").then(r => r.signature),
};
```

## API

| Export | Description |
|---|---|
| `signMessage(wallet, projectName)` | Sign the waitlist message, returns `SolanaWalletPayload` |
| `getSignMessage(projectName)` | Get the message string without signing |

## Types

```ts
interface SolanaWalletPayload {
  address:   string; // base58 wallet address
  message:   string; // message that was signed
  signature: string; // base58-encoded signature
  ts:        number; // Unix timestamp in ms
}
```
