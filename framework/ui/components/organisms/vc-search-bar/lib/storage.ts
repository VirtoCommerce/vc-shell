import type { SearchBarView } from "../types";

const storageKey = (key: string) => `VC_SEARCHBAR_${key.toUpperCase()}`;

const isPlainObject = (x: unknown): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x);

/**
 * @internal A user view, or a module view override (scope "module", same id as the module view,
 * replaces its values).
 */
export interface StoredView extends SearchBarView {
  scope: "module" | "user";
}

/** @internal */
export interface ViewStore {
  list(): StoredView[];
  save(v: StoredView): void;
  remove(id: string): void;
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

// `v: 2` entries; a `v: 1` entry (presets of older versions) reads as empty and is replaced on save
function readViews(key: string): StoredView[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey(key)) ?? "null");
    if (isPlainObject(parsed) && parsed.v === 2 && Array.isArray(parsed.views))
      return parsed.views.filter(isStoredView);
  } catch {
    // unavailable or malformed storage reads as empty
  }
  return [];
}

/** @internal */
export function createLocalViewStore(key: string): ViewStore {
  let cache: StoredView[] | null = null;
  const load = () => (cache ??= readViews(key));
  const persist = () => {
    try {
      localStorage.setItem(storageKey(key), JSON.stringify({ v: 2, views: load() }));
    } catch {
      // quota or blocked storage: views live in memory only
    }
  };
  return {
    list: () => [...load()],
    save(v) {
      const list = load();
      const i = list.findIndex((x) => x.id === v.id);
      if (i >= 0) list[i] = v;
      else list.push(v);
      persist();
    },
    remove(id) {
      cache = load().filter((x) => x.id !== id);
      persist();
    },
  };
}
