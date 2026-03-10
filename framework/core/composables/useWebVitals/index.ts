import { onFCP, onLCP, onCLS, onINP, onTTFB } from "web-vitals";
import type { Metric } from "web-vitals";

export interface IWebVitalsMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
}

export type WebVitalsCallback = (metric: IWebVitalsMetric) => void;

/**
 * Registers Core Web Vitals observers (FCP, LCP, CLS, INP, TTFB).
 * Call once per app session, typically after app.mount().
 *
 * @param callback - Optional custom handler. Defaults to console.warn in dev mode.
 * @returns void — side-effect only composable
 */
export function useWebVitals(callback?: WebVitalsCallback): void {
  const defaultCallback: WebVitalsCallback = (metric) => {
    if (import.meta.env.DEV) {
      const unit = metric.name === "CLS" ? "" : "ms";
      const value = metric.name === "CLS" ? metric.value.toFixed(4) : Math.round(metric.value);
      console.warn(`[web-vitals] ${metric.name}: ${value}${unit} (${metric.rating})`);
    }
  };

  const handler = (metric: Metric) => {
    (callback ?? defaultCallback)({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
    });
  };

  onFCP(handler);
  onLCP(handler);
  onCLS(handler);
  onINP(handler);
  onTTFB(handler);
}
