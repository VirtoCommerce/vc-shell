import { createLogger } from "@core/utilities";

export interface PreregistrationBusOptions<TItem, TService> {
  name: string;
  getKey: (item: TItem) => string;
  registerIntoService: (service: TService, item: TItem) => void;
  unregisterFromService?: (service: TService, id: string) => void;
}

export interface PreregistrationBus<TItem, TService> {
  preregister(item: TItem): void;
  unregister(id: string): void;
  removePreregistered(predicate: (item: TItem) => boolean): void;
  getPreregistered(): TItem[];
  replayInto(service: TService): void;
  dispose(service: TService): void;
  broadcast(cb: (service: TService) => void): void;
  getFirstInstance(): TService | undefined;
  readonly instanceCount: number;
}

export function createPreregistrationBus<TItem, TService>(
  options: PreregistrationBusOptions<TItem, TService>,
): PreregistrationBus<TItem, TService> {
  const logger = createLogger(`${options.name}-bus`);
  const store = new Map<string, TItem>();
  const instances = new Set<TService>();

  function preregister(item: TItem): void {
    const key = options.getKey(item);
    store.set(key, item);

    if (instances.size > 0) {
      broadcast((service) => {
        try {
          options.registerIntoService(service, item);
        } catch (e) {
          logger.warn(`Failed to live-register item (key=${key}):`, e);
        }
      });
    }
  }

  function unregister(id: string): void {
    store.delete(id);

    if (options.unregisterFromService && instances.size > 0) {
      instances.forEach((service) => {
        try {
          options.unregisterFromService!(service, id);
        } catch (e) {
          logger.warn(`Failed to live-unregister item (id=${id}):`, e);
        }
      });
    }
  }

  function removePreregistered(predicate: (item: TItem) => boolean): void {
    for (const [key, item] of store) {
      if (predicate(item)) {
        store.delete(key);
      }
    }
  }

  function getPreregistered(): TItem[] {
    return Array.from(store.values());
  }

  function replayInto(service: TService): void {
    instances.add(service);
    store.forEach((item, key) => {
      try {
        options.registerIntoService(service, item);
      } catch (e) {
        logger.warn(`Failed to replay item (key=${key}):`, e);
      }
    });
  }

  function dispose(service: TService): void {
    instances.delete(service);
  }

  function broadcast(cb: (service: TService) => void): void {
    instances.forEach((service) => cb(service));
  }

  function getFirstInstance(): TService | undefined {
    return instances.values().next().value;
  }

  return {
    preregister,
    unregister,
    removePreregistered,
    getPreregistered,
    replayInto,
    dispose,
    broadcast,
    getFirstInstance,
    get instanceCount() {
      return instances.size;
    },
  };
}
