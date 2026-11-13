import { computed, provide, reactive, ref } from "vue";
import type { Decorator } from "@storybook/vue3-vite";
import { BladeBackButtonKey, ToolbarServiceKey, WidgetServiceKey } from "@framework/injection-keys";
import { createToolbarService } from "@core/services/toolbar-service";
import { createWidgetService } from "@core/services/widget-service";
import { BladeBannersKey, BladeDescriptorKey, BladeMessagingKey, BladeStackKey } from "@core/blade-navigation/types";
import type { BladeDescriptor } from "@core/blade-navigation/types";
import {
  TableQueryStateKey,
  decodeQueryState,
  encodeQueryState,
  type ITableQueryStateService,
} from "@core/blade-navigation/table-query-state";
import type { SearchBarField, SearchBarState, SearchBarView } from "./types";

// Story-only helpers, never imported by the component

/** Room under the bar, so its popovers and sheets fit in the canvas */
export const minHeight =
  (px: number): Decorator =>
  (story) => ({
    components: { story },
    template: `<div style="min-height: ${px}px"><story /></div>`,
  });

export const STATUSES = ["New", "Processing", "Paid", "Shipped", "Cancelled"];
const statusCounts = [12, 4, 31, 18, 2];

/** A typical list config: multi-select status + date range */
export const statusAndDateRange: SearchBarField[] = [
  {
    id: "status",
    label: "Status",
    filter: { options: STATUSES.map((s) => ({ value: s, label: s })), multiple: true },
  },
  { id: "dateRange", label: "Date", filter: { range: ["startDate", "endDate"] } },
];

/** Every filter kind */
export const allKinds: SearchBarField[] = [
  {
    id: "status",
    label: "Status",
    operators: ["any", "not"],
    filter: { options: STATUSES.map((s, i) => ({ value: s, label: s, count: statusCounts[i] })), multiple: true },
  },
  { id: "priority", label: "Priority", filter: { options: ["Low", "High"].map((s) => ({ value: s, label: s })) } },
  { id: "created", label: "Created", key: "createddate", filter: { range: ["startDate", "endDate"] } },
  { id: "overdue", label: "Overdue", key: "isoverdue", filter: { toggle: true } },
  { id: "total", label: "Total", filter: { number: true } },
  { id: "customer", label: "Customer", filter: true },
];

/** More fields than a row holds: two toggles and a long option list (find box over 6 options) */
export const manyFields: SearchBarField[] = [
  ...allKinds,
  { id: "unpaid", label: "Unpaid", filter: { toggle: true } },
  {
    id: "country",
    label: "Country",
    filter: {
      options: ["Germany", "France", "Spain", "Italy", "Poland", "Netherlands", "Sweden", "Norway"].map((s) => ({
        value: s,
        label: s,
      })),
      multiple: true,
    },
  },
  { id: "sku", label: "SKU", filter: true },
];

/** Four set filters, more than a narrow bar holds */
export const busyValues: SearchBarState["values"] = {
  status: ["New", "Paid"],
  created: { relative: "7d" },
  overdue: true,
  total: { op: "gte", min: 100 },
};

/** Seven set filters: some of them go behind "+N" on a wide bar */
export const manyValues: SearchBarState["values"] = {
  ...busyValues,
  customer: "Acme Corporation International",
  country: ["Germany", "France", "Spain"],
  sku: "SKU-1042",
};

export const views: SearchBarView[] = [
  { id: "open", name: "Open orders", values: { status: ["New", "Processing"] }, default: true },
  { id: "paid", name: "Paid", values: { status: ["Paid"] } },
  { id: "overdue", name: "Overdue", values: { overdue: true } },
];

export const viewCounts: Record<string, number> = { open: 16, paid: 31, overdue: 5 };

/** A fresh key per run, so saved views and the URL of one story never reach another */
export const freshKey = (name: string) => `story-search-bar-${name}-${Math.random().toString(36).slice(2, 8)}`;

/** Seeds user views under the bar's storage key (the format the bar reads) */
export function seedUserViews(key: string, list: SearchBarView[]) {
  try {
    localStorage.setItem(
      `VC_SEARCHBAR_${key.toUpperCase()}`,
      JSON.stringify({ v: 2, views: list.map((v) => ({ ...v, scope: "user" })) }),
    );
  } catch {
    // blocked storage: the story shows no user views
  }
}

/** The injections VcBlade reads, for a blade outside the blade navigation (as in the VcBlade stories) */
export function provideStoryBlade(name = "OrdersList") {
  const descriptor = computed<BladeDescriptor>(() => ({ id: `story-${name}`, name, visible: true }));
  provide(ToolbarServiceKey, createToolbarService());
  provide(WidgetServiceKey, createWidgetService());
  provide(BladeStackKey, {
    blades: ref([]),
    activeBlade: ref({ id: descriptor.value.id }),
    openWorkspace: async () => {},
    openBlade: async () => {},
    closeBlade: async () => false,
    closeChildren: async () => {},
    replaceCurrentBlade: async () => {},
    coverCurrentBlade: async () => {},
    registerBeforeClose: () => {},
    unregisterBeforeClose: () => {},
    setBladeError: () => {},
    clearBladeError: () => {},
    setBladeTitle: () => {},
    _restoreStack: () => {},
  } as never);
  provide(BladeMessagingKey, { callParent: async () => undefined, onParentCall: () => () => {} } as never);
  provide(BladeBannersKey, ref([]));
  provide(BladeDescriptorKey, descriptor);
  // a blade outside the shell's stack has no back button
  provide(BladeBackButtonKey, undefined);
}

/** Stand-in for the blade's URL query service, with the real namespaced serialization */
export function provideStoryUrl(query: Record<string, string>) {
  const q = reactive({ ...query });
  const service: ITableQueryStateService = {
    read: (key) => decodeQueryState(key ?? "", q),
    write: (key, patch) => Object.assign(q, encodeQueryState(key ?? "", patch)),
  };
  provide(TableQueryStateKey, service);
  return q;
}
