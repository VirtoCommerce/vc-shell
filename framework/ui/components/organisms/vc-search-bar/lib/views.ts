import type { SearchBarValue, SearchBarView } from "../types";
import type { BarField } from "./fields";
import { isEmptyValue } from "./values";

type Values = Record<string, SearchBarValue>;

/** Id of the built-in view with no filters */
export const SYSTEM_VIEW_ID = "all";

/** @internal */
export interface BarView extends SearchBarView {
  scope: "system" | "module" | "user";
}

/** Order-insensitive key: arrays are sorted, object keys too */
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

/** @internal */
export const sameValue = (a: unknown, b: unknown): boolean => canonical(a) === canonical(b);

/** Equal on every field of `fields`; an empty value equals an absent one */
export function sameValues(fields: BarField[], a: Values, b: Values): boolean {
  return fields.every((f) => {
    const x = a[f.id];
    const y = b[f.id];
    const ex = isEmptyValue(x);
    const ey = isEmptyValue(y);
    if (ex || ey) return ex === ey;
    return sameValue(x, y);
  });
}

export function isViewModified(fields: BarField[], values: Values, view: BarView): boolean {
  return !sameValues(fields, values, view.values);
}
