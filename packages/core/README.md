# @segmento/core

API client and utilities for the [Segmento](https://segmento.tech) SDK. Handles project token validation, lead submission, and referral code extraction.

## Installation

```bash
npm install @segmento/core
```

## Usage

### Initialise the client

Call once at page load. The instance is stored globally and picked up automatically by `@segmento/waitlist-ui`.

```ts
import { SegmentoClient } from "@segmento/core";

SegmentoClient.init("your_project_token");
```

If you need a reference to the instance:

```ts
const client = SegmentoClient.init("your_project_token");
console.log(client.projectId);   // decoded from token
console.log(client.projectName); // decoded from token
```

### Submit a lead

`project_id` is injected automatically from the token.

```ts
const client = SegmentoClient.getInstance();

await client.submitLead({
  email: "user@example.com",
  telegram: "@handle",
  referral_code: getReferralCode() ?? "",
});
```

### Read referral code from the URL

Reads the `?ref=` query parameter by default.

```ts
import { getReferralCode } from "@segmento/core";

const code = getReferralCode();       // ?ref=
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
| `SegmentoClient.init(token, options?)` | Decode token, create client, store globally |
| `SegmentoClient.getInstance()` | Return the globally stored instance, or null |
| `client.submitLead(request)` | POST lead to the Segmento API |
| `client.projectId` | Decoded project ID |
| `client.projectName` | Decoded project name |
| `getReferralCode(param?)` | Read referral code from URL |
| `encodeToken(pid, name)` | Generate a project token |
| `decodeToken(token)` | Decode and validate a token |
