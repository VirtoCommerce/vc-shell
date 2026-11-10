import { nextTick, onMounted, provide, ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { IsMobileKey } from "@framework/injection-keys";
import { VcSearchBar } from "./index";
import type { SearchBarField, SearchBarPreset, SearchBarState } from "./types";
import { minHeight, mouseSwipe } from "./vc-search-bar.story-helpers";

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
    collapseSearch: {
      description:
        "Hide the search behind a button. Unset: automatic, a button in a bar under 640px or on a phone; `false` keeps the field",
      control: "select",
      options: [undefined, true, false],
      table: { type: { summary: "boolean" }, defaultValue: { summary: "undefined" }, category: "Appearance" },
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
      description: "Key of the saved presets and of the applied filters in the blade URL (`<key>_filters`)",
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

// Hidden from the sidebar and docs, still run by the story tests
const TEST_ONLY = ["!dev", "!autodocs", "test"];

const presets: SearchBarPreset[] = [
  { id: "new", name: "New orders", values: { status: ["New"] } },
  { id: "paid", name: "Paid", values: { status: ["Paid"] } },
  { id: "overdue", name: "Overdue", values: { overdue: true } },
];

// A busy list: four set filters and presets, more than a narrow bar holds
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

/**
 * A bar under 640px, as in a narrow blade: the search folds into a button, only set filters show,
 * and the row is cut at the edge. Hover it (or Tab into it) and after a short pause it unfolds over the content below.
 */
export const NarrowBlade: Story = {
  args: { fields: allKinds, presets },
  render: inWidth("560px"),
};

/** `collapseSearch: true`: the search is a button at any width; it widens into the field on click. */
export const SearchAlwaysButton: Story = {
  args: { fields: allKinds, presets, collapseSearch: true },
  render: inWidth("900px", { status: ["New"] }),
};

/** `collapseSearch: false`: the field stays even in a narrow bar. */
export const SearchAlwaysField: Story = {
  args: { fields: allKinds, presets, collapseSearch: false },
  render: inWidth("560px"),
};

/** Interaction test: the search button opens the field; it folds back on leaving it empty, and stays with text. */
export const SearchButtonTest: Story = {
  name: "Search button (test)",
  tags: TEST_ONLY,
  args: SearchAlwaysButton.args,
  render: inWidth("900px", { status: ["New"] }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Search" }));
    const input = await canvas.findByRole("textbox", { name: "Search" });
    await waitFor(() => expect(input).toHaveFocus());
    await userEvent.tab();
    await expect(await canvas.findByRole("button", { name: "Search" })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Search" }));
    await userEvent.type(await canvas.findByRole("textbox", { name: "Search" }), "acme");
    await userEvent.tab();
    await expect(canvas.getByRole("textbox", { name: "Search" })).toHaveValue("acme");
    await expect(canvas.queryByRole("button", { name: "Search" })).toBeNull();
  },
};

/** Interaction test: the clipped row unfolds after the hover pause and folds when the pointer leaves. */
export const NarrowBladeRevealTest: Story = {
  name: "Narrow blade reveal (test)",
  tags: TEST_ONLY,
  args: NarrowBlade.args,
  render: inWidth("560px"),
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector<HTMLElement>(".vc-search-bar__row")!;
    await waitFor(() => expect(row).toHaveClass("vc-search-bar__row--clipped"));
    await userEvent.hover(row);
    await expect(row).not.toHaveClass("vc-search-bar__row--open");
    await new Promise((r) => setTimeout(r, 450));
    await expect(row).toHaveClass("vc-search-bar__row--open");
    await userEvent.unhover(row);
    await waitFor(() => expect(row).not.toHaveClass("vc-search-bar__row--open"));
  },
};

// a mouse drag swipes the filters row (Storybook has no touch emulation)
const PHONE = [mouseSwipe, minHeight(640)];

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

/**
 * On a phone the bar is one row: the search button, the set filters with "+ Filter" in a row that swipes
 * sideways (the edges fade while there is more), and the presets button. The search opens over the row.
 */
export const Phone: Story = {
  args: { fields: allKinds, presets },
  decorators: PHONE,
  render: phone(),
};

/**
 * A filter on a phone edits in a bottom sheet with Done; "+ Filter" and the presets button open sheets too.
 * Here the Status filter is open.
 */
export const PhoneFiltersSheet: Story = {
  args: { fields: allKinds, presets, storageKey: "story-search-bar-phone" },
  decorators: PHONE,
  render: phone('[data-field-id="status"] .vc-search-bar__pill-main'),
};

/** Interaction test for the phone row and its sheets, hidden from the sidebar and docs. */
export const PhoneFiltersSheetTest: Story = {
  name: "Phone filters sheet (test)",
  tags: TEST_ONLY,
  args: PhoneFiltersSheet.args,
  render: phone(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    // the pill opens its editor in a sheet
    await userEvent.click(canvas.getByRole("button", { name: /^Status:/ }));
    const status = within(await body.findByRole("dialog", { name: "Status" }));
    await userEvent.click(await status.findByRole("checkbox", { name: /^Shipped/ }));
    await userEvent.click(status.getByRole("button", { name: "Done" }));
    await waitFor(() => expect(body.queryByRole("dialog", { name: "Status" })).toBeNull());
    await expect(canvas.getByRole("button", { name: /^Status:/ })).toHaveTextContent("New, Paid +1");
    // "+ Filter" lists the rest; a toggle applies at once
    await userEvent.click(canvas.getByRole("button", { name: "Add filter" }));
    const add = within(await body.findByRole("dialog", { name: "Add filter" }));
    await userEvent.click(add.getByRole("button", { name: "Overdue" }));
    await waitFor(() => expect(body.queryByRole("dialog", { name: "Add filter" })).toBeNull());
    await expect(canvas.getByRole("button", { name: "Overdue" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Remove Customer filter" }));
    await expect(canvas.queryByRole("button", { name: /^Customer:/ })).toBeNull();
    // the search opens over the row
    await userEvent.click(canvas.getByRole("button", { name: "Search" }));
    await expect(await canvas.findByRole("textbox", { name: "Search" })).toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: "Presets" })).toBeNull();
    await userEvent.tab();
    // the presets button opens all presets and Save as preset
    await userEvent.click(await canvas.findByRole("button", { name: "Presets" }));
    const sheet = within(await body.findByRole("dialog", { name: "Presets" }));
    await expect(sheet.getByRole("button", { name: /^New orders from the module/ })).toBeInTheDocument();
    await expect(sheet.getByRole("button", { name: "Save as preset" })).toBeInTheDocument();
  },
};
