import type { SearchBarPreset, SearchBarValue } from "../types";
import type { BarField } from "./fields";
import { isEmptyValue, pillLabel } from "./values";

type Values = Record<string, SearchBarValue>;

const MAX_NAME_LENGTH = 40;

function canonical(v: unknown): string {
  if (Array.isArray(v)) return JSON.stringify(v.map(canonical).sort());
  if (typeof v === "object" && v !== null) {
    const o = v as Record<string, unknown>;
    return JSON.stringify(
      Object.keys(o)
        .sort()
        .map((k) => [k, canonical(o[k])]),
    );
  }
  return JSON.stringify(v ?? null);
}

const same = (a: unknown, b: unknown) => canonical(a) === canonical(b);

/** Preset fields that exist in `fields` and carry a value */
function presetEntries(fields: BarField[], preset: SearchBarPreset) {
  return fields
    .filter((f) => !isEmptyValue(preset.values[f.id]))
    .map((f) => ({ field: f, value: preset.values[f.id] }));
}

const isList = (field: BarField, ...vs: unknown[]) => field.kind === "multiselect" && vs.every(Array.isArray);

export function applyPreset(fields: BarField[], values: Values, preset: SearchBarPreset): Values {
  const next: Values = { ...values };
  for (const { field, value } of presetEntries(fields, preset)) {
    const current = next[field.id];
    if (isList(field, current, value)) {
      const union = [...(current as unknown[])];
      for (const item of value as unknown[]) if (!union.some((u) => same(u, item))) union.push(item);
      next[field.id] = union;
    } else {
      next[field.id] = value;
    }
  }
  return next;
}

export function removePreset(fields: BarField[], values: Values, preset: SearchBarPreset): Values {
  const next: Values = { ...values };
  for (const { field, value } of presetEntries(fields, preset)) {
    const current = next[field.id];
    if (isList(field, current, value)) {
      const rest = (current as unknown[]).filter((c) => !(value as unknown[]).some((p) => same(p, c)));
      if (rest.length) next[field.id] = rest;
      else delete next[field.id];
    } else if (same(current, value)) {
      delete next[field.id];
    }
  }
  return next;
}

export function isPresetLit(fields: BarField[], values: Values, preset: SearchBarPreset, search = ""): boolean {
  if (preset.search && preset.search !== search) return false;
  const entries = presetEntries(fields, preset);
  if (!entries.length && !preset.search) return false;
  return entries.every(({ field, value }) => {
    const current = values[field.id];
    if (isList(field, current, value)) {
      return (value as unknown[]).every((p) => (current as unknown[]).some((c) => same(c, p)));
    }
    return same(current, value);
  });
}

/** Every condition of `a` is also a condition of `b` (multiselect as subset) */
function covers(fields: BarField[], b: SearchBarPreset, a: SearchBarPreset): boolean {
  if (a.search && a.search !== b.search) return false;
  const bEntries = presetEntries(fields, b);
  return presetEntries(fields, a).every(({ field, value }) => {
    const other = bEntries.find((e) => e.field.id === field.id)?.value;
    if (other === undefined) return false;
    if (isList(field, other, value))
      return (value as unknown[]).every((v) => (other as unknown[]).some((o) => same(o, v)));
    return same(other, value);
  });
}

/**
 * Ids of the presets to show as lit: every preset whose values are present, minus those
 * strictly contained in another lit preset (B = A + more conditions lights only B).
 * Equal presets stay lit together. Display only: a click toggles on presence
 * (`isPresetLit`), so clicking a contained chip shown unlit removes its values.
 */
export function litPresetIds(
  fields: BarField[],
  values: Values,
  search: string,
  presets: SearchBarPreset[],
): Set<string> {
  const lit = presets.filter((p) => isPresetLit(fields, values, p, search));
  const kept = lit.filter((a) => !lit.some((b) => b !== a && covers(fields, b, a) && !covers(fields, a, b)));
  return new Set(kept.map((p) => p.id));
}

/** Search text after applying the preset's search, if it has one */
export function applyPresetSearch(preset: SearchBarPreset, search: string): string {
  return preset.search ? preset.search : search;
}

/** Search text after removing the preset: cleared only when it equals the preset's search */
export function removePresetSearch(preset: SearchBarPreset, search: string): string {
  return preset.search && preset.search === search ? "" : search;
}

export function sameValues(fields: BarField[], a: Values, b: Values): boolean {
  return fields.every((f) => {
    const x = a[f.id];
    const y = b[f.id];
    const ex = isEmptyValue(x);
    const ey = isEmptyValue(y);
    if (ex || ey) return ex === ey;
    return same(x, y);
  });
}

export function suggestPresetName(fields: BarField[], values: Values, t: (k: string) => string): string {
  const name = fields
    .filter((f) => !isEmptyValue(values[f.id]))
    .map((f) => pillLabel(f, values[f.id], t))
    .join(", ");
  return name.length > MAX_NAME_LENGTH ? `${name.slice(0, MAX_NAME_LENGTH - 1)}…` : name;
}
