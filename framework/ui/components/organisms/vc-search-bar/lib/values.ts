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

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isRelative = (v: unknown): v is RelativeDate => isObject(v) && "relative" in v;
export const isNot = (v: unknown): v is NotValue => isObject(v) && Array.isArray(v.not);

const UNSAFE_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/** @internal An object key that could reach a prototype */
export const isUnsafeKey = (k: string) => UNSAFE_KEYS.has(k);

const isPrimitive = (v: unknown) =>
  v === null || typeof v === "string" || typeof v === "boolean" || (typeof v === "number" && Number.isFinite(v));
const isPrimitiveList = (v: unknown) => Array.isArray(v) && v.every(isPrimitive);

/**
 * @internal A value of the shapes the built-in editors produce: a primitive, an array of primitives,
 * or a plain object whose entries are those (no prototype keys)
 */
export function isPlainValue(v: unknown): boolean {
  if (isPrimitive(v) || isPrimitiveList(v)) return true;
  if (!isObject(v) || Object.getPrototypeOf(v) !== Object.prototype) return false;
  return Object.entries(v).every(([k, x]) => !isUnsafeKey(k) && (isPrimitive(x) || isPrimitiveList(x)));
}

/**
 * @internal A value read back from the URL or a stored view, as the field accepts it:
 * a custom field's `parse` decides, other fields take plain values only
 */
export function acceptValue(field: BarField, raw: unknown): SearchBarValue | undefined {
  const parse =
    field.kind === "custom" ? (field.source.filter as { parse?: (r: unknown) => unknown }).parse : undefined;
  if (!parse) return isPlainValue(raw) ? raw : undefined;
  try {
    return parse(raw) ?? undefined;
  } catch {
    return undefined;
  }
}

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

function resolveRelative(r: RelativeDate, today: Date): { start: string; end: string } {
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

// Dates read as the date picker shows them: in the browser's locale
const DAY: Intl.DateTimeFormatOptions = { year: "numeric", month: "numeric", day: "numeric" };
const dayLabel = (ymd?: string) => (ymd ? new Intl.DateTimeFormat(navigator.language, DAY).format(toDate(ymd)!) : "");

function numberLabel(v: NumberValue, locale?: string): string {
  const num = (n?: number) => (n === undefined ? "" : new Intl.NumberFormat(locale).format(n));
  switch (v.op) {
    case "gte":
      return `≥ ${num(v.min)}`;
    case "lte":
      return `≤ ${num(v.max)}`;
    case "eq":
      return `= ${num(v.min)}`;
    default:
      return `${num(v.min)} – ${num(v.max)}`;
  }
}

/** A single value's label; lists are labelled by chipLabel */
function valueLabel(field: BarField, value: SearchBarValue, t: (k: string) => string, locale?: string): string {
  switch (field.kind) {
    case "dateRange": {
      if (isRelative(value)) return t(`COMPONENTS.ORGANISMS.VC_SEARCH_BAR.DATE.${relativeOf(value.relative).key}`);
      const { start, end } = value as DateRangeValue;
      return `${dayLabel(start)} – ${dayLabel(end)}`.trim();
    }
    case "toggle":
      return field.label;
    case "number":
      return numberLabel(value as NumberValue, locale);
    case "custom": {
      const filter = field.source.filter as { label: (v: unknown) => string };
      return filter.label(value);
    }
    default:
      return optionLabel(field, value);
  }
}

/** A chip's value: several values read "First +N"; `title` lists them all. "Is not" comes first */
export function chipLabel(
  field: BarField,
  value: SearchBarValue,
  t: (k: string) => string,
  /** The app's language: numbers group their digits as the screen's own labels do */
  locale?: string,
): { text: string; title: string } {
  const not = isNot(value);
  const items = not ? value.not : Array.isArray(value) ? value : undefined;
  const prefix = not ? `${t("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.OPERATOR.NOT")} ` : "";
  if (!items || field.kind === "custom") {
    const label = prefix + valueLabel(field, value, t, locale);
    return { text: label, title: label };
  }
  const labels = items.map((i) => optionLabel(field, i));
  const more = labels.length > 1 ? ` +${labels.length - 1}` : "";
  return { text: `${prefix}${labels[0] ?? ""}${more}`, title: prefix + labels.join(", ") };
}

type NumberOp = NumberValue["op"];

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
      // bounds typed the wrong way round still mean that range
      return a === undefined || b === undefined
        ? undefined
        : { op: "between", min: Math.min(a, b), max: Math.max(a, b) };
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
