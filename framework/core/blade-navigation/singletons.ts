import type { IBladeStack, IBladeMessaging, BladeNavigationPlugin } from "@core/blade-navigation/types";
import type { IBladeRegistry } from "@core/composables/useBladeRegistry";

/**
 * Module-level singletons — accessible without inject().
 * Shell's blade-navigation plugin calls the setters during install().
 * Core composables (useBlade, useBladeNavigationAdapter) read via exported variables.
 *
 * Limitation: only one Vue app per JS context is supported.
 * Call _resetBladeNavigationSingletons() in test teardown.
 */

export let bladeNavigationInstance: BladeNavigationPlugin | undefined;
export let bladeStackInstance: IBladeStack | undefined;
export let bladeMessagingInstance: IBladeMessaging | undefined;
export let bladeRegistryInstance: IBladeRegistry | undefined;

export function setBladeNavigationInstance(instance: BladeNavigationPlugin): void {
  bladeNavigationInstance = instance;
}

export function setBladeStackInstance(instance: IBladeStack): void {
  bladeStackInstance = instance;
}

export function setBladeMessagingInstance(instance: IBladeMessaging): void {
  bladeMessagingInstance = instance;
}

export function setBladeRegistryInstance(instance: IBladeRegistry): void {
  bladeRegistryInstance = instance;
}

/** @internal Test teardown only */
export function _resetBladeNavigationSingletons(): void {
  bladeNavigationInstance = undefined;
  bladeStackInstance = undefined;
  bladeMessagingInstance = undefined;
  bladeRegistryInstance = undefined;
}
