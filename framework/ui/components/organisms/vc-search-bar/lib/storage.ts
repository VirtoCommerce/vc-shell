import type { SearchBarPreset, SearchBarView } from "../types";

/** @internal */
export interface StoredPreset extends SearchBarPreset {
  scope: "module" | "user";
  updatedAt: string;
  hidden?: boolean;
  baseVersion?: number;
  edited?: boolean;
}

/** @internal */
export interface PresetStore {
  list(): Promise<StoredPreset[]>;
  save(p: Omit<StoredPreset, "updatedAt"> & { updatedAt?: string }): Promise<void>;
  remove(id: string): Promise<void>;
}

interface Entry {
  v: 1;
  presets: StoredPreset[];
}

const storageKey = (key: string) => `VC_SEARCHBAR_${key.toUpperCase()}`;
// Presets moved aside so the view store owns the main key; both go away together
const presetKey = (key: string) => `${storageKey(key)}_PRESETS`;

const isPlainObject = (x: unknown): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x);

function isStoredPreset(p: unknown): p is StoredPreset {
  return (
    isPlainObject(p) &&
    typeof p.id === "string" &&
    typeof p.name === "string" &&
    (p.scope === "module" || p.scope === "user") &&
    isPlainObject(p.values)
  );
}

function readEntry(key: string): Entry {
  try {
    const raw = localStorage.getItem(presetKey(key));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.v === 1) {
        return {
          v: 1,
          presets: Array.isArray(parsed.presets) ? parsed.presets.filter(isStoredPreset) : [],
        };
      }
    }
  } catch {
    // unavailable or malformed storage reads as empty
  }
  return { v: 1, presets: [] };
}

function writeEntry(key: string, entry: Entry): void {
  try {
    localStorage.setItem(presetKey(key), JSON.stringify(entry));
  } catch {
    // quota or blocked storage: state is simply not persisted
  }
}

/** @internal */
export function createLocalPresetStore(key: string): PresetStore {
  let cache: StoredPreset[] | null = null;
  const load = () => (cache ??= readEntry(key).presets);
  const persist = () => {
    const entry = readEntry(key);
    entry.presets = load();
    writeEntry(key, entry);
  };
  return {
    async list() {
      return [...load()];
    },
    async save(p) {
      const next: StoredPreset = { ...p, updatedAt: new Date().toISOString() };
      const list = load();
      const i = list.findIndex((x) => x.id === p.id);
      if (i >= 0) list[i] = next;
      else list.push(next);
      persist();
    },
    async remove(id) {
      cache = load().filter((x) => x.id !== id);
      persist();
    },
  };
}

/** @internal */
export function mergeModulePresets(module: SearchBarPreset[], stored: StoredPreset[]): StoredPreset[] {
  const byId = new Map(stored.map((s) => [s.id, s]));
  const now = new Date().toISOString();
  const merged: StoredPreset[] = module.map((m) => {
    const s = byId.get(m.id);
    if (!s || s.scope !== "module") return { ...m, scope: "module", updatedAt: now };
    if (s.edited) return { ...s, baseVersion: m.version };
    const unchanged = s.version === m.version && JSON.stringify(s.values) === JSON.stringify(m.values);
    return {
      ...m,
      scope: "module",
      updatedAt: unchanged ? s.updatedAt : now,
      hidden: s.hidden,
      pinned: s.pinned ?? m.pinned,
    };
  });
  const moduleIds = new Set(module.map((m) => m.id));
  const users = stored.filter((s) => s.scope === "user" && !moduleIds.has(s.id));
  return [...merged, ...users];
}

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
