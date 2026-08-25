import { provide, inject } from "vue";
import type { InjectionKey } from "vue";
import { createSidebarStateInstance } from "./_internal";
import type { UseSidebarStateReturn } from "./_internal";

export type { SidebarState, SidebarActions, UseSidebarStateReturn, SidebarStateReturn } from "./_internal";
export { sidebarStorageKey } from "./_internal";

const SIDEBAR_STATE_KEY: InjectionKey<UseSidebarStateReturn> = Symbol("SidebarState");

/**
 * Provides sidebar state to the component tree. Must be called once in VcApp setup.
 * Idempotent: returns the existing instance if already provided in the current tree.
 */
export function provideSidebarState(): UseSidebarStateReturn {
  const existing = inject(SIDEBAR_STATE_KEY, null);
  if (existing) return existing;

  const instance = createSidebarStateInstance();

  provide(SIDEBAR_STATE_KEY, instance);
  return instance;
}

/**
 * Access sidebar state from any descendant of VcApp.
 * Throws if called outside the VcApp component tree.
 */
export function useSidebarState(): UseSidebarStateReturn {
  const injected = inject(SIDEBAR_STATE_KEY);
  if (!injected) {
    throw new Error("useSidebarState() requires provideSidebarState() in a parent component");
  }
  return injected;
}
