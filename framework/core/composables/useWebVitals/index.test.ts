// Capture the handlers registered with each web-vitals function
const handlers: Record<string, ((metric: any) => void)[]> = {
  FCP: [],
  LCP: [],
  CLS: [],
  INP: [],
  TTFB: [],
};

vi.mock("web-vitals", () => ({
  onFCP: (fn: any) => handlers.FCP.push(fn),
  onLCP: (fn: any) => handlers.LCP.push(fn),
  onCLS: (fn: any) => handlers.CLS.push(fn),
  onINP: (fn: any) => handlers.INP.push(fn),
  onTTFB: (fn: any) => handlers.TTFB.push(fn),
}));

import { useWebVitals } from "./index";

describe("useWebVitals", () => {
  beforeEach(() => {
    handlers.FCP = [];
    handlers.LCP = [];
    handlers.CLS = [];
    handlers.INP = [];
    handlers.TTFB = [];
  });

  it("registers handlers for all 5 web vitals", () => {
    useWebVitals();
    expect(handlers.FCP).toHaveLength(1);
    expect(handlers.LCP).toHaveLength(1);
    expect(handlers.CLS).toHaveLength(1);
    expect(handlers.INP).toHaveLength(1);
    expect(handlers.TTFB).toHaveLength(1);
  });

  it("calls custom callback when metric is reported", () => {
    const callback = vi.fn();
    useWebVitals(callback);

    const metric = { name: "FCP", value: 1200, rating: "good" };
    handlers.FCP[0](metric);

    expect(callback).toHaveBeenCalledWith({
      name: "FCP",
      value: 1200,
      rating: "good",
    });
  });

  it("extracts only name, value, rating from metric object", () => {
    const callback = vi.fn();
    useWebVitals(callback);

    const metric = {
      name: "LCP",
      value: 2500,
      rating: "needs-improvement",
      id: "v3-123",
      delta: 2500,
      entries: [],
      navigationType: "navigate",
    };
    handlers.LCP[0](metric);

    expect(callback).toHaveBeenCalledWith({
      name: "LCP",
      value: 2500,
      rating: "needs-improvement",
    });
  });

  it("registers handlers for each metric type independently", () => {
    const callback = vi.fn();
    useWebVitals(callback);

    handlers.CLS[0]({ name: "CLS", value: 0.05, rating: "good" });
    handlers.INP[0]({ name: "INP", value: 200, rating: "good" });
    handlers.TTFB[0]({ name: "TTFB", value: 600, rating: "good" });

    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback.mock.calls[0][0].name).toBe("CLS");
    expect(callback.mock.calls[1][0].name).toBe("INP");
    expect(callback.mock.calls[2][0].name).toBe("TTFB");
  });

  it("uses default callback when none provided (no crash)", () => {
    useWebVitals();
    // Should not throw when invoked with default callback
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(() => {
      handlers.FCP[0]({ name: "FCP", value: 1000, rating: "good" });
    }).not.toThrow();
    warnSpy.mockRestore();
  });

  it("default callback logs in DEV mode", () => {
    useWebVitals();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    handlers.FCP[0]({ name: "FCP", value: 1500, rating: "needs-improvement" });

    // import.meta.env.DEV is true in test environment
    if (import.meta.env.DEV) {
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("[web-vitals] FCP"));
    }
    warnSpy.mockRestore();
  });
});
