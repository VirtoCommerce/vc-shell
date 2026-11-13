import type { SearchBarView } from "../types";
import { isUnsafeKey } from "./values";

const storageKey = (key: string) => `VC_SEARCHBAR_${key.toUpperCase()}`;

const isPlainObject = (x: unknown): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x);

/**
 * @internal A user view, or a module view override (scope "module", same id as the module view,
 * replaces its values).
 */
export interface StoredView extends SearchBarView {
  scope: "module" | "user";
}

function isStoredView(v: unknown): v is StoredView {
  return (
    isPlainObject(v) &&
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    (v.scope === "module" || v.scope === "user") &&
    isPlainObject(v.values)
  );
}

/** No `__proto__`/`constructor`/`prototype` key at any depth */
function hasSafeKeys(v: unknown): boolean {
  if (Array.isArray(v)) return v.every(hasSafeKeys);
  if (!v || typeof v !== "object") return true;
  return Object.entries(v).every(([k, x]) => !isUnsafeKey(k) && hasSafeKeys(x));
}

// Values with prototype keys are dropped here; the field checks (acceptValue) run when the view is applied
const withSafeValues = (v: StoredView): StoredView => ({
  ...v,
  values: Object.fromEntries(Object.entries(v.values).filter(([id, x]) => !isUnsafeKey(id) && hasSafeKeys(x))),
});

// `v: 2` entries; a `v: 1` entry (presets of older versions) reads as empty and is replaced on the next write
/** @internal */
export function readViews(key: string): StoredView[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey(key)) ?? "null");
    if (isPlainObject(parsed) && parsed.v === 2 && Array.isArray(parsed.views))
      return parsed.views.filter(isStoredView).map(withSafeValues);
  } catch {
    // unavailable or malformed storage reads as empty
  }
  return [];
}

/** @internal */
export function writeViews(key: string, views: StoredView[]): void {
  try {
    localStorage.setItem(storageKey(key), JSON.stringify({ v: 2, views }));
  } catch {
    // quota or blocked storage: views live in memory only
  }
}
