import {
  computed,
  defineComponent,
  inject,
  onScopeDispose,
  provide,
  shallowRef,
  type ComputedRef,
  type InjectionKey,
  type PropType,
  type Ref,
} from "vue";
import type { SearchBarState } from "../types";
import type { BarField } from "../lib/fields";
import { chipLabel, isEmptyValue } from "../lib/values";
import type { BarMode } from "./useBarMode";

/** The bar's width mode, or "phone" on a phone */
export type SearchBarMode = BarMode | "phone";

/** A bar field with a value, as the table's empty state lists it */
export interface SearchBarAppliedField {
  id: string;
  label: string;
  /** "Label: value", or the label alone for a toggle */
  text: string;
}

/** Read-only status of a search bar plus its actions, for the component that hosts the bar (the table) */
export interface SearchBarController {
  /** "wide" until a bar connects */
  mode: ComputedRef<SearchBarMode>;
  filterCount: ComputedRef<number>;
  search: ComputedRef<string>;
  /** Filters or search text applied */
  filtered: ComputedRef<boolean>;
  appliedFields: ComputedRef<SearchBarAppliedField[]>;
  clearAll(): void;
  clearFilters(): void;
  removeFilter(id: string): void;
}

export interface ControllerSource {
  mode: Ref<SearchBarMode>;
  search: Ref<string>;
  appliedFields: Ref<SearchBarAppliedField[]>;
  clearAll(): void;
  clearFilters(): void;
  removeFilter(id: string): void;
}

/** The controller as the bar sees it: the host only reads the SearchBarController part */
export interface ConnectableController extends SearchBarController {
  /** Returns a disconnect function, or null when another bar is connected */
  connect(source: ControllerSource): (() => void) | null;
}

const SearchBarControllerKey: InjectionKey<ConnectableController> = Symbol("SearchBarController");

/** Empty until a bar inside a SearchBarControllerScope connects */
export function createSearchBarController(): ConnectableController {
  const source = shallowRef<ControllerSource | null>(null);
  const appliedFields = computed(() => source.value?.appliedFields.value ?? []);
  const mode = computed<SearchBarMode>(() => source.value?.mode.value ?? "wide");
  const search = computed(() => source.value?.search.value ?? "");
  const filterCount = computed(() => appliedFields.value.length);
  const filtered = computed(() => filterCount.value > 0 || search.value !== "");

  const controller: ConnectableController = {
    mode,
    filterCount,
    search,
    filtered,
    appliedFields,
    clearAll: () => source.value?.clearAll(),
    clearFilters: () => source.value?.clearFilters(),
    removeFilter: (id) => source.value?.removeFilter(id),
    connect(s) {
      if (source.value) {
        if (import.meta.env.DEV) {
          console.warn(
            "[VcSearchBar] A search bar is already connected to this controller; the second one is ignored.",
          );
        }
        return null;
      }
      source.value = s;
      return () => {
        if (source.value === s) source.value = null;
      };
    },
  };
  return controller;
}

/** Hands the controller to the bar in its slot (only there, not to the host's other content) */
export const SearchBarControllerScope = defineComponent({
  name: "SearchBarControllerScope",
  props: { controller: { type: Object as PropType<ConnectableController>, required: true } },
  setup(props, { slots }) {
    provide(SearchBarControllerKey, props.controller);
    return () => slots.default?.();
  },
});

/** Bar side: reports the bar's status to the host's controller, if there is one */
export function useSearchBarControllerSource(o: {
  mode: Ref<SearchBarMode>;
  fields: Ref<BarField[]>;
  state: Ref<SearchBarState>;
  /** The text in the input (ahead of the debounced state) */
  searchText: Ref<string>;
  t: (key: string) => string;
  clearAll(): void;
  clearFilters(): void;
  removeFilter(id: string): void;
}): void {
  const controller = inject(SearchBarControllerKey, null);
  if (!controller) return;

  // Only fields the bar has now: a value left for a field that went away is not applied
  const appliedFields = computed(() =>
    o.fields.value
      .filter((f) => !isEmptyValue(o.state.value.values[f.id]))
      .map((f) => ({
        id: f.id,
        label: f.label,
        text: f.kind === "toggle" ? f.label : `${f.label}: ${chipLabel(f, o.state.value.values[f.id], o.t).title}`,
      })),
  );

  const disconnect = controller.connect({
    mode: o.mode,
    search: o.searchText,
    appliedFields,
    clearAll: o.clearAll,
    clearFilters: o.clearFilters,
    removeFilter: o.removeFilter,
  });
  if (disconnect) onScopeDispose(disconnect);
}
