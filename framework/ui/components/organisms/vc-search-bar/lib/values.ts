import { toRaw } from "vue";
import type { NotValue, NumberValue, RelativeDate, SearchBarValue } from "../types";
import type { BarField } from "./fields";

type DateRangeValue = { start?: string; end?: string };

/** The relative date choices; `key` is the suffix of their i18n keys */
export const RELATIVE_DATES = [
  { id: "today", key: "TODAY", days: 0 },
  { id: "7d", key: "LAST_7", days: 6 },
  { id: "30d", key: "LAST_30", days: 29 },
] as const satisfies readonly { id: RelativeDate["relative"]; key: string; days: number }[];
const relativeOf = (id: RelativeDate["relative"]) => RELATIVE_DATES.find((r) => r.id === id)!;
const COLLAPSE_AFTER = 2;

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isRelative = (v: unknown): v is RelativeDate => isObject(v) && "relative" in v;
export const isNot = (v: unknown): v is NotValue => isObject(v) && Array.isArray(v.not);

export function isEmptyValue(v: unknown): boolean {
  if (v === null || v === undefined || v === "" || v === false) return true;
  if (Array.isArray(v)) return v.length === 0;
  if (isObject(v)) {
    if ("not" in v) return !Array.isArray(v.not) || v.not.length === 0;
    if ("relative" in v || "op" in v) return false;
    if ("start" in v || "end" in v) return !v.start && !v.end;
    return Object.keys(v).length === 0;
  }
  return false;
}

/**
 * A copy that holds no reactive proxies at any depth (structuredClone throws on them).
 * Plain objects and arrays are copied, anything else (a custom editor's value) is kept as is.
 */
export function cloneValue<T>(v: T): T {
  const raw = toRaw(v);
  if (Array.isArray(raw)) return raw.map(cloneValue) as T;
  if (isObject(raw) && [Object.prototype, null].includes(Object.getPrototypeOf(raw))) {
    return Object.fromEntries(Object.entries(raw).map(([k, x]) => [k, cloneValue(x)])) as T;
  }
  return raw;
}

const pad = (n: number) => String(n).padStart(2, "0");
/** A local date as YYYY-MM-DD */
export const toYmd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
/** YYYY-MM-DD to a local midnight Date for the date picker */
export const toDate = (s?: string) => (s ? new Date(`${s}T00:00`) : null);

export function resolveRelative(r: RelativeDate, today: Date): { start: string; end: string } {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - relativeOf(r.relative).days);
  return { start: toYmd(start), end: toYmd(today) };
}

export function toFlatFilters(
  fields: BarField[],
  values: Record<string, SearchBarValue>,
  today: Date,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const field of fields) {
    const value = values[field.id];
    if (isEmptyValue(value)) continue;

    if (field.kind === "dateRange") {
      if (!field.range) continue;
      const range = isRelative(value) ? resolveRelative(value, today) : (value as DateRangeValue);
      if (range.start) payload[field.range[0]] = range.start;
      if (range.end) payload[field.range[1]] = range.end;
    } else if (field.kind === "toggle") {
      payload[field.id] = true;
    } else if (field.kind === "text" || field.kind === "select" || field.kind === "multiselect") {
      payload[field.textField ?? field.id] = value;
    } else {
      payload[field.id] = value;
    }
  }
  return payload;
}

function optionLabel(field: BarField, value: unknown): string {
  const opt = field.options.find((o) => o.value === value);
  return opt?.label ?? String(value);
}

function listLabel(field: BarField, items: unknown[]): string {
  const shown = items.slice(0, COLLAPSE_AFTER).map((i) => optionLabel(field, i));
  const rest = items.length - COLLAPSE_AFTER;
  return rest > 0 ? `${shown.join(", ")} +${rest}` : shown.join(", ");
}

function numberLabel(v: NumberValue): string {
  switch (v.op) {
    case "gte":
      return `≥ ${v.min}`;
    case "lte":
      return `≤ ${v.max}`;
    case "eq":
      return `= ${v.min}`;
    default:
      return `${v.min} – ${v.max}`;
  }
}

export function pillLabel(field: BarField, value: SearchBarValue, t: (k: string) => string): string {
  switch (field.kind) {
    case "dateRange": {
      if (isRelative(value)) return t(`COMPONENTS.ORGANISMS.VC_SEARCH_BAR.DATE.${relativeOf(value.relative).key}`);
      const { start, end } = value as DateRangeValue;
      return `${start ?? ""} – ${end ?? ""}`.trim();
    }
    case "toggle":
      return field.label;
    case "number":
      return numberLabel(value as NumberValue);
    case "custom": {
      const filter = field.source.filter as { label: (v: unknown) => string };
      return filter.label(value);
    }
    default: {
      if (isNot(value)) return listLabel(field, value.not);
      if (Array.isArray(value)) return listLabel(field, value);
      return optionLabel(field, value);
    }
  }
}

/** A chip's value: several values read "First +N"; `title` lists them all. "Is not" comes first */
export function chipLabel(
  field: BarField,
  value: SearchBarValue,
  t: (k: string) => string,
): { text: string; title: string } {
  const not = isNot(value);
  const items = not ? value.not : Array.isArray(value) ? value : undefined;
  const prefix = not ? `${t("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.OPERATOR.NOT")} ` : "";
  if (!items || field.kind === "custom") {
    const label = prefix + pillLabel(field, value, t);
    return { text: label, title: label };
  }
  const labels = items.map((i) => optionLabel(field, i));
  const more = labels.length > 1 ? ` +${labels.length - 1}` : "";
  return { text: `${prefix}${labels[0] ?? ""}${more}`, title: prefix + labels.join(", ") };
}

export type NumberOp = NumberValue["op"];

const finite = (s: string | number | null | undefined): number | undefined => {
  const trimmed = String(s ?? "").trim();
  const n = trimmed === "" ? NaN : Number(trimmed);
  return Number.isFinite(n) ? n : undefined;
};

/** A NumberValue from typed text; never one with a bound missing for its op */
export function buildNumber(
  op: NumberOp,
  first: string | number | null | undefined,
  second?: string | number | null,
): NumberValue | undefined {
  const a = finite(first);
  const b = finite(second);
  switch (op) {
    case "gte":
    case "eq":
      return a === undefined ? undefined : { op, min: a };
    case "lte":
      return a === undefined ? undefined : { op, max: a };
    default:
      return a === undefined || b === undefined ? undefined : { op: "between", min: a, max: b };
  }
}

/** A date-picker range model to a { start, end } value; undefined when both ends are empty */
export function pickerToRange(v: unknown): { start?: string; end?: string } | undefined {
  const [a, b] = Array.isArray(v) ? (v as (Date | string | null)[]) : [];
  const ymd = (x: Date | string | null | undefined) => (x ? toYmd(new Date(x)) : undefined);
  const start = ymd(a);
  const end = ymd(b);
  return start || end ? { start, end } : undefined;
}
