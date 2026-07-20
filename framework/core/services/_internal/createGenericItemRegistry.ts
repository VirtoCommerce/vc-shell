import type { ComputedRef } from "vue";
import { createSimpleMapRegistry } from "@core/services/_internal/createSimpleMapRegistry";
import type { PreregistrationBus } from "@core/services/_internal/createPreregistrationBus";

/**
 * A register/unregister/items service backed by a {@link createSimpleMapRegistry},
 * with preregistered items replayed in from a {@link PreregistrationBus}.
 */
export interface GenericItemService<TItem, TOptions> {
  register: (options: TOptions) => string;
  unregister: (id: string) => void;
  items: ComputedRef<TItem[]>;
}

/**
 * Options for {@link createGenericItemRegistry}.
 */
export interface GenericItemRegistryOptions<TItem extends { id: string; order?: number }, TOptions> {
  /** Maps register options to a stored item. `currentSize` is the pre-insert map size. */
  createItem: (options: TOptions, currentSize: number) => TItem;
  /** Extracts the id from register options (falsy → a UUID is generated). */
  getId: (options: TOptions) => string;
  /** Bus whose preregistered items are replayed into the created service. */
  bus: Pick<PreregistrationBus<TOptions, GenericItemService<TItem, TOptions>>, "replayInto">;
}

/**
 * Builds a register/unregister/items service around a simple map registry and
 * replays any preregistered items from the bus. Shared by the structurally
 * identical app-bar and settings-menu services.
 */
export function createGenericItemRegistry<TItem extends { id: string; order?: number }, TOptions>(
  options: GenericItemRegistryOptions<TItem, TOptions>,
): GenericItemService<TItem, TOptions> {
  const mapRegistry = createSimpleMapRegistry<TItem, TOptions>({
    createItem: options.createItem,
    getId: options.getId,
  });

  const service: GenericItemService<TItem, TOptions> = {
    register: (opts) => mapRegistry.register(opts),
    unregister: (id) => mapRegistry.unregister(id),
    items: mapRegistry.sortedItems,
  };

  options.bus.replayInto(service);

  return service;
}
