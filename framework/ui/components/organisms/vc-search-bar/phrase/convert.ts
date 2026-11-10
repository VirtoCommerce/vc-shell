import type { NotValue, NumberValue, RelativeDate, SearchBarState, SearchBarValue } from "../types";
import type { BarField } from "../lib/fields";
import { isEmptyValue, RELATIVE_DATES, resolveRelative } from "../lib/values";
import { parsePhrase, PhraseError, quote, type PhraseCond, type PhraseNode, type PhraseRange } from "./parse";

type DateRangeValue = { start?: string; end?: string };
type RelativeKey = RelativeDate["relative"];

const DATE_RE = /^\d{4}-\d{2}-\d{2}(T[\d:.+\-Z]*)?$/;
const NUMBER_RE = /^-?\d+(\.\d+)?$/;

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

export function matchRelative(start: string, end: string, today: Date): RelativeKey | null {
  for (const { id: relative } of RELATIVE_DATES) {
    const r = resolveRelative({ relative }, today);
    if (r.start === start && r.end === end) return relative;
  }
  return null;
}

function rangeText(lo: string | undefined, hi: string | undefined): string {
  return `[${lo !== undefined ? `${quote(lo)} ` : ""}TO${hi !== undefined ? ` ${quote(hi)}` : ""}]`;
}

function fieldPhrase(field: BarField, value: SearchBarValue, today: Date): string {
  const key = field.key;
  switch (field.kind) {
    case "toggle":
      return `${key}:true`;
    case "dateRange": {
      const r =
        isObject(value) && "relative" in value
          ? resolveRelative(value as RelativeDate, today)
          : (value as DateRangeValue);
      return `${key}:${rangeText(r.start || undefined, r.end || undefined)}`;
    }
    case "number": {
      const n = value as NumberValue;
      switch (n.op) {
        case "gte":
          return `${key}:${rangeText(String(n.min), undefined)}`;
        case "lte":
          return `${key}:${rangeText(undefined, String(n.max))}`;
        case "eq":
          return `${key}:${quote(String(n.min))}`;
        default:
          return `${key}:${rangeText(String(n.min), String(n.max))}`;
      }
    }
    case "custom": {
      const filter = field.source.filter as { toPhrase?: (v: unknown) => string };
      return filter.toPhrase ? filter.toPhrase(value) : `${key}:${quote(String(value))}`;
    }
    default: {
      const not = isObject(value) && Array.isArray((value as NotValue).not);
      const list = not ? (value as NotValue).not : Array.isArray(value) ? value : [value];
      return `${not ? "!" : ""}${key}:${list.map((v) => quote(String(v))).join(",")}`;
    }
  }
}

export function stateToPhrase(fields: BarField[], state: SearchBarState, today: Date = new Date()): string {
  const parts: string[] = [];
  const search = state.search.trim();
  if (search) parts.push(search);
  for (const field of fields) {
    const value = state.values[field.id];
    if (isEmptyValue(value)) continue;
    parts.push(fieldPhrase(field, value, today));
  }
  return parts.join(" ");
}

type Reason = { reason: string };
const fail = (reason: string): Reason => ({ reason });

function collect(node: PhraseNode, conds: PhraseCond[], words: string[]): Reason | null {
  switch (node.k) {
    case "or":
      return fail("OR_BETWEEN_FIELDS");
    case "and":
      if (node.paren) return fail("BRACKETS");
      for (const item of node.items) {
        const err = collect(item, conds, words);
        if (err) return err;
      }
      return null;
    case "cond":
      conds.push(node.c);
      return null;
    default:
      words.push(node.quoted ? `"${node.v.replace(/["\\]/g, "\\$&")}"` : quote(node.v));
      return null;
  }
}

function readRange(ranges: PhraseRange[]): { lo?: string; hi?: string } | Reason {
  if (ranges.length !== 1) return fail("PARSE");
  const r = ranges[0];
  if ((r.lo !== undefined && !r.loInc) || (r.hi !== undefined && !r.hiInc)) return fail("EXCLUSIVE_BOUND");
  return { lo: r.lo, hi: r.hi };
}

function readValue(field: BarField, cond: PhraseCond, today: Date): { value: SearchBarValue } | Reason {
  if (field.kind === "custom") return fail("CUSTOM_FIELD");
  if (cond.neg && !(field.operators.includes("not") && (field.kind === "select" || field.kind === "multiselect")))
    return fail("NOT_ALLOWED");

  if (cond.kind === "values" && cond.values.length > 1 && !cond.neg && field.kind !== "multiselect")
    return fail("MULTI_VALUE");

  if (field.kind === "dateRange" || field.kind === "number") {
    const r = cond.kind === "range" ? readRange(cond.ranges) : { lo: cond.values[0], hi: cond.values[0] };
    if ("reason" in r) return r;
    if (field.kind === "dateRange") {
      if (![r.lo, r.hi].every((d) => d === undefined || DATE_RE.test(d))) return fail("PARSE");
      const relative = r.lo && r.hi ? matchRelative(r.lo, r.hi, today) : null;
      return { value: relative ? { relative } : { start: r.lo, end: r.hi } };
    }
    if (![r.lo, r.hi].every((n) => n === undefined || NUMBER_RE.test(n))) return fail("PARSE");
    const min = r.lo === undefined ? undefined : Number(r.lo);
    const max = r.hi === undefined ? undefined : Number(r.hi);
    if (!Number.isFinite(min ?? 0) || !Number.isFinite(max ?? 0)) return fail("PARSE");
    if (cond.kind === "values") return { value: { op: "eq", min } };
    if (min !== undefined && max !== undefined) return { value: { op: "between", min, max } };
    return { value: min !== undefined ? { op: "gte", min } : { op: "lte", max } };
  }

  if (cond.kind === "range") return fail("PARSE");
  if (field.kind === "toggle")
    return cond.values.length === 1 && cond.values[0] === "true" ? { value: true } : fail("PARSE");

  const values = cond.values.map((v) => field.options.find((o) => String(o.value) === v)?.value ?? v);
  if (cond.neg) return { value: { not: values.map(String) } };
  if (field.kind === "multiselect") return { value: values };
  return { value: values[0] };
}

export function phraseToState(
  src: string,
  fields: BarField[],
  today: Date = new Date(),
): { state: SearchBarState } | Reason {
  let node: PhraseNode | null;
  try {
    node = parsePhrase(src);
  } catch (e) {
    if (e instanceof PhraseError) return fail("PARSE");
    throw e;
  }
  const conds: PhraseCond[] = [];
  const words: string[] = [];
  if (node) {
    const err = collect(node, conds, words);
    if (err) return err;
  }

  const values: Record<string, SearchBarValue> = {};
  for (const cond of conds) {
    const name = cond.field.toLowerCase();
    const field = fields.find((f) => f.key.toLowerCase() === name);
    if (!field) return fail("UNKNOWN_FIELD");
    if (field.id in values) return fail("FIELD_TWICE");
    const read = readValue(field, cond, today);
    if ("reason" in read) return read;
    values[field.id] = read.value;
  }
  return { state: { search: words.join(" "), values } };
}
