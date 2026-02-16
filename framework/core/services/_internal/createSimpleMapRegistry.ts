import { ref, computed, type Ref, type ComputedRef } from "vue";

export interface SimpleMapRegistryOptions<TItem, TOptions> {
  createItem: (options: TOptions, currentSize: number) => TItem;
  getId: (options: TOptions) => string;
}

export interface SimpleMapRegistry<TItem extends { id: string; order?: number }, TOptions> {
  readonly itemsMap: Ref<Map<string, TItem>>;
  readonly sortedItems: ComputedRef<TItem[]>;
  register(options: TOptions): string;
  unregister(id: string): void;
}

export function createSimpleMapRegistry<TItem extends { id: string; order?: number }, TOptions>(
  options: SimpleMapRegistryOptions<TItem, TOptions>,
): SimpleMapRegistry<TItem, TOptions> {
  const itemsMap = ref<Map<string, TItem>>(new Map()) as Ref<Map<string, TItem>>;

  const sortedItems = computed<TItem[]>(() => {
    return Array.from(itemsMap.value.values()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  });

  function register(opts: TOptions): string {
    const id = options.getId(opts) || crypto.randomUUID();
    const item = options.createItem(opts, itemsMap.value.size);
    itemsMap.value.set(id, { ...item, id } as TItem);
    return id;
  }

  function unregister(id: string): void {
    itemsMap.value.delete(id);
  }

  return {
    itemsMap,
    sortedItems,
    register,
    unregister,
  };
}
