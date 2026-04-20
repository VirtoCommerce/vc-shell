# useAppInsights

Integrates Azure Application Insights page-view tracking with Vue Router and the current user context. This composable bridges the `vue3-application-insights` plugin with the vc-shell framework by automatically enriching every page-view event with the authenticated user's ID and name, generating fresh W3C trace IDs per navigation for distributed tracing, and optionally prefixing page names with the application name (e.g., `[Vendor Portal] Dashboard`).

## When to Use

- Track page views and navigation timing in production with Application Insights
- Send custom telemetry events via the raw `appInsights` instance
- When NOT to use: if your app does not use Azure Application Insights, or if you only need client-side analytics (consider a lighter solution)

## Quick Start

The typical setup happens once in your app's router configuration:

```typescript
import { useAppInsights } from "@vc-shell/framework";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({ history: createWebHistory(), routes });

// Set up page-view tracking
const { setupPageTracking } = useAppInsights();

router.beforeEach((to) => {
  setupPageTracking.beforeEach({ name: to.name as string });
});

router.afterEach((to) => {
  setupPageTracking.afterEach({ name: to.name as string, fullPath: to.fullPath });
});

export default router;
```

## API

### Returns

| Property                       | Type                                                  | Description                                                                                            |
| ------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `setupPageTracking.beforeEach` | `(route: { name: string }) => void`                   | Call in router `beforeEach` to start page-view timing and generate a new trace ID                      |
| `setupPageTracking.afterEach`  | `(route: { name: string; fullPath: string }) => void` | Call in router `afterEach` to stop page-view timing and flush the telemetry event                      |
| `appInsights`                  | `ApplicationInsights`                                 | Raw Application Insights instance for custom telemetry (trackEvent, trackException, trackMetric, etc.) |

### Injection Key

| Key                     | Type                                     | Description                                                                                       |
| ----------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `AppInsightsOptionsKey` | `InjectionKey<AppInsightsPluginOptions>` | Optional. Provide this at app level with `{ appName: 'Vendor Portal' }` to prefix all page names. |

## How It Works

Each navigation goes through two phases:

1. **beforeEach**: A new W3C trace ID is generated and set on `appInsights.context.telemetryTrace`. Then `startTrackPage(name)` begins a timer for the page view. The trace ID links this page view to any API calls made during the navigation, enabling end-to-end distributed tracing in Application Insights.

2. **afterEach**: `stopTrackPage(name, url, properties)` finalizes the page-view event. The URL is reconstructed from `location.protocol + location.host + route.fullPath`. Custom properties include the current user's `id` and `userName` from `useUserManagement()`.

If `AppInsightsOptionsKey` is provided with an `appName`, page names are formatted as `[AppName] RouteName` to distinguish multiple apps reporting to the same Application Insights resource.

## Recipe: Tracking Custom Events Alongside Page Views

```typescript
import { useAppInsights } from "@vc-shell/framework";

const { appInsights } = useAppInsights();

function trackOrderPlaced(orderId: string, total: number) {
  appInsights.trackEvent({
    name: "OrderPlaced",
    properties: { orderId },
    measurements: { orderTotal: total },
  });
}

function trackSearchPerformed(query: string, resultCount: number) {
  appInsights.trackEvent({
    name: "SearchPerformed",
    properties: { query },
    measurements: { resultCount },
  });
}
```

## Recipe: Providing the App Name

In your app's entry point, provide the options so page names are prefixed:

```typescript
import { createApp, provide } from "vue";
import { AppInsightsOptionsKey } from "@vc-shell/framework";

const app = createApp(App);

app.provide(AppInsightsOptionsKey, {
  appName: "Vendor Portal",
  // ... other AppInsightsPluginOptions
});
```

This results in page names like `[Vendor Portal] Dashboard` instead of just `Dashboard`.

## Tips

- **Call once per router.** The `setupPageTracking` methods are designed to be registered as router guards exactly once. Calling `useAppInsights()` multiple times is safe (it returns the same underlying instance), but do not register the guards twice.
- **User context may be undefined on first navigation.** If the user has not loaded yet (e.g., during the initial sign-in redirect), the `userId` and `userName` properties will be empty strings. This is expected and does not break tracking.
- **Use `appInsights.trackException` for error tracking.** The `useErrorHandler` composable already does this automatically, but you can also call it manually for errors caught in try/catch blocks.

## Related

- `vue3-application-insights` -- underlying plugin that initializes the Application Insights SDK
- [useUserManagement](../useUserManagement/useUserManagement.docs.md) -- provides current user context for telemetry enrichment
- [useErrorHandler](../useErrorHandler/useErrorHandler.docs.md) -- automatically tracks exceptions to Application Insights
- [useWebVitals](../useWebVitals/useWebVitals.docs.md) -- Core Web Vitals can be piped to Application Insights via a custom callback
