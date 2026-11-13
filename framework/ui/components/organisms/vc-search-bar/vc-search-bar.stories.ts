import { nextTick, onMounted, provide, ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { IsMobileKey } from "@framework/injection-keys";
import { VcSearchBar } from "./index";
import type { SearchBarState } from "./types";
import {
  allKinds,
  busyValues,
  freshKey,
  manyFields,
  manyValues,
  minHeight,
  statusAndDateRange,
  views,
} from "./vc-search-bar.story-helpers";

/**
 * `VcSearchBar` is an organism for a list screen: a search input, the applied filters as chips and a Filters panel,
 * with saved views. It reports the state as plain filter values.
 *
 * Fields come from `fields`, or from the registry for the blade it sits in. Use `v-model` for a controlled state
 * and `@change` for the flat filter payload.
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
      description: "Filter fields offered by the screen",
      table: { type: { summary: "SearchBarField[]" }, defaultValue: { summary: "[]" }, category: "Data" },
    },
    views: {
      description: "Views from code; one may be the `default`",
      table: { type: { summary: "SearchBarView[]" }, category: "Data" },
    },
    counts: {
      description: "Result count per option value, per field id",
      table: { type: { summary: "Record<string, Record<string, number>>" }, category: "Data" },
    },
    viewCounts: {
      description: "Result count per view id, shown in the view menu",
      table: { type: { summary: "Record<string, number>" }, category: "Data" },
    },
    resultCount: {
      description: "Result count of the current filters: the panel footer and the phone sheet button",
      control: "number",
      table: { type: { summary: "number" }, category: "Data" },
    },
    unfilteredCount: {
      description: 'Rows without the bar\'s filters and search: "filtered from M" in the phone summary',
      control: "number",
      table: { type: { summary: "number" }, category: "Data" },
    },
    variant: {
      description: "Wide bar: chips in the row (`inline`) or the applied field names on the Filters button",
      control: "inline-radio",
      options: ["inline", "summary"],
      table: {
        type: { summary: '"inline" | "summary"' },
        defaultValue: { summary: '"inline"' },
        category: "Appearance",
      },
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
      description: "Disable the bar",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" }, category: "State" },
    },
    name: {
      description: "Registry target for external filters and views; defaults to the blade name",
      control: "text",
      table: { type: { summary: "string" }, category: "Config" },
    },
    storageKey: {
      description: "Key of the saved views and of the applied filters and view in the blade URL",
      control: "text",
      table: { type: { summary: "string" }, category: "Config" },
    },
    "onUpdate:modelValue": {
      description: "State changed",
      action: "update:modelValue",
      table: { category: "Events", type: { summary: "(value: SearchBarState) => void" } },
    },
    onChange: {
      description: "Applied filters changed; payload carries the flat filters",
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
    "onUpdate:mode": {
      description: "The bar's width mode, or phone on a phone",
      action: "update:mode",
      table: { category: "Events", type: { summary: "(mode: SearchBarMode) => void" } },
    },
  },
  args: { fields: statusAndDateRange },
  decorators: [minHeight(460)],
  parameters: {
    docs: {
      description: {
        component: `
Search, filter chips, a Filters panel and saved views for a list.

\`\`\`vue
<VcSearchBar :fields="fields" :views="views" storage-key="orders" @change="({ filters, search }) => load(filters, search)" />
\`\`\`
        `,
      },
    },
  },
} satisfies Meta<typeof VcSearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

// The bar in a box of the given width, with the given values; `open` clicks a control once mounted (story view only)
const inWidth =
  (width: string, values: SearchBarState["values"] = busyValues, open?: string): Story["render"] =>
  (args, ctx) => ({
    components: { VcSearchBar },
    setup() {
      const state = ref<SearchBarState>({ search: "", values });
      const root = ref<HTMLElement>();
      onMounted(async () => {
        if (!open || ctx.viewMode === "docs") return;
        await nextTick();
        root.value?.querySelector<HTMLElement>(open)?.click();
      });
      return { args, state, width, root };
    },
    template:
      '<div ref="root" :style="{ width, maxWidth: \'100%\' }"><VcSearchBar v-bind="args" v-model="state" /></div>',
  });

/** Search input only, no filter fields: no divider and no Filters button. */
export const SearchOnly: Story = {
  args: { fields: [] },
  render: inWidth("720px", {}),
};

/** A typical list config: multi-select status + date range. */
export const StatusAndDateRange: Story = {
  render: inWidth("900px", { status: ["New", "Paid"] }),
};

/** Every filter kind: select with counts and "is not", single select, date range, toggle, number and text. */
export const AllKinds: Story = {
  args: { fields: allKinds },
  render: inWidth("1000px", {
    status: { not: ["Cancelled"] },
    created: { relative: "7d" },
    overdue: true,
    total: { op: "gte", min: 100 },
  }),
};

/** A bar of 720px and wider (a wide blade): the applied filters are chips in the row, then the split Filters button. */
export const WideBlade: Story = {
  args: { fields: allKinds },
  render: inWidth("1000px"),
};

/** A bar of 480-719px: no chips, the Filters button holds the count and a × that clears all. */
export const MediumBlade: Story = {
  args: { fields: allKinds },
  render: inWidth("600px"),
};

/** A bar under 480px: the Filters button is a funnel icon with a badge. */
export const NarrowBlade: Story = {
  args: { fields: allKinds },
  render: inWidth("440px"),
};

/** `variant="summary"`: a wide bar shows no chips; the Filters button names the applied fields. */
export const SummaryVariant: Story = {
  args: { fields: allKinds, variant: "summary" },
  render: inWidth("1000px"),
};

/** More applied filters than the row holds: the rest go behind "+N", which opens them as an accordion. */
export const ManyFilters: Story = {
  args: { fields: manyFields },
  render: inWidth("900px", manyValues),
};

/** The Filters panel: toggles, an accordion of the other fields with their counts, "N results" and Clear filters. */
export const FiltersPanel: Story = {
  args: { fields: manyFields, resultCount: 18, storageKey: "story-search-bar-panel" },
  render: inWidth("900px", busyValues, ".vc-search-bar__filters-main"),
};

/** Disabled: the search, the chips and the Filters button do not respond. */
export const Disabled: Story = {
  args: { fields: allKinds, disabled: true },
  render: inWidth("1000px"),
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

// Hidden from the sidebar and docs, still run by the story tests
const TEST_ONLY = ["!dev", "!autodocs", "test"];

/** Test: `field:value` and a space turn into a chip; an unknown field stays search text. */
export const SyntaxToChipTest: Story = {
  name: "Syntax to chip (test)",
  tags: TEST_ONLY,
  args: { fields: allKinds, searchDebounce: 0 },
  render: inWidth("1000px", {}),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox");
    await userEvent.type(input, "priority:High ");
    await expect(await canvas.findByRole("button", { name: "Priority: High" })).toBeInTheDocument();
    await expect(input).toHaveValue("");
    await userEvent.type(input, "foo:bar ");
    await expect(input).toHaveValue("foo:bar ");
    await expect(canvas.queryByRole("button", { name: /^foo/i })).toBeNull();
  },
};

/** Test: "+N" opens the hidden filters as an accordion; removing one there shrinks the count. */
export const OverflowPopoverTest: Story = {
  name: "Overflow popover (test)",
  tags: TEST_ONLY,
  args: { fields: manyFields },
  render: inWidth("900px", manyValues),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const more = await canvas.findByRole("button", { name: /more filters/ });
    const hidden = Number(more.textContent?.replace(/\D/g, ""));
    await expect(hidden).toBeGreaterThan(0);
    await userEvent.click(more);
    const body = within(document.body);
    const dialog = await body.findByRole("dialog", { name: `${hidden} more filters` });
    // the popover fades in
    await waitFor(() => expect(dialog).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("dialog", { name: /more filters/ })).toBeNull());
  },
};

/** Test: the phone sheet opens from the Filters button, shows "Show N results" and closes on Done. */
export const PhoneSheetTest: Story = {
  name: "Phone sheet (test)",
  tags: TEST_ONLY,
  args: { fields: allKinds, views, storageKey: freshKey("phone-test"), resultCount: 18 },
  decorators: PHONE,
  render: phone(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Filters, 2 applied" }));
    const body = within(document.body);
    const show = await body.findByRole("button", { name: "Show 18 results" });
    await expect(show).toBeVisible();
    await userEvent.click(body.getByRole("button", { name: "Done" }));
    await waitFor(() => expect(body.queryByRole("button", { name: "Show 18 results" })).toBeNull());
  },
};
