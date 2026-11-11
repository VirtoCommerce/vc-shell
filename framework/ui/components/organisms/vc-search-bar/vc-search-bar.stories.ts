import { nextTick, onMounted, provide, ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { IsMobileKey } from "@framework/injection-keys";
import { VcSearchBar } from "./index";
import type { SearchBarField, SearchBarState, SearchBarView } from "./types";
import { minHeight } from "./vc-search-bar.story-helpers";

const STATUSES = ["New", "Processing", "Paid", "Shipped", "Cancelled"];
const counts = [12, 4, 31, 18, 2];

// A typical list config: multi-select status + date range
const statusAndDateRange: SearchBarField[] = [
  {
    id: "status",
    label: "Status",
    filter: { options: STATUSES.map((s) => ({ value: s, label: s })), multiple: true },
  },
  { id: "dateRange", label: "Date", filter: { range: ["startDate", "endDate"] } },
];

const allKinds: SearchBarField[] = [
  {
    id: "status",
    label: "Status",
    operators: ["any", "not"],
    filter: { options: STATUSES.map((s, i) => ({ value: s, label: s, count: counts[i] })), multiple: true },
  },
  { id: "priority", label: "Priority", filter: { options: ["Low", "High"].map((s) => ({ value: s, label: s })) } },
  { id: "created", label: "Created", key: "createddate", filter: { range: ["startDate", "endDate"] } },
  { id: "overdue", label: "Overdue", key: "isoverdue", filter: { toggle: true } },
  { id: "total", label: "Total", filter: { number: true } },
  { id: "customer", label: "Customer", filter: true },
];

const pinnedAndOptional: SearchBarField[] = [
  { id: "status", label: "Status", filter: { options: STATUSES.map((s) => ({ value: s, label: s })) } },
  { id: "customer", label: "Customer", filter: true, pinned: false },
  { id: "total", label: "Total", filter: { number: true }, pinned: false },
];

/**
 * `VcSearchBar` is an organism that combines a search input with filter pills.
 * Each pill is the active filter and its editor: click it to change the value, press the cross to remove it.
 *
 * Fields come from `fields`, or from the registry for the blade it sits in. Use `v-model` for a controlled state
 * and `@change` for the flat filter payload and the platform search phrase.
 */
const meta = {
  title: "Data Display/VcSearchBar",
  component: VcSearchBar,
  tags: ["autodocs"],
  argTypes: {
    modelValue: {
      description: "Controlled state: the search text and the filter values by field id",
      table: { type: { summary: "SearchBarState" }, category: "Model" },
    },
    fields: {
      description: "Filter fields. Unpinned fields appear as a pill only once they have a value",
      table: { type: { summary: "SearchBarField[]" }, defaultValue: { summary: "[]" }, category: "Data" },
    },
    placeholder: {
      description: "Placeholder and accessible name of the search input",
      control: "text",
      table: { type: { summary: "string" }, category: "Appearance" },
    },
    searchDebounce: {
      description: "Delay in ms before the typed search reaches the state and `change`",
      control: "number",
      table: { type: { summary: "number" }, defaultValue: { summary: "300" }, category: "Behavior" },
    },
    searchable: {
      description: "Show the search input",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" }, category: "State" },
    },
    disabled: {
      description: "Disable the input and the pills",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" }, category: "State" },
    },
    name: {
      description: "Registry target for external filters; defaults to the blade name",
      control: "text",
      table: { type: { summary: "string" }, category: "Config" },
    },
    storageKey: {
      description:
        "Key of the saved views and of the applied filters and view in the blade URL (`<key>_filters`, `<key>_view`)",
      control: "text",
      table: { type: { summary: "string" }, category: "Config" },
    },
    "onUpdate:modelValue": {
      description: "State changed",
      action: "update:modelValue",
      table: { category: "Events", type: { summary: "(value: SearchBarState) => void" } },
    },
    onChange: {
      description: "Applied filters changed; payload carries the flat filters and the phrase",
      action: "change",
      table: { category: "Events", type: { summary: "(value: SearchBarChange) => void" } },
    },
    "onUpdate:search": {
      description: "Every keystroke in the search input",
      action: "update:search",
      table: { category: "Events", type: { summary: "(value: string) => void" } },
    },
    onSearch: {
      description: "The debounced search text",
      action: "search",
      table: { category: "Events", type: { summary: "(value: string) => void" } },
    },
  },
  args: { fields: statusAndDateRange },
  decorators: [minHeight(420)],
  parameters: {
    docs: {
      description: {
        component: `
Search input and filter pills for a list blade.

\`\`\`vue
<VcSearchBar :fields="fields" @change="({ filters, search }) => load(filters, search)" />
\`\`\`
        `,
      },
    },
  },
} satisfies Meta<typeof VcSearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Search input only, no filter fields. */
export const SearchOnly: Story = {
  args: { fields: [] },
  render: (args) => ({
    components: { VcSearchBar },
    setup: () => ({ args }),
    template: '<div style="max-width: 720px"><VcSearchBar v-bind="args" /></div>',
  }),
};

/** A typical list config: multi-select status + date range. */
export const StatusAndDateRange: Story = {
  render: (args) => ({
    components: { VcSearchBar },
    setup() {
      const state = ref<SearchBarState>({ search: "", values: { status: ["New", "Paid"] } });
      return { args, state };
    },
    template: '<div style="max-width: 720px"><VcSearchBar v-bind="args" v-model="state" /></div>',
  }),
};

/** Every filter kind: select with counts and "is not", single select, date range, toggle, number and text. */
export const AllKinds: Story = {
  args: { fields: allKinds },
  render: (args) => ({
    components: { VcSearchBar },
    setup() {
      const state = ref<SearchBarState>({
        search: "",
        values: {
          status: { not: ["Cancelled"] },
          created: { relative: "7d" },
          overdue: true,
          total: { op: "gte", min: 100 },
        },
      });
      return { args, state };
    },
    template: '<div style="max-width: 900px"><VcSearchBar v-bind="args" v-model="state" /></div>',
  }),
};

/** Pinned fields always show a pill; unpinned ones appear once they hold a value. */
export const PinnedAndOptional: Story = {
  args: { fields: pinnedAndOptional },
  render: (args) => ({
    components: { VcSearchBar },
    setup() {
      const state = ref<SearchBarState>({ search: "", values: { customer: "Acme" } });
      return { args, state };
    },
    template: '<div style="max-width: 720px"><VcSearchBar v-bind="args" v-model="state" /></div>',
  }),
};

const views: SearchBarView[] = [
  { id: "new", name: "New orders", values: { status: ["New"] } },
  { id: "paid", name: "Paid", values: { status: ["Paid"] } },
  { id: "overdue", name: "Overdue", values: { overdue: true } },
];

// A busy list: four set filters, more than a narrow bar holds
const busyValues: SearchBarState["values"] = {
  status: ["New", "Paid"],
  created: { relative: "7d" },
  overdue: true,
  total: { op: "gte", min: 100 },
};

const inWidth =
  (width: string, values: SearchBarState["values"] = busyValues): Story["render"] =>
  (args) => ({
    components: { VcSearchBar },
    setup() {
      const state = ref<SearchBarState>({ search: "", values });
      return { args, state, width };
    },
    template: '<div :style="{ width }"><VcSearchBar v-bind="args" v-model="state" /></div>',
  });

/** A bar under 720px, as in a narrow blade: no chips, the Filters button holds the count and clears all. */
export const NarrowBlade: Story = {
  args: { fields: allKinds, views },
  render: inWidth("560px"),
};

const PHONE = [minHeight(640)];

const phoneValues: SearchBarState["values"] = { status: ["New", "Paid"], customer: "Acme" };

const phone =
  (open?: string): Story["render"] =>
  (args, ctx) => ({
    components: { VcSearchBar },
    setup() {
      provide(IsMobileKey, ref(true));
      const state = ref<SearchBarState>({ search: "", values: phoneValues });
      const root = ref<HTMLElement>();
      // The end state at once, without a visible click (story view only)
      onMounted(async () => {
        if (!open || ctx.viewMode === "docs") return;
        await nextTick();
        root.value?.querySelector<HTMLElement>(open)?.click();
      });
      return { args, state, root };
    },
    template:
      '<div ref="root" style="width: 360px; max-width: 100%; min-height: 560px"><VcSearchBar v-bind="args" v-model="state" /></div>',
  });

/** On a phone the bar is the search and an icon Filters button with the count, and a summary line under it. */
export const Phone: Story = {
  args: { fields: allKinds, views, resultCount: 18, unfilteredCount: 67 },
  decorators: PHONE,
  render: phone(),
};

/** On a phone the Filters button opens a bottom sheet: Clear and Done, the views as chips, the fields and "Show N results". */
export const PhoneFiltersSheet: Story = {
  args: { fields: allKinds, views, storageKey: "story-search-bar-phone", resultCount: 18, unfilteredCount: 67 },
  decorators: PHONE,
  render: phone(".vc-search-bar__filters-main"),
};
