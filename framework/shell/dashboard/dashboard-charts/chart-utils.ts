import type { ChartConfig } from "./types";

export type ChartRangeValue = number | string | Date;

export interface ChartTooltipItem {
  label: string;
  value: string | number;
  color: string;
}

interface BuildChartTooltipOptions {
  title?: string;
  items: ChartTooltipItem[];
}

interface ResolveSeriesMetaOptions {
  config: ChartConfig;
  key?: string;
  index?: number;
  fallbackLabel?: string;
}

const DEFAULT_COLOR = "var(--primary-500)";
const FALLBACK_TEXT = "-";

const escapeMap: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;",
  "'": "&#39;",
};

export const escapeHtml = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).replace(/[&<>"']/g, (char) => escapeMap[char] ?? char);
};

export const normalizeRangeValue = (value: unknown): number | undefined => {
  if (value instanceof Date) {
    const timestamp = value.getTime();
    return Number.isFinite(timestamp) ? timestamp : undefined;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === "string") {
    const numericValue = Number(value);
    if (Number.isFinite(numericValue)) {
      return numericValue;
    }

    const timestamp = Date.parse(value);
    if (Number.isFinite(timestamp)) {
      return timestamp;
    }
  }

  return undefined;
};

export const filterDataByRange = <T>(
  data: T[],
  accessor: (datum: T) => unknown,
  rangeStart?: ChartRangeValue,
  rangeEnd?: ChartRangeValue,
): T[] => {
  const start = normalizeRangeValue(rangeStart);
  const end = normalizeRangeValue(rangeEnd);

  if (start === undefined && end === undefined) {
    return data;
  }

  const min = start !== undefined && end !== undefined ? Math.min(start, end) : start;
  const max = start !== undefined && end !== undefined ? Math.max(start, end) : end;

  return data.filter((datum) => {
    const comparable = normalizeRangeValue(accessor(datum));
    if (comparable === undefined) {
      return true;
    }

    if (min !== undefined && comparable < min) {
      return false;
    }

    if (max !== undefined && comparable > max) {
      return false;
    }

    return true;
  });
};

export const formatAxisValue = (
  value: unknown,
  formatter?: (value: number | Date) => string,
): string => {
  if (formatter) {
    if (typeof value === "number" || value instanceof Date) {
      return formatter(value);
    }

    const comparable = normalizeRangeValue(value);
    if (comparable !== undefined) {
      return formatter(comparable);
    }
  }

  if (value === null || value === undefined) {
    return FALLBACK_TEXT;
  }

  return String(value);
};

export const formatNumericValue = (
  value: unknown,
  formatter?: (value: number) => string,
): string => {
  const numericValue = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numericValue)) {
    return FALLBACK_TEXT;
  }

  if (formatter) {
    return formatter(numericValue);
  }

  return numericValue.toLocaleString();
};

export const resolveSeriesMeta = ({
  config,
  key,
  index,
  fallbackLabel,
}: ResolveSeriesMetaOptions): { label: string; color: string } => {
  const configKeys = Object.keys(config);
  const keyItem = key ? config[key] : undefined;
  const indexItem =
    typeof index === "number" && Number.isFinite(index) && configKeys[index]
      ? config[configKeys[index]]
      : undefined;
  const item = keyItem ?? indexItem;

  return {
    label: item?.label ?? fallbackLabel ?? key ?? "Series",
    color: item?.color ?? DEFAULT_COLOR,
  };
};

export const buildChartTooltipHtml = ({
  title,
  items,
}: BuildChartTooltipOptions): string | undefined => {
  if (!items.length) {
    return undefined;
  }

  const titleMarkup = title
    ? `<div class="dashboard-chart-tooltip__title">${escapeHtml(title)}</div>`
    : "";

  const itemsMarkup = items
    .map(
      (item) => `
        <div class="dashboard-chart-tooltip__item">
          <span class="dashboard-chart-tooltip__indicator" style="background: ${escapeHtml(item.color)}"></span>
          <span class="dashboard-chart-tooltip__label">${escapeHtml(item.label)}</span>
          <span class="dashboard-chart-tooltip__value">${escapeHtml(item.value)}</span>
        </div>
      `,
    )
    .join("");

  return `
    <div class="dashboard-chart-tooltip">
      ${titleMarkup}
      <div class="dashboard-chart-tooltip__items">${itemsMarkup}</div>
    </div>
  `;
};
