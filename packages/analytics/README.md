# @segmento/analytics

Referral impression tracking for the [Segmento](https://segmento.tech) SDK via a standalone script tag. For projects using `@segmento/core`, impression tracking runs automatically inside `SegmentoClient.init()` — this package is for pages that include only the tracking script without the full SDK.

## Usage

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

## Behaviour

1. Reads the `?ref=` query parameter from the current URL.
2. If present, stores it in a `sgm_ref` session cookie — picked up automatically by `@segmento/lead` on form submission.
3. Fires a `POST /redeem` impression to the Segmento API with the full page URL.
4. Sets a `sgm_impression_sent` session cookie so the impression is only sent once per session.

The impression request is fire-and-forget — it never blocks the page.

## Using with a bundler

If you are already using `@segmento/core`, you do not need this package. `SegmentoClient.init()` handles impression tracking automatically.

If you need impression tracking without the full SDK:

```bash
npm install @segmento/analytics
```

```ts
import { segmentoAnalytics } from "@segmento/analytics";

segmentoAnalytics();
// or with a custom base URL:
segmentoAnalytics({ baseUrl: "https://staging.segmento.tech/manager-api" });
```
