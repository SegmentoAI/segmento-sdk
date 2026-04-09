# Segmento SDK

TypeScript SDK for Solana wallet-based lead and referral capture. Collect waitlist sign-ups with optional email, Telegram handle, and a cryptographic wallet signature — all wired to the Segmento backend.

## Packages

| Package                           | Description                                            |
| --------------------------------- | ------------------------------------------------------ |
| [`@segmento/core`](packages/core) | API client, token validation, referral code extraction |
| [`@segmento/lead`](packages/lead) | Solana wallet signing                                  |
| [`@segmento/ui`](packages/ui)     | Drop-in modal web component                            |

---

## Quick start — drop-in modal

The fastest integration. One custom element handles wallet connect, message signing, and submission.

```bash
npm install @segmento/core @segmento/lead @segmento/ui
```

```ts
import { SegmentoClient } from "@segmento/core";
import { defineSegmentoModal, SegmentoModal } from "@segmento/ui";

// Register the custom element and set required fields globally
defineSegmentoModal({
  emailRequired: true,
  walletRequired: true,
});

// Initialise with your project token (from the Segmento dashboard)
const client = SegmentoClient.init("your_project_token");

// Create and open the modal
const modal = new SegmentoModal({
  client,
  onConnectWallet: async () => {
    // Return any object with `publicKey.toBase58()` and `signMessage(bytes)`
    // e.g. window.solana from Phantom
    return window.solana;
  },
  onSuccess: () => console.log("Lead submitted!"),
});

modal.open();
```

### Theming

All colors are optional — defaults work out of the box.

```ts
defineSegmentoModal({
  bgColor: "#18181b",
  primaryColor: "#6366f1",
  secondaryColor: "#10b981",
  textColor: "#fafafa",
  labelColor: "#71717a",
});
```

---

## Custom integration

Use `@segmento/core` and `@segmento/lead` directly if you want full control over the UI.

```ts
import { SegmentoClient, getReferralCode } from "@segmento/core";
import { signMessage } from "@segmento/lead";

const client = SegmentoClient.init("your_project_token");

// Sign with the user's wallet
const payload = await signMessage(wallet, client.projectName);

// Submit — project_id is injected automatically, referral_code read from ?ref= in the URL
await client.submitLead({
  email: "user@example.com",
  telegram: "@handle",
  referral_code: getReferralCode() ?? "",
  solana_wallet: {
    wallet_address: payload.address,
    message: payload.message,
    signature: payload.signature,
    timestamp: payload.ts,
  },
});
```

---

## Referral codes

Referral codes are read automatically from the `?ref=` query parameter.

---

## Examples

See [example/](example/) for runnable demos:

- [example/ui-package/](example/ui-package/) — modal web component
- [example/custom-ui/](example/custom-ui/) — low-level API with custom UI

```bash
pnpm example       # serves both demos at http://localhost:3333
```

---

## Development

```bash
pnpm install
pnpm build      # build all packages
pnpm lint       # type-check all packages
```

### Publishing

Releases use [Changesets](https://github.com/changesets/changesets). Add a changeset for your changes, then merge the generated "Version Packages" PR to publish to npm.

```bash
pnpm changeset        # describe your change
pnpm changeset version # bump versions (done by CI)
```

Requires an `NPM_TOKEN` secret in the GitHub repository with write access to the `@segmento` npm organisation.
