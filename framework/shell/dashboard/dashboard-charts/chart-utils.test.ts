import { describe, it, expect } from "vitest";
import {
  escapeHtml,
  normalizeRangeValue,
  filterDataByRange,
  formatAxisValue,
  formatNumericValue,
  resolveSeriesMeta,
  buildChartTooltipHtml,
} from "./chart-utils";
import type { ChartConfig } from "./types";

describe("escapeHtml", () => {
  it("returns an empty string for null and undefined", () => {
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
  });

  it("escapes all special HTML characters", () => {
    expect(escapeHtml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&#39;");
  });

  it("leaves safe text untouched", () => {
    expect(escapeHtml("Revenue 2024")).toBe("Revenue 2024");
  });

  it("coerces numbers to strings", () => {
    expect(escapeHtml(42)).toBe("42");
    expect(escapeHtml(0)).toBe("0");
  });
});

describe("normalizeRangeValue", () => {
  it("returns the timestamp for a valid Date", () => {
    const date = new Date("2024-01-01T00:00:00.000Z");
    expect(normalizeRangeValue(date)).toBe(date.getTime());
  });

  it("returns undefined for an invalid Date", () => {
    expect(normalizeRangeValue(new Date("not a date"))).toBeUndefined();
  });

  it("returns finite numbers as-is", () => {
    expect(normalizeRangeValue(123)).toBe(123);
    expect(normalizeRangeValue(0)).toBe(0);
    expect(normalizeRangeValue(-5.5)).toBe(-5.5);
  });

  it("returns undefined for non-finite numbers", () => {
    expect(normalizeRangeValue(Infinity)).toBeUndefined();
    expect(normalizeRangeValue(NaN)).toBeUndefined();
  });

  it("parses numeric strings", () => {
    expect(normalizeRangeValue("42")).toBe(42);
  });

  it("falls back to Date.parse for date strings", () => {
    expect(normalizeRangeValue("2024-01-01")).toBe(Date.parse("2024-01-01"));
  });

  it("returns undefined for unparseable strings", () => {
    expect(normalizeRangeValue("not a date")).toBeUndefined();
  });

  it("returns undefined for unsupported types", () => {
    expect(normalizeRangeValue({})).toBeUndefined();
    expect(normalizeRangeValue(null)).toBeUndefined();
    expect(normalizeRangeValue(undefined)).toBeUndefined();
    expect(normalizeRangeValue(true)).toBeUndefined();
  });
});

describe("filterDataByRange", () => {
  const data = [{ x: 1 }, { x: 5 }, { x: 10 }, { x: 15 }];
  const accessor = (d: { x: number }) => d.x;

  it("returns the original data when no range is provided", () => {
    expect(filterDataByRange(data, accessor)).toBe(data);
  });

  it("filters by lower bound only", () => {
    expect(filterDataByRange(data, accessor, 5)).toEqual([{ x: 5 }, { x: 10 }, { x: 15 }]);
  });

  it("filters by upper bound only", () => {
    expect(filterDataByRange(data, accessor, undefined, 10)).toEqual([{ x: 1 }, { x: 5 }, { x: 10 }]);
  });

  it("filters within an inclusive range", () => {
    expect(filterDataByRange(data, accessor, 5, 10)).toEqual([{ x: 5 }, { x: 10 }]);
  });

  it("normalizes a reversed range (start > end)", () => {
    expect(filterDataByRange(data, accessor, 10, 5)).toEqual([{ x: 5 }, { x: 10 }]);
  });

  it("keeps items whose accessor value cannot be normalized", () => {
    const mixed = [{ x: 1 }, { x: "bad" as unknown as number }, { x: 20 }];
    expect(filterDataByRange(mixed, (d) => d.x, 5, 15)).toEqual([{ x: "bad" }]);
  });
});

describe("formatAxisValue", () => {
  it("uses the formatter for numbers", () => {
    expect(formatAxisValue(5, (v) => `#${String(v)}`)).toBe("#5");
  });

  it("uses the formatter for Date values", () => {
    const date = new Date("2024-01-01");
    expect(formatAxisValue(date, (v) => (v instanceof Date ? "date" : "num"))).toBe("date");
  });

  it("normalizes a value before passing it to the formatter", () => {
    expect(formatAxisValue("42", (v) => `n${String(v)}`)).toBe("n42");
  });

  it("returns the fallback for null and undefined without a formatter", () => {
    expect(formatAxisValue(null)).toBe("-");
    expect(formatAxisValue(undefined)).toBe("-");
  });

  it("stringifies other values without a formatter", () => {
    expect(formatAxisValue("label")).toBe("label");
    expect(formatAxisValue(7)).toBe("7");
  });
});

describe("formatNumericValue", () => {
  it("formats a number via toLocaleString by default", () => {
    expect(formatNumericValue(1000)).toBe((1000).toLocaleString());
  });

  it("coerces numeric strings", () => {
    expect(formatNumericValue("250")).toBe((250).toLocaleString());
  });

  it("returns the fallback for non-finite values", () => {
    expect(formatNumericValue("abc")).toBe("-");
    expect(formatNumericValue(NaN)).toBe("-");
    expect(formatNumericValue(undefined)).toBe("-");
  });

  it("coerces null to 0 (Number(null) === 0)", () => {
    expect(formatNumericValue(null)).toBe((0).toLocaleString());
  });

  it("uses a custom formatter when provided", () => {
    expect(formatNumericValue(5, (v) => `$${v}`)).toBe("$5");
  });
});

describe("resolveSeriesMeta", () => {
  const config: ChartConfig = {
    revenue: { label: "Revenue", color: "#ff0000" },
    profit: { label: "Profit", color: "#00ff00" },
  };

  it("resolves by key", () => {
    expect(resolveSeriesMeta({ config, key: "revenue" })).toEqual({ label: "Revenue", color: "#ff0000" });
  });

  it("resolves by index when key is absent", () => {
    expect(resolveSeriesMeta({ config, index: 1 })).toEqual({ label: "Profit", color: "#00ff00" });
  });

  it("prefers key over index", () => {
    expect(resolveSeriesMeta({ config, key: "revenue", index: 1 })).toEqual({ label: "Revenue", color: "#ff0000" });
  });

  it("falls back through fallbackLabel then key then 'Series'", () => {
    expect(resolveSeriesMeta({ config, key: "missing", fallbackLabel: "Fallback" }).label).toBe("Fallback");
    expect(resolveSeriesMeta({ config, key: "missing" }).label).toBe("missing");
    expect(resolveSeriesMeta({ config }).label).toBe("Series");
  });

  it("uses the default color when the series is unknown", () => {
    expect(resolveSeriesMeta({ config }).color).toBe("var(--primary-500)");
  });

  it("ignores a non-finite index", () => {
    expect(resolveSeriesMeta({ config, index: NaN }).color).toBe("var(--primary-500)");
  });
});

describe("buildChartTooltipHtml", () => {
  it("returns undefined when there are no items", () => {
    expect(buildChartTooltipHtml({ items: [] })).toBeUndefined();
  });

  it("renders a title when provided", () => {
    const html = buildChartTooltipHtml({
      title: "January",
      items: [{ label: "Revenue", value: 100, color: "#f00" }],
    });
    expect(html).toContain("dashboard-chart-tooltip__title");
    expect(html).toContain("January");
  });

  it("omits the title block when no title is provided", () => {
    const html = buildChartTooltipHtml({
      items: [{ label: "Revenue", value: 100, color: "#f00" }],
    });
    expect(html).not.toContain("dashboard-chart-tooltip__title");
  });

  it("renders one item block per item", () => {
    const html = buildChartTooltipHtml({
      items: [
        { label: "A", value: 1, color: "#111" },
        { label: "B", value: 2, color: "#222" },
      ],
    });
    const matches = html?.match(/dashboard-chart-tooltip__item"/g);
    expect(matches).toHaveLength(2);
  });

  it("escapes user-controlled content", () => {
    const html = buildChartTooltipHtml({
      title: "<script>",
      items: [{ label: "<b>", value: `"x"`, color: "javascript:x" }],
    });
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&lt;b&gt;");
    expect(html).toContain("&quot;x&quot;");
    expect(html).not.toContain("<script>");
  });
});
