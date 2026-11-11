import type { BarField } from "../lib/fields";
import { RELATIVE_DATES } from "../lib/values";

export interface Suggestion {
  kind: "field" | "value";
  fieldId: string;
  /** Shown text; `labelKey` wins when set */
  label: string;
  labelKey?: string;
  /** Replaces the word being typed */
  text: string;
}

const TYPABLE = new Set(["select", "multiselect", "toggle", "dateRange"]);
const ON = "on";
const lower = (s: unknown) => String(s).toLowerCase();

const typable = (fields: BarField[]) => fields.filter((f) => TYPABLE.has(f.kind));
const byKey = (fields: BarField[], key: string) => typable(fields).find((f) => lower(f.key) === lower(key));

function valueSuggestions(f: BarField, typed: string): Suggestion[] {
  const v = lower(typed);
  const item = (token: string, label: string, labelKey?: string): Suggestion => ({
    kind: "value",
    fieldId: f.id,
    label,
    labelKey,
    text: `${lower(f.key)}:${token} `,
  });
  if (f.kind === "toggle") return ON.startsWith(v) ? [item(ON, ON)] : [];
  if (f.kind === "dateRange")
    return RELATIVE_DATES.filter((r) => r.id.startsWith(v)).map((r) =>
      item(r.id, r.id, `COMPONENTS.ORGANISMS.VC_SEARCH_BAR.DATE.${r.key}`),
    );
  // a value with a space cannot be typed as one word
  return f.options
    .filter((o) => !/\s/.test(String(o.value)))
    .filter((o) => lower(o.value).startsWith(v) || lower(o.label).startsWith(v))
    .map((o) => item(String(o.value), o.label));
}

/** Suggestions for the word at the end of `query`: values after `field:`, fields after 2+ letters */
export function getSuggestions(query: string, fields: BarField[]): { items: Suggestion[]; explicit: boolean } {
  const word = /(\S+)$/.exec(query)?.[1] ?? "";
  const colon = word.indexOf(":");
  if (colon > 0) {
    const field = byKey(fields, word.slice(0, colon));
    return { items: field ? valueSuggestions(field, word.slice(colon + 1)) : [], explicit: true };
  }
  if (word.length < 2) return { items: [], explicit: false };
  const w = lower(word);
  const items = typable(fields)
    .filter((f) => lower(f.key).startsWith(w) || lower(f.label).startsWith(w))
    .map<Suggestion>((f) => ({ kind: "field", fieldId: f.id, label: f.label, text: `${lower(f.key)}:` }));
  return { items, explicit: false };
}

function resolveValue(f: BarField, typed: string): unknown {
  const v = lower(typed);
  if (f.kind === "toggle") return v === ON ? true : undefined;
  if (f.kind === "dateRange") {
    const r = RELATIVE_DATES.find((x) => x.id === v);
    return r ? { relative: r.id } : undefined;
  }
  const exact = f.options.find((o) => lower(o.value) === v || lower(o.label) === v);
  const option = exact ?? f.options.find((o) => lower(o.value).startsWith(v) || lower(o.label).startsWith(v));
  if (!option) return undefined;
  return f.kind === "multiselect" ? [option.value] : option.value;
}

/** `field:value` followed by a space at the end of `next` becomes a chip; unknown fields or values stay text */
export function chipFromTyped(
  next: string,
  fields: BarField[],
): { fieldId: string; value: unknown; rest: string } | null {
  const m = /(^|\s)([^\s:]+):(\S+) $/.exec(next);
  if (!m) return null;
  const field = byKey(fields, m[2]);
  if (!field) return null;
  const value = resolveValue(field, m[3]);
  if (value === undefined) return null;
  return { fieldId: field.id, value, rest: next.slice(0, m.index).trimEnd() };
}
