import { inject, provide, ref, type InjectionKey, type Ref } from "vue";

interface AppBarState {
  activeWidgetId: Ref<string | null>;
  activeMobileActionId: Ref<string | null>;
}

const AppBarStateKey: InjectionKey<AppBarState> = Symbol("VcAppBarState");

const fallbackState: AppBarState = {
  activeWidgetId: ref<string | null>(null),
  activeMobileActionId: ref<string | null>(null),
};

/**
 * Provides scoped AppBar state for a single VcApp instance.
 * This prevents cross-instance state leaks when multiple shell roots exist.
 */
export function provideAppBarState(): AppBarState {
  const state: AppBarState = {
    activeWidgetId: ref<string | null>(null),
    activeMobileActionId: ref<string | null>(null),
  };

  provide(AppBarStateKey, state);
  return state;
}

/**
 * Returns AppBar state from the nearest provider.
 * Falls back to a shared state for backward compatibility in legacy usage.
 */
export function useAppBarState(): AppBarState {
  return inject(AppBarStateKey, fallbackState);
}
