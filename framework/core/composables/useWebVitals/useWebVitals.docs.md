# useWebVitals

Registers Core Web Vitals observers (FCP, LCP, CLS, INP, TTFB) and reports metrics via a callback.

## When to Use

- Monitor real-user performance metrics in production
- Pipe Web Vitals data to analytics or Application Insights
- When NOT to use: in unit tests or SSR (browser-only APIs)

## Basic Usage

```typescript
import { useWebVitals } from '@vc-shell/framework';

// Default: logs to console.warn in dev mode only
useWebVitals();

// Custom callback for production analytics
useWebVitals((metric) => {
  analytics.track('web-vital', {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
  });
});
```

## API

### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `callback` | `(metric: IWebVitalsMetric) => void` | No | Custom handler; defaults to `console.warn` in dev mode |

### IWebVitalsMetric

| Field | Type | Description |
|---|---|---|
| `name` | `string` | Metric name (`"FCP"`, `"LCP"`, `"CLS"`, `"INP"`, `"TTFB"`) |
| `value` | `number` | Metric value (milliseconds, or unitless for CLS) |
| `rating` | `"good" \| "needs-improvement" \| "poor"` | Performance rating based on Google thresholds |

## Details

- Call once per app session, typically right after `app.mount()`.
- This is a side-effect-only composable with no return value.

## Related

- [web.dev/vitals](https://web.dev/vitals/) -- Core Web Vitals documentation
- `web-vitals` npm package -- underlying measurement library
