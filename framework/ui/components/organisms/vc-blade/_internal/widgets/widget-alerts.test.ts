import { describe, it, expect } from "vitest";
import { ref } from "vue";
import type { IWidget, IWidgetAlert } from "@core/services/widget-service";
import { SEVERITY_DOT_VARIANT } from "@core/types/severity";
import { resolveAlerts, highestSeverity, alertDotVariant, sortAlertsFirst } from "./widget-alerts";

const alert = (id: string, severity: IWidgetAlert["severity"] = "info"): IWidgetAlert => ({
  id,
  severity,
  text: id,
});

describe("resolveAlerts", () => {
  it("returns headless alerts", () => {
    const a = alert("h");
    const widget: IWidget = { id: "w", headless: { icon: "i", alerts: ref([a]) } };
    expect(resolveAlerts(widget)).toEqual([a]);
  });

  it("falls back to trigger alerts", () => {
    const a = alert("t");
    const widget: IWidget = { id: "w", trigger: { alerts: ref([a]) } };
    expect(resolveAlerts(widget)).toEqual([a]);
  });

  it("returns [] when neither is set", () => {
    expect(resolveAlerts({ id: "w" })).toEqual([]);
  });
});

describe("highestSeverity", () => {
  it("picks the most severe", () => {
    expect(highestSeverity([alert("a", "info"), alert("b", "error"), alert("c", "warning")])).toBe("error");
    expect(highestSeverity([alert("a", "error"), alert("b", "critical")])).toBe("critical");
  });

  it("returns undefined for no alerts", () => {
    expect(highestSeverity([])).toBeUndefined();
  });
});

describe("SEVERITY_DOT_VARIANT", () => {
  it("maps severities to dot variants", () => {
    expect(SEVERITY_DOT_VARIANT.critical).toBe("danger");
    expect(SEVERITY_DOT_VARIANT.error).toBe("danger");
    expect(SEVERITY_DOT_VARIANT.warning).toBe("warning");
    expect(SEVERITY_DOT_VARIANT.info).toBe("info");
  });
});

describe("alertDotVariant", () => {
  it("colours the dot by the most severe alert", () => {
    expect(alertDotVariant([alert("a", "warning"), alert("b", "critical")])).toBe("danger");
    expect(alertDotVariant([alert("a", "info")])).toBe("info");
    expect(alertDotVariant([])).toBeUndefined();
  });
});

describe("sortAlertsFirst", () => {
  it("moves widgets with alerts first, keeping relative order", () => {
    const a: IWidget = { id: "a" };
    const b: IWidget = { id: "b", headless: { icon: "i", alerts: ref([alert("x")]) } };
    const c: IWidget = { id: "c" };
    const d: IWidget = { id: "d", trigger: { alerts: ref([alert("y")]) } };
    expect(sortAlertsFirst([a, b, c, d])).toEqual([b, d, a, c]);
  });
});
