# @segmento/analytics

Referral impression tracking for the [Segmento](https://segmento.tech) SDK. Reads the referral code from the URL, stores it in a session cookie, and fires a single impression event per session.

## Installation

```bash
npm install @segmento/analytics
```

## Usage

### Script tag (no bundler)

Add this at the end of your `<body>`. The script runs automatically on load.

```html
<script src="https://cdn.jsdelivr.net/npm/@segmento/analytics@latest/dist/script.js"></script>
```

To use a custom API base URL (e.g. staging):

```html
<script
  src="https://cdn.jsdelivr.net/npm/@segmento/analytics@latest/dist/script.js"
  data-api-url="https://staging.segmento.tech/manager-api"
></script>
```

### ES module

Call once at page load.

```ts
import { segmentoAnalytics } from "@segmento/analytics";

segmentoAnalytics();
```

With options:

```ts
segmentoAnalytics({ baseUrl: "https://staging.segmento.tech/manager-api" });
```

## Behaviour

1. Reads the `?ref=` query parameter from the current URL.
2. If present, stores it in a `sgm_ref` session cookie for use by `@segmento/lead`.
3. Fires a `POST /redeem` impression to the Segmento API with the full page URL.
4. Sets a `sgm_impression_sent` session cookie so the impression is only sent once per session.

The impression request is fire-and-forget — it never blocks the page.

## API

| Export | Description |
|---|---|
| `segmentoAnalytics(options?)` | Run analytics on page load |

### Options

| Option | Type | Description |
|---|---|---|
| `baseUrl` | `string` | Override the Segmento API base URL |
| `fetchImpl` | `typeof fetch` | Override the fetch implementation |
