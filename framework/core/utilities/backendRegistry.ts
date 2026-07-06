/**
 * Backend registry primitive.
 *
 * Core modules define an interface and call `get()` lazily; the shell registers
 * the concrete implementation during plugin install. This is the "core defines
 * the interface, shell provides the backend" seam used by notifications and
 * popup. Keeps the registration wiring in one typed place instead of a
 * hand-rolled module-scoped `let` per consumer.
 */

export interface BackendRegistry<T> {
  /** Register (or replace) the backend implementation. */
  register(impl: T): void;
  /** Current backend, or `null` when none has been registered yet. */
  get(): T | null;
  /** Clear the backend. Primarily for test teardown. */
  reset(): void;
}

/**
 * Single-slot registry: one backend implementation at a time.
 *
 * @param onChange optional hook fired whenever the backend is set or reset;
 *   lets a consumer keep a live ESM binding in sync with the registry.
 */
export function createBackendRegistry<T>(onChange?: (impl: T | null) => void): BackendRegistry<T> {
  let impl: T | null = null;

  return {
    register(next: T): void {
      impl = next;
      onChange?.(impl);
    },
    get(): T | null {
      return impl;
    },
    reset(): void {
      impl = null;
      onChange?.(impl);
    },
  };
}

export interface KeyedBackendRegistry<K, V> {
  /** Register (or replace) the implementation for a key. */
  register(key: K, value: V): void;
  /** Implementation for a key, or `undefined` when unregistered. */
  get(key: K): V | undefined;
  /** Clear all registered implementations. Primarily for test teardown. */
  reset(): void;
}

/**
 * Keyed registry: several implementations addressed by a key (e.g. popup
 * presets). Backed by a `Map`.
 */
export function createKeyedBackendRegistry<K, V>(): KeyedBackendRegistry<K, V> {
  const store = new Map<K, V>();

  return {
    register(key: K, value: V): void {
      store.set(key, value);
    },
    get(key: K): V | undefined {
      return store.get(key);
    },
    reset(): void {
      store.clear();
    },
  };
}
