import type { NumberValue, SearchBarState, SearchBarValue } from "../types";
import type { BarField } from "./fields";
import { RELATIVE_DATES, acceptValue, isEmptyValue, isNot } from "./values";

// The applied filters as one readable URL value: `status:Paid,New;!type:A;created:7d;total:>=100`.
// `\` escapes `\ ; , :` inside ids and values; the search words are not part of it.

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const escape = (s: string) => s.replace(/[\\;,:]/g, "\\$&");
const escapeId = (id: string) => escape(id).replace(/^!/, "\\$&");
const unescape = (s: string) => s.replace(/\\(.?)/g, "$1");

/** Splits on `sep` where it is not escaped; the parts keep their escapes */
function splitUnescaped(s: string, sep: string): string[] {
  const parts: string[] = [];
  let cur = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "\\") {
      cur += s.slice(i, i + 2);
      i++;
    } else if (ch === sep) {
      parts.push(cur);
      cur = "";
    } else cur += ch;
  }
  parts.push(cur);
  return parts;
}

function encodeNumber(v: NumberValue): string | undefined {
  switch (v.op) {
    case "gte":
      return `>=${v.min}`;
    case "lte":
      return `<=${v.max}`;
    case "eq":
      return `=${v.min}`;
    case "between":
      return `${v.min}..${v.max}`;
  }
}

function encodeValue(field: BarField, value: SearchBarValue): string | undefined {
  switch (field.kind) {
    case "text":
      return typeof value === "string" ? escape(value) : undefined;
    case "select":
    case "multiselect": {
      const list = isNot(value) ? value.not : Array.isArray(value) ? value : [value];
      return list.map((x) => escape(String(x))).join(",");
    }
    case "dateRange": {
      const v = value as { relative?: string; start?: string; end?: string };
      return v.relative ?? `${v.start ?? ""}..${v.end ?? ""}`;
    }
    case "toggle":
      return value === true ? "1" : undefined;
    case "number":
      return encodeNumber(value as NumberValue);
    case "custom": {
      const json = JSON.stringify(value);
      return json === undefined ? undefined : escape(json);
    }
  }
}

/** The applied state as the URL value; "" when nothing is applied */
export function stateToUrl(fields: BarField[], state: SearchBarState): string {
  const byId = new Map(fields.map((f) => [f.id, f]));
  const segments: string[] = [];
  for (const [id, value] of Object.entries(state.values)) {
    const field = byId.get(id);
    if (!field || isEmptyValue(value)) continue;
    const encoded = encodeValue(field, value);
    if (encoded === undefined) continue;
    segments.push(`${isNot(value) ? "!" : ""}${escapeId(id)}:${encoded}`);
  }
  return segments.join(";");
}

const finite = (s: string): number | undefined => {
  const n = s.trim() === "" ? NaN : Number(s);
  return Number.isFinite(n) ? n : undefined;
};

function decodeNumber(raw: string): NumberValue | undefined {
  for (const [prefix, op] of [
    [">=", "gte"],
    ["<=", "lte"],
    ["=", "eq"],
  ] as const) {
    if (!raw.startsWith(prefix)) continue;
    const n = finite(raw.slice(prefix.length));
    if (n === undefined) return undefined;
    return op === "lte" ? { op, max: n } : { op, min: n };
  }
  const at = raw.indexOf("..", 1);
  if (at < 0) return undefined;
  const min = finite(raw.slice(0, at));
  const max = finite(raw.slice(at + 2));
  return min === undefined || max === undefined ? undefined : { op: "between", min, max };
}

function decodeDate(raw: string): SearchBarValue | undefined {
  const relative = RELATIVE_DATES.find((r) => r.id === raw);
  if (relative) return { relative: relative.id };
  const at = raw.indexOf("..");
  if (at < 0) return undefined;
  const start = raw.slice(0, at);
  const end = raw.slice(at + 2);
  if (!start && !end) return undefined;
  if ([start, end].some((d) => d && !DATE_RE.test(d))) return undefined;
  return { ...(start ? { start } : {}), ...(end ? { end } : {}) };
}

function decodeValue(field: BarField, raw: string, negated: boolean): SearchBarValue | undefined {
  const isSelect = field.kind === "select" || field.kind === "multiselect";
  if (negated && !(isSelect && field.operators.includes("not"))) return undefined;

  switch (field.kind) {
    case "text": {
      const text = unescape(raw);
      return text || undefined;
    }
    case "select":
    case "multiselect": {
      const items = splitUnescaped(raw, ",")
        .map(unescape)
        .filter((x) => x !== "");
      if (!items.length) return undefined;
      const values = items.map((x) => field.options.find((o) => String(o.value) === x)?.value ?? x);
      if (negated) return { not: values };
      if (field.kind === "multiselect") return values;
      return values.length === 1 ? values[0] : undefined;
    }
    case "dateRange":
      return decodeDate(raw);
    case "toggle":
      return raw === "1" ? true : undefined;
    case "number":
      return decodeNumber(raw);
    case "custom": {
      let parsed: unknown;
      try {
        parsed = JSON.parse(unescape(raw));
      } catch {
        return undefined;
      }
      return acceptValue(field, parsed);
    }
  }
}

/**
 * The applied state from a URL value, or null when it holds nothing usable.
 * Unknown field ids and malformed segments are dropped; it never throws.
 */
export function urlToState(fields: BarField[], raw: string): SearchBarState | null {
  const byId = new Map(fields.map((f) => [f.id, f]));
  const values: Record<string, SearchBarValue> = {};
  for (const segment of splitUnescaped(raw, ";")) {
    const negated = segment.startsWith("!");
    const parts = splitUnescaped(negated ? segment.slice(1) : segment, ":");
    if (parts.length !== 2) continue;
    const field = byId.get(unescape(parts[0]));
    if (!field) continue;
    const value = decodeValue(field, parts[1], negated);
    if (value !== undefined && !isEmptyValue(value)) values[field.id] = value;
  }
  return Object.keys(values).length ? { search: "", values } : null;
}

/** Segments of a URL value whose field id is not among `fields` (kept escaped, as written) */
export function unknownSegments(fields: BarField[], raw: string): string[] {
  if (!raw) return [];
  const known = new Set(fields.map((f) => f.id));
  return splitUnescaped(raw, ";").filter((segment) => {
    const parts = splitUnescaped(segment.startsWith("!") ? segment.slice(1) : segment, ":");
    return parts.length === 2 && parts[0] !== "" && !known.has(unescape(parts[0]));
  });
}
