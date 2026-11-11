import { defineComponent, h, ref } from "vue";
import { IsMobileKey } from "@framework/injection-keys";
import {
  TableQueryStateKey,
  decodeQueryState,
  encodeQueryState,
  type ITableQueryStateService,
} from "@core/blade-navigation/table-query-state";
import type { GlobalFilterConfig } from "./types";

// Shared by the VcDataTable header tests (search bar and the v2.11.0 search header)

export const InputStub = defineComponent({
  name: "VcInput",
  props: { modelValue: { type: String, default: undefined } },
  emits: ["update:modelValue"],
  setup:
    (props, { emit }) =>
    () =>
      h("input", {
        class: "input-stub",
        value: props.modelValue,
        onInput: (e: Event) => emit("update:modelValue", (e.target as HTMLInputElement).value),
      }),
});

export const globalFilters: GlobalFilterConfig[] = [
  {
    id: "status",
    label: "Status",
    filter: {
      options: [
        { value: "New", label: "New" },
        { value: "Paid", label: "Paid" },
      ],
      multiple: true,
    },
  },
  { id: "created", label: "Created", filter: { range: ["startDate", "endDate"] } },
];

export const global = {
  stubs: { VcInput: InputStub, VcIcon: true },
  provide: { [IsMobileKey as symbol]: ref(false) },
  directives: { loading: { mounted() {}, updated() {} } },
  mocks: { $t: (k: string) => k },
};

export type FilterEvent = { filters: Record<string, unknown> }[];

export const SEARCH = ".vc-search-bar__search-input";
/** The blade's URL query service over a plain query record, with the real namespaced serialization */
export function urlQueryState(query: Record<string, string> = {}) {
  const service: ITableQueryStateService = {
    read: (key) => decodeQueryState(key!, query),
    write: (key, patch) => Object.assign(query, encodeQueryState(key!, patch)),
  };
  return { query, provide: { [TableQueryStateKey as symbol]: service } };
}
