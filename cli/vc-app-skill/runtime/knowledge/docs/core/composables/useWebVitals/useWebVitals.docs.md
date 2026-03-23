# useWebVitals

Registers Core Web Vitals observers (FCP, LCP, CLS, INP, TTFB) and reports metrics via a callback. Core Web Vitals are Google's standardized set of real-user performance metrics that measure loading speed, interactivity, and visual stability. This composable wraps the `web-vitals` npm package and normalizes its output into a simple `{ name, value, rating }` shape. In development mode, metrics are logged to the console by default so you can catch performance regressions early without setting up external analytics.

## When to Use

- Monitor real-user performance metrics in production and send them to your analytics backend
- Pipe Web Vitals data to Application Insights, Google Analytics, or a custom endpoint
- Get quick performance feedback during development via console output
- When NOT to use: in unit tests or SSR environments (browser-only APIs), or when you need synthetic/lab metrics (use Lighthouse instead)

## Quick Start

```typescript
import { useWebVitals } from '@vc-shell/framework';

// Option 1: Default behavior -- logs to console.warn in dev mode, silent in production
useWebVitals();

// Option 2: Custom callback for production analytics
useWebVitals((metric) => {
  analytics.track('web-vital', {
    name: metric.name,     // "FCP", "LCP", "CLS", "INP", or "TTFB"
    value: metric.value,   // milliseconds (or unitless for CLS)
    rating: metric.rating, // "good", "needs-improvement", or "poor"
  });
});
```

Call this once after `app.mount()` in your application entry point:

```typescript
// main.ts
const app = createApp(App);
app.mount('#app');

// Register Web Vitals observers after mount
useWebVitals();
```

## API

### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `callback` | `(metric: IWebVitalsMetric) => void` | No | Custom handler for each metric. Defaults to `console.warn` formatted output in dev mode; no-op in production. |

### IWebVitalsMetric

| Field | Type | Description |
|---|---|---|
| `name` | `string` | Metric name: `"FCP"` (First Contentful Paint), `"LCP"` (Largest Contentful Paint), `"CLS"` (Cumulative Layout Shift), `"INP"` (Interaction to Next Paint), `"TTFB"` (Time to First Byte) |
| `value` | `number` | Metric value in milliseconds for all metrics except CLS, which is a unitless score |
| `rating` | `"good" \| "needs-improvement" \| "poor"` | Performance rating based on Google's thresholds (e.g., LCP < 2500ms = "good") |

### Returns

This is a side-effect-only composable with no return value.

## How It Works

The composable registers five separate observers from the `web-vitals` library: `onFCP`, `onLCP`, `onCLS`, `onINP`, and `onTTFB`. Each observer fires once (or in the case of CLS, may fire multiple times as the page stabilizes) and calls the provided callback with the raw `Metric` object from `web-vitals`, which is mapped to the simpler `IWebVitalsMetric` shape.

The default callback formats CLS values to 4 decimal places (since CLS is a dimensionless score typically between 0 and 1) and rounds all other values to whole milliseconds. Output looks like:

```
[web-vitals] FCP: 842ms (good)
[web-vitals] LCP: 1923ms (good)
[web-vitals] CLS: 0.0412 (good)
[web-vitals] INP: 156ms (needs-improvement)
[web-vitals] TTFB: 312ms (good)
```

## Recipe: Sending Web Vitals to Application Insights

```typescript
import { useWebVitals, useAppInsights } from '@vc-shell/framework';

const { appInsights } = useAppInsights();

useWebVitals((metric) => {
  appInsights.trackMetric({
    name: `WebVital_${metric.name}`,
    average: metric.value,
    properties: {
      rating: metric.rating,
      page: window.location.pathname,
    },
  });
});
```

This sends each Web Vital as a custom metric to Application Insights, where you can build dashboards, set alerts on regressions, and segment by page.

## Recipe: Conditional Reporting Based on Rating

```typescript
import { useWebVitals } from '@vc-shell/framework';

useWebVitals((metric) => {
  // Only report poor metrics to reduce noise
  if (metric.rating === 'poor') {
    fetch('/api/telemetry/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric: metric.name,
        value: metric.value,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      }),
    });
  }
});
```

## Tips

- **Call only once per app session.** Calling `useWebVitals()` multiple times registers duplicate observers, which means your callback fires twice for each metric. Place it in `main.ts` after `app.mount()`.
- **CLS may report multiple times.** The CLS observer can fire whenever a new layout shift occurs. Each call reports the cumulative score so far. The final value (reported when the page is hidden or unloaded) is the one that matters.
- **INP replaced FID.** As of March 2024, Google uses Interaction to Next Paint (INP) instead of First Input Delay (FID) as a Core Web Vital. This composable tracks INP, not FID.
- **Metrics are real-user only.** These are field metrics from actual users. They may differ significantly from lab metrics (Lighthouse). Both are valuable but measure different things.

## Related

- [web.dev/vitals](https://web.dev/vitals/) -- Core Web Vitals documentation and thresholds
- `web-vitals` npm package -- underlying measurement library
- [useAppInsights](../useAppInsights/useAppInsights.docs.md) -- Application Insights integration for sending metrics
