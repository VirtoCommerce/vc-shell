# useAppInsights

Integrates Azure Application Insights page-view tracking with Vue Router and the current user context.

## When to Use

- Track page views and navigation timing in production with Application Insights
- When NOT to use: if your app does not use Azure Application Insights

## Basic Usage

```typescript
import { useAppInsights } from '@vc-shell/framework';

// In your router setup
const { setupPageTracking, appInsights } = useAppInsights();

router.beforeEach((to) => {
  setupPageTracking.beforeEach({ name: to.name as string });
});

router.afterEach((to) => {
  setupPageTracking.afterEach({ name: to.name as string, fullPath: to.fullPath });
});
```

## API

### Returns

| Property | Type | Description |
|---|---|---|
| `setupPageTracking.beforeEach` | `(route: { name: string }) => void` | Call in router `beforeEach` to start page tracking |
| `setupPageTracking.afterEach` | `(route: { name: string; fullPath: string }) => void` | Call in router `afterEach` to stop page tracking |
| `appInsights` | `ApplicationInsights` | Raw Application Insights instance for custom telemetry |

## Details

- Each page view includes the current user's `id` and `userName` as custom properties.
- If `AppInsightsOptionsKey` is provided with an `appName`, it is prepended to page names (e.g., `[Vendor Portal] Dashboard`).
- A new W3C trace ID is generated per navigation for distributed tracing.

## Related

- `vue3-application-insights` -- underlying plugin
- `useUserManagement` -- provides current user context
