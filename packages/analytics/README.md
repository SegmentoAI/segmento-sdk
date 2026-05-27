# @segmento/analytics

Analytics tracking for [Segmento](https://segmento.tech) — pageviews, custom events, session tracking, UTM attribution, and referral attribution. Works as a script tag (like Google Tag) or as an npm module in any framework.

## Script tag

Add to your `<head>`. Pageview is sent automatically on load. SPA navigation is tracked automatically via `history.pushState` / `popstate`.

```html
<script
  src="https://cdn.jsdelivr.net/npm/@segmento/analytics@latest/dist/script.js"
  data-project-id="your-project-id"
></script>
```

To override the API URL (e.g. staging):

```html
<script
  src="https://cdn.jsdelivr.net/npm/@segmento/analytics@latest/dist/script.js"
  data-project-id="your-project-id"
  data-api-url="https://staging-referral.segmento.tech/-/v1"
></script>
```

Custom events are available globally after the script loads:

```js
segmentoTag("wallet_connected", { wallet_address: "8xKp...", chain: "solana" });
```

Events called before the script initialises are queued and replayed automatically.

## npm / framework

```bash
npm install @segmento/analytics
```

```ts
import { initAnalytics, segmentoTag } from "@segmento/analytics";

// Call once at your app root
initAnalytics("your-project-id");

// Anywhere in your app
segmentoTag("wallet_connected", { wallet_address: "8xKp...", chain: "solana" });
```

## Automatic data collection

Every event (pageview and custom) includes:

| Field | Source |
|---|---|
| `page_url` | `window.location.href` |
| `page_referrer` | `document.referrer` |
| `page_title` | `document.title` |
| `session_id` | UUID generated once per tab (`sessionStorage`) |
| `referral_code` | `?ref=` param captured on landing (`sessionStorage`) |
| `utm_*` | UTM params captured on landing (`sessionStorage`) |

All session data lives in `sessionStorage` — it dies with the tab and no cookies are set.

## Custom events

```js
segmentoTag("event_name", { key: "value" });
```

Sent as `event_type: "custom"` with `event_name` set to the first argument. The second argument is passed as `properties`.
