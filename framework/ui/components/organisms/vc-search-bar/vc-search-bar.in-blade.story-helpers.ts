import { computed, defineComponent, provide, ref, type PropType, type Ref } from "vue";
import { BladeBackButtonKey, ToolbarServiceKey, WidgetServiceKey } from "@framework/injection-keys";
import { createToolbarService } from "@core/services/toolbar-service";
import { createWidgetService } from "@core/services/widget-service";
import { BladeBannersKey, BladeDescriptorKey, BladeMessagingKey, BladeStackKey } from "@core/blade-navigation/types";
import type { BladeDescriptor } from "@core/blade-navigation/types";
import type { NumberValue, SearchBarField, SearchBarView } from "./types";
import { toYmd } from "./lib/values";

// Story-only helpers for vc-search-bar.in-blade.stories.ts, never imported by the component

export interface Order {
  id: string;
  number: string;
  customer: string;
  status: string;
  createdDate: Date;
  /** YYYY-MM-DD, what the date filter compares */
  created: string;
  total: number;
  currency: string;
  overdue: boolean;
  unpaid: boolean;
}

export const ORDER_STATUSES = ["New", "Processing", "Paid", "Shipped", "Cancelled"];
const CUSTOMERS = [
  "Acme Corporation",
  "Globex",
  "Initech",
  "Umbrella Retail",
  "Stark Supplies",
  "Wayne Hardware",
  "Hooli",
  "Vandelay Imports",
  "Soylent Foods",
];

/** 42 orders created over the last two months, so the relative dates find some */
export const ORDERS: Order[] = Array.from({ length: 42 }, (_, i) => {
  const today = new Date();
  const createdDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((i * 37) % 61));
  const status = ORDER_STATUSES[(i * 7 + (i >> 2)) % ORDER_STATUSES.length];
  const open = status === "New" || status === "Processing";
  const age = Math.round((today.getTime() - createdDate.getTime()) / 86_400_000);
  return {
    id: `order-${i + 1}`,
    number: `ORD-${10_240 + i}`,
    customer: CUSTOMERS[(i * 5) % CUSTOMERS.length],
    status,
    createdDate,
    created: toYmd(createdDate),
    total: ((i * 7919) % 2900) + 45 + (i % 4) * 0.25,
    currency: "USD",
    overdue: open && age > 14,
    unpaid: open || (status === "Shipped" && i % 3 === 0),
  };
});

export const orderFields: SearchBarField[] = [
  {
    id: "status",
    label: "Status",
    operators: ["any", "not"],
    filter: { options: ORDER_STATUSES.map((s) => ({ value: s, label: s })), multiple: true },
  },
  { id: "customer", label: "Customer", filter: { options: CUSTOMERS.map((c) => ({ value: c, label: c })) } },
  { id: "created", label: "Created", filter: { range: ["createdFrom", "createdTo"] } },
  {
    id: "total",
    label: "Total",
    filter: {
      number: true,
      min: 0,
      presets: [
        { label: "Under 100", value: { op: "lte", max: 100 } },
        { label: "100 – 1,000", value: { op: "between", min: 100, max: 1000 } },
        { label: "1,000 and more", value: { op: "gte", min: 1000 } },
      ],
    },
  },
  { id: "overdue", label: "Overdue", filter: { toggle: true } },
  { id: "unpaid", label: "Unpaid", filter: { toggle: true } },
];

export const orderViews: SearchBarView[] = [
  { id: "open", name: "Open orders", values: { status: ["New", "Processing"] }, default: true },
  { id: "overdue", name: "Overdue", values: { overdue: true } },
  { id: "large", name: "Large orders", values: { total: { op: "gte", min: 1000 } } },
];

type Filters = Record<string, unknown>;

function matchesTotal(total: number, v: NumberValue): boolean {
  if (v.op === "gte") return v.min === undefined || total >= v.min;
  if (v.op === "lte") return v.max === undefined || total <= v.max;
  if (v.op === "eq") return total === v.min;
  return (v.min === undefined || total >= v.min) && (v.max === undefined || total <= v.max);
}

/** The flat `@filter` payload and the search applied to one order; `skip` leaves one field out (for its facet counts) */
export function matchesOrder(o: Order, f: Filters, search: string, skip?: string): boolean {
  const status = f.status as string[] | { not: string[] } | undefined;
  if (skip !== "status" && status) {
    if (Array.isArray(status) ? status.length && !status.includes(o.status) : status.not.includes(o.status))
      return false;
  }
  if (skip !== "customer" && f.customer && o.customer !== f.customer) return false;
  if (f.createdFrom && o.created < (f.createdFrom as string)) return false;
  if (f.createdTo && o.created > (f.createdTo as string)) return false;
  if (f.total && !matchesTotal(o.total, f.total as NumberValue)) return false;
  if (skip !== "overdue" && f.overdue && !o.overdue) return false;
  if (skip !== "unpaid" && f.unpaid && !o.unpaid) return false;
  const q = search.trim().toLowerCase();
  return !q || o.number.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q);
}

/** Counts per option for the Filters panel: each field counted against every other applied filter */
export function facetCounts(f: Filters, search: string): Record<string, Record<string, number>> {
  const count = (skip: string, key: (o: Order) => string | false) => {
    const out: Record<string, number> = {};
    for (const o of ORDERS) {
      const k = key(o);
      if (k !== false && matchesOrder(o, f, search, skip)) out[k] = (out[k] ?? 0) + 1;
    }
    return out;
  };
  return {
    status: count("status", (o) => o.status),
    customer: count("customer", (o) => o.customer),
    overdue: count("overdue", (o) => o.overdue && "true"),
    unpaid: count("unpaid", (o) => o.unpaid && "true"),
  };
}

/** Local filtering, search, facet counts and paging, the way a list blade loads them from @filter and @search */
export function useOrdersQuery(pageSize = 10) {
  const filters = ref<Filters>({});
  const search = ref("");
  const page = ref(1);
  const result = computed(() => ORDERS.filter((o) => matchesOrder(o, filters.value, search.value)));
  const pages = computed(() => Math.ceil(result.value.length / pageSize));
  const items = computed(() => result.value.slice((page.value - 1) * pageSize, page.value * pageSize));
  const counts = computed(() => facetCounts(filters.value, search.value));
  return {
    items,
    counts,
    search,
    total: computed(() => result.value.length),
    unfiltered: ORDERS.length,
    pagination: computed(() => ({ currentPage: page.value, pages: pages.value })),
    onFilter: (e: { filters: Filters }) => {
      filters.value = e.filters;
      page.value = 1;
    },
    onSearch: (value: string) => {
      search.value = value;
      page.value = 1;
    },
    onPage: (p: number) => (page.value = p),
  };
}

// ── A blade stack for stories: the blades share it, each has its own descriptor ───────────────

/** The stack mock VcBlade and useBlade read; `onClose` runs when a blade's close button is pressed */
export function provideStoryStack(activeId: Ref<string>, onClose: (id: string) => void = () => {}) {
  provide(BladeStackKey, {
    blades: ref([]),
    activeBlade: computed(() => ({ id: activeId.value })),
    openWorkspace: async () => {},
    openBlade: async () => {},
    closeBlade: async (id: string) => {
      onClose(id);
      return true;
    },
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
}

/** One blade's own injections: its descriptor, toolbar and widget services, banners and messaging */
export const StoryBladeScope = defineComponent({
  name: "StoryBladeScope",
  props: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    parentId: { type: String as PropType<string | undefined>, default: undefined },
  },
  setup(props, { slots }) {
    const descriptor = computed<BladeDescriptor>(() => ({
      id: props.id,
      name: props.name,
      visible: true,
      parentId: props.parentId,
    }));
    provide(ToolbarServiceKey, createToolbarService());
    provide(WidgetServiceKey, createWidgetService());
    provide(BladeMessagingKey, { callParent: async () => undefined, onParentCall: () => () => {} } as never);
    provide(BladeBannersKey, ref([]));
    provide(BladeDescriptorKey, descriptor);
    provide(BladeBackButtonKey, undefined);
    return () => slots.default?.();
  },
});
