import { shallowReactive } from "vue";
import type { SearchBarField, SearchBarPreset, SearchBarView } from "@core/types/search-bar";

export interface IExternalSearchFiltersRegistration {
  id: string;
  targetBlades: string[];
  /** Lower runs first. Default 100. */
  priority?: number;
  fields: SearchBarField[];
  presets?: SearchBarPreset[];
  views?: SearchBarView[];
}

const DEFAULT_PRIORITY = 100;

// Reactive: a module that loads after a blade opened still reaches that blade
const externalSearchFilters = shallowReactive(new Map<string, IExternalSearchFiltersRegistration>());

/**
 * Registers search bar fields and views for the listed blades.
 * Registering an existing id replaces it.
 */
export function registerExternalSearchFilters(registration: IExternalSearchFiltersRegistration): void {
  externalSearchFilters.set(registration.id, {
    ...registration,
    targetBlades: registration.targetBlades.map((bladeId) => bladeId.toLowerCase()),
  });
}

export function unregisterExternalSearchFilters(id: string): void {
  externalSearchFilters.delete(id);
}

/** Internal: registrations for one blade, sorted by priority then registration order. */
export function getExternalSearchFilters(target: string): IExternalSearchFiltersRegistration[] {
  const normalized = target.toLowerCase();
  return Array.from(externalSearchFilters.values())
    .filter((r) => r.targetBlades.includes(normalized))
    .sort((a, b) => (a.priority ?? DEFAULT_PRIORITY) - (b.priority ?? DEFAULT_PRIORITY));
}
