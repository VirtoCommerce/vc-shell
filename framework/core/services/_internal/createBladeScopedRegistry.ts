import { reactive } from "vue";

export interface BladeScopedRegistryOptions<TItem extends { id: string }, TRegistration> {
  createRegistration: (bladeId: string, item: TItem) => TRegistration;
  getRegistrationBladeId: (registration: TRegistration) => string;
  getRegistrationItemId: (registration: TRegistration) => string;
}

export interface BladeScopedRegistry<TItem extends { id: string }, TRegistration> {
  readonly registry: Record<string, TItem[]>;
  readonly registrations: TRegistration[];
  register(item: TItem, bladeId: string): void;
  unregister(itemId: string, bladeId: string): void;
  get(bladeId: string): TItem[];
  clear(bladeId: string): void;
  update(id: string, bladeId: string, partial: Partial<TItem>): void;
  isRegistered(id: string): boolean;
}

export function createBladeScopedRegistry<TItem extends { id: string }, TRegistration>(
  options: BladeScopedRegistryOptions<TItem, TRegistration>,
): BladeScopedRegistry<TItem, TRegistration> {
  const registry = reactive<Record<string, TItem[]>>({});
  // Cast needed: reactive() unwraps refs in generics, but our TRegistration types are plain objects
  const registrations = reactive([]) as TRegistration[];
  const registrationCountById = reactive(new Map<string, number>());

  function incrementCount(id: string): void {
    registrationCountById.set(id, (registrationCountById.get(id) ?? 0) + 1);
  }

  function decrementCount(id: string): void {
    const count = registrationCountById.get(id);
    if (!count || count <= 1) {
      registrationCountById.delete(id);
      return;
    }
    registrationCountById.set(id, count - 1);
  }

  function register(item: TItem, bladeId: string): void {
    const normalizedBladeId = bladeId.toLowerCase();

    if (!registry[normalizedBladeId]) {
      registry[normalizedBladeId] = [];
    }

    const existing = registry[normalizedBladeId].find((i) => i.id === item.id);
    if (existing) {
      Object.assign(existing, item, { bladeId: normalizedBladeId });
      return;
    }

    const registryItem: TItem = { ...item, bladeId: normalizedBladeId } as TItem;
    registry[normalizedBladeId].push(registryItem);
    registrations.push(options.createRegistration(normalizedBladeId, registryItem));
    incrementCount(item.id);
  }

  function unregister(itemId: string, bladeId: string): void {
    const normalizedBladeId = bladeId.toLowerCase();

    const bladeItems = registry[normalizedBladeId];
    if (bladeItems) {
      const itemIndex = bladeItems.findIndex((i) => i.id === itemId);
      if (itemIndex !== -1) {
        const [removedItem] = bladeItems.splice(itemIndex, 1);
        if (removedItem) {
          decrementCount(removedItem.id);
        }
      }
    }

    const registrationIndex = registrations.findIndex(
      (r) => options.getRegistrationBladeId(r) === normalizedBladeId && options.getRegistrationItemId(r) === itemId,
    );
    if (registrationIndex !== -1) {
      registrations.splice(registrationIndex, 1);
    }
  }

  function get(bladeId: string): TItem[] {
    const normalizedBladeId = bladeId ? bladeId.toLowerCase() : "";
    return [...(registry[normalizedBladeId] || [])];
  }

  function clear(bladeId: string): void {
    const normalizedBladeId = bladeId.toLowerCase();
    const bladeItems = registry[normalizedBladeId];

    if (bladeItems) {
      bladeItems.forEach((item) => decrementCount(item.id));
      delete registry[normalizedBladeId];
    }

    const registrationIndexes = registrations
      .map((r, index) => (options.getRegistrationBladeId(r) === normalizedBladeId ? index : -1))
      .filter((index) => index !== -1)
      .reverse();

    registrationIndexes.forEach((index) => {
      registrations.splice(index, 1);
    });
  }

  function update(id: string, bladeId: string, partial: Partial<TItem>): void {
    const normalizedBladeId = bladeId.toLowerCase();
    const existing = registry[normalizedBladeId]?.find((i) => i.id === id);
    if (!existing) return;
    Object.assign(existing, partial, { bladeId: normalizedBladeId });
  }

  function isRegistered(id: string): boolean {
    return registrationCountById.has(id);
  }

  return {
    registry,
    registrations,
    register,
    unregister,
    get,
    clear,
    update,
    isRegistered,
  };
}
