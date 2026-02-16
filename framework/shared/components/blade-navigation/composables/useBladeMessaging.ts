import { inject } from "vue";
import type { IBladeMessaging, IBladeStack } from "../types";
import { BladeMessagingKey } from "../types";

/**
 * Creates the inter-blade messaging system.
 *
 * Uses a Map<bladeId, Record<string, Function>> to store exposed methods.
 * Child blades call parent methods via direct ID lookup (no tree walking).
 *
 * @param bladeStack - BladeStack for looking up blade descriptors by ID
 */
export function createBladeMessaging(bladeStack: IBladeStack): IBladeMessaging {
  // bladeId → Record of method name → function
  const _exposedMethods = new Map<string, Record<string, (...args: any[]) => any>>();

  function exposeToChildren(
    bladeId: string,
    methods: Record<string, (...args: any[]) => any>,
  ): void {
    _exposedMethods.set(bladeId, methods);
  }

  async function callParent<T = unknown>(
    callerBladeId: string,
    method: string,
    args?: unknown,
  ): Promise<T> {
    // Find the caller blade to get its parentId
    const callerBlade = bladeStack.blades.value.find((b) => b.id === callerBladeId);
    if (!callerBlade) {
      throw new Error(`[BladeMessaging] Caller blade '${callerBladeId}' not found in stack`);
    }

    if (!callerBlade.parentId) {
      throw new Error(`[BladeMessaging] Blade '${callerBladeId}' has no parent`);
    }

    // Look up the parent's exposed methods
    const parentMethods = _exposedMethods.get(callerBlade.parentId);
    if (!parentMethods) {
      throw new Error(
        `[BladeMessaging] Parent blade '${callerBlade.parentId}' has no exposed methods`,
      );
    }

    const fn = parentMethods[method];
    if (typeof fn !== "function") {
      throw new Error(
        `[BladeMessaging] Method '${method}' not found on parent blade '${callerBlade.parentId}'`,
      );
    }

    // Call the method and return the result
    return (await fn(args)) as T;
  }

  function cleanup(bladeId: string): void {
    _exposedMethods.delete(bladeId);
  }

  return {
    exposeToChildren,
    callParent,
    cleanup,
  };
}

/**
 * Composable for accessing BladeMessaging from within a component.
 * Must be used after BladeMessaging is provided via BladeMessagingKey.
 */
export function useBladeMessaging(): IBladeMessaging {
  const messaging = inject(BladeMessagingKey);
  if (!messaging) {
    throw new Error(
      "[useBladeMessaging] BladeMessaging not found. Ensure BladeNavigationPlugin is installed.",
    );
  }
  return messaging;
}
