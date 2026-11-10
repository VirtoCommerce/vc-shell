import type { SearchBarPreset } from "../types";

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
    const raw = localStorage.getItem(storageKey(key));
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
    localStorage.setItem(storageKey(key), JSON.stringify(entry));
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
