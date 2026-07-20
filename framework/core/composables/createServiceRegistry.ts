import { inject, provide, getCurrentScope, onScopeDispose, type InjectionKey } from "vue";
import type { PreregistrationBus } from "@core/services/_internal";
import { InjectionError } from "@core/utilities";

/**
 * Options for {@link createServiceRegistry}.
 */
export interface ServiceRegistryOptions<TService> {
  /** Injection key the service is provided/injected under. */
  key: InjectionKey<TService> | string;
  /** Factory called once per provider scope to create the service instance. */
  create: () => TService;
  /** Preregistration bus whose `dispose` runs on scope teardown. */
  bus: Pick<PreregistrationBus<unknown, TService>, "dispose">;
  /** Service name used in the {@link InjectionError} thrown by `use()`. */
  name: string;
  /**
   * Optional hook invoked before throwing when `use()` finds no service.
   * Use it to reproduce a bespoke `logger.error(...)` call.
   */
  onMissing?: () => void;
}

/**
 * A provide/use pair around a single provide/inject service.
 */
export interface ServiceRegistry<TService> {
  /**
   * Injects an ancestor-provided service or creates, provides and registers a
   * new one (disposing it via the bus on scope teardown). Idempotent within a
   * provider chain.
   */
  provide(): TService;
  /**
   * Injects the provided service or throws {@link InjectionError} if none is
   * available in the current context.
   */
  use(): TService;
}

/**
 * Removes the duplicated inject-or-create-provide-onScopeDispose and
 * inject-or-throw boilerplate shared by the framework's service composables.
 */
export function createServiceRegistry<TService>(options: ServiceRegistryOptions<TService>): ServiceRegistry<TService> {
  const { key, create, bus, name, onMissing } = options;

  function provideService(): TService {
    const existingService = inject(key, null);
    if (existingService) {
      return existingService;
    }

    const service = create();
    provide(key, service);

    if (getCurrentScope()) {
      onScopeDispose(() => bus.dispose(service));
    }

    return service;
  }

  function useService(): TService {
    const service = inject(key, null);
    if (!service) {
      onMissing?.();
      throw new InjectionError(name);
    }
    return service;
  }

  return {
    provide: provideService,
    use: useService,
  };
}
