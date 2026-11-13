import { computed, inject, type ComputedRef } from "vue";
import { BladeDescriptorKey } from "@core/blade-navigation/types";
import { getExternalSearchFilters } from "@core/services/search-filters-service";
import type { SearchBarField, SearchBarView } from "../types";
import { normalizeFields, type BarField } from "../lib/fields";

export interface SearchBarFields {
  fields: BarField[];
  /** Views other modules registered with their fields */
  views: SearchBarView[];
  hasExternalFields: boolean;
}

/** Own fields first, then the fields other modules registered for `target`, by priority */
export function resolveSearchBarFields(own: SearchBarField[], target: string | undefined): SearchBarFields {
  const registrations = target ? getExternalSearchFilters(target) : [];
  return {
    // normalizeFields keeps the first on an id clash
    fields: normalizeFields([...own, ...registrations.flatMap((r) => r.fields)]),
    views: registrations.flatMap((r) => r.views ?? []),
    hasExternalFields: registrations.some((r) => r.fields.length > 0),
  };
}

/** The fields of the bar named `name` (without one, the enclosing blade's name), as its host sees them */
export function useSearchBarFields(
  own: () => SearchBarField[],
  name: () => string | undefined,
): ComputedRef<SearchBarFields> {
  const descriptor = inject(BladeDescriptorKey, undefined);
  return computed(() => resolveSearchBarFields(own(), name() ?? descriptor?.value?.name));
}
