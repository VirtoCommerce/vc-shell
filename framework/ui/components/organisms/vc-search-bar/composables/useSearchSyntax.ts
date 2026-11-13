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
  /** The field already holds this value */
  selected?: boolean;
}

const TYPABLE = new Set(["select", "multiselect", "toggle", "dateRange"]);
const ON = "on";
const lower = (s: unknown) => String(s).toLowerCase();

const typable = (fields: BarField[]) => fields.filter((f) => TYPABLE.has(f.kind));
const byKey = (fields: BarField[], key: string) => typable(fields).find((f) => lower(f.key) === lower(key));

function isSelected(f: BarField, token: string, current: unknown): boolean {
  if (f.kind === "toggle") return current === true;
  if (f.kind === "dateRange")
    return typeof current === "object" && current !== null && (current as { relative?: unknown }).relative === token;
  if (f.kind === "multiselect") return Array.isArray(current) && current.some((x) => String(x) === token);
  return current !== undefined && String(current) === token;
}

function valueSuggestions(f: BarField, typed: string, current: unknown): Suggestion[] {
  const v = lower(typed);
  const item = (token: string, label: string, labelKey?: string): Suggestion => ({
    kind: "value",
    fieldId: f.id,
    label,
    labelKey,
    text: `${lower(f.key)}:${token} `,
    selected: isSelected(f, token, current),
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
export function getSuggestions(
  query: string,
  fields: BarField[],
  values: Record<string, unknown> = {},
): { items: Suggestion[]; explicit: boolean } {
  const word = /(\S+)$/.exec(query)?.[1] ?? "";
  const colon = word.indexOf(":");
  if (colon > 0) {
    const field = byKey(fields, word.slice(0, colon));
    return { items: field ? valueSuggestions(field, word.slice(colon + 1), values[field.id]) : [], explicit: true };
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
  const prefixed = f.options.filter((o) => lower(o.value).startsWith(v) || lower(o.label).startsWith(v));
  // a prefix commits only when it names one option: "p" of Pending/Paid stays text
  const option = exact ?? (prefixed.length === 1 ? prefixed[0] : undefined);
  if (!option) return undefined;
  return f.kind === "multiselect" ? [option.value] : option.value;
}

const TYPED_RE = /(^|\s)([^\s:]+):(\S+) $/;

/** `field:value` followed by a space at the end of `next` becomes a chip; unknown fields or values stay text */
export function chipFromTyped(
  next: string,
  fields: BarField[],
): { fieldId: string; value: unknown; rest: string } | null {
  const m = TYPED_RE.exec(next);
  if (!m) return null;
  const field = byKey(fields, m[2]);
  if (!field) return null;
  const value = resolveValue(field, m[3]);
  if (value === undefined) return null;
  // one space stays after the text left, so the next typed word starts a new one
  const before = next.slice(0, m.index).trimEnd();
  return { fieldId: field.id, value, rest: before && `${before} ` };
}

/** `field:value ` whose value is the prefix of several options: the space waits for a pick */
export function isAmbiguousTyped(next: string, fields: BarField[]): boolean {
  const m = TYPED_RE.exec(next);
  const field = m && byKey(fields, m[2]);
  return !!field && !chipFromTyped(next, fields) && valueSuggestions(field, m[3], undefined).length > 1;
}
