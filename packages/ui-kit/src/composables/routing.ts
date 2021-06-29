import { ref, computed, Component, ComputedRef } from "vue";

export interface IBladeData {
  id: number;
  component: Component;
  componentOptions: Record<string, unknown>;
}

/** All opened blades */
export const opened = ref<IBladeData[]>([]);

/**
 * Return readonly list of all opened blades.
 */
export function openedBlades(): ComputedRef<IBladeData[]> {
  return computed(() => opened.value);
}

/**
 * Open blade.
 */
export function openBlade(
  component: Component,
  componentOptions: Record<string, unknown>
): void {
  opened.value.push({
    id: Math.random(),
    component,
    componentOptions,
  });
  console.log("Opened blades: ", opened.value);
}

/**
 * Close blade by id and all its descendants.
 */
export function closeBlade(id: number): void {
  const bladeIndex = opened.value.findIndex((item) => item.id === id);
  if (bladeIndex > -1) {
    opened.value.splice(bladeIndex);
  }
}

/**
 * Close all blades.
 */
export function closeBlades(): void {
  opened.value.splice(0);
}
