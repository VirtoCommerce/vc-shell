import { defineComponent, h, nextTick, onBeforeUnmount, onMounted, provide, ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { IsMobileKey } from "@framework/injection-keys";
import { registerExternalSearchFilters, unregisterExternalSearchFilters } from "@core/services/search-filters-service";
import { VcSearchBar } from "./index";
import type { SearchBarField, SearchBarState } from "./types";
import { minHeight, mouseSwipe } from "./vc-search-bar.story-helpers";

const STATUSES = ["New", "Processing", "Paid", "Shipped", "Cancelled"];
const counts = [12, 4, 31, 18, 2];

const fields: SearchBarField[] = [
  {
    id: "status",
    label: "Status",
    operators: ["any", "not"],
    filter: { options: STATUSES.map((s, i) => ({ value: s, label: s, count: counts[i] })), multiple: true },
  },
  { id: "priority", label: "Priority", filter: { options: ["Low", "High"].map((s) => ({ value: s, label: s })) } },
  { id: "created", label: "Created", filter: { range: ["startDate", "endDate"] } },
  { id: "overdue", label: "Overdue", filter: { toggle: true } },
  { id: "total", label: "Total", filter: { number: true } },
  { id: "customer", label: "Customer", filter: true },
];

const meta = {
  title: "Data Display/VcSearchBar/Builder",
  component: VcSearchBar,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [minHeight(420)],
} satisfies Meta<typeof VcSearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Hidden from the sidebar and docs, still run by the story tests
const TEST_ONLY = ["!dev", "!autodocs", "test"];

/**
 * Renders the bar with a state and shows the story's end state at once (story view only):
 * `show` gets the canvas root on mount and opens what the interaction test would open, without visible typing.
 */
const scene =
  (opts: {
    state?: Partial<SearchBarState>;
    minHeight?: number;
    show?: (root: HTMLElement) => void | Promise<void>;
  }): Story["render"] =>
  (args, ctx) => ({
    components: { VcSearchBar },
    setup() {
      const state = ref<SearchBarState>({ search: "", values: {}, ...opts.state });
      const root = ref<HTMLElement>();
      onMounted(async () => {
        if (!opts.show || ctx.viewMode === "docs") return;
        await nextTick();
        if (root.value) await opts.show(root.value);
      });
      return { args, state, root, minHeight: `${opts.minHeight ?? 620}px` };
    },
    template: '<div ref="root" :style="{ minHeight }"><VcSearchBar v-bind="args" v-model="state" /></div>',
  });

const click = async (el: Element | null | undefined) => {
  (el as HTMLElement | null)?.click();
  await nextTick();
};
const editFilters = (root: HTMLElement) => click(root.querySelector(".vc-search-bar__constructor-btn"));
const panel = () => document.querySelector<HTMLElement>(".vc-search-bar__panel");

/** Edit filters opens the constructor: one compact line per condition. "Add condition" opens a floating list. */
export const Builder: Story = {
  args: { fields, builder: true },
  render: scene({ state: { values: { overdue: true, customer: "Acme" } }, minHeight: 520, show: editFilters }),
};

/** Interaction test for the constructor: add two conditions and apply them. */
export const BuilderTest: Story = {
  name: "Builder (test)",
  tags: TEST_ONLY,
  args: { fields, builder: true },
  render: scene({ minHeight: 520 }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await canvas.findByRole("button", { name: "Edit filters" }));
    // Esc closes only the floating list, the panel stays
    await userEvent.click(await body.findByRole("button", { name: "Add condition" }));
    await expect(await body.findByRole("menu", { name: "Add condition" })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("menu", { name: "Add condition" })).toBeNull());
    await expect(body.getByRole("button", { name: "Apply" })).toBeInTheDocument();
    await userEvent.click(await body.findByRole("button", { name: "Add condition" }));
    await userEvent.click(await body.findByRole("menuitem", { name: "Overdue" }));
    await userEvent.click(await body.findByRole("button", { name: "Add condition" }));
    await userEvent.click(await body.findByRole("menuitem", { name: "Customer" }));
    await userEvent.type(await body.findByRole("textbox", { name: "Customer" }), "Acme");
    await userEvent.click(body.getByRole("button", { name: "Apply" }));
    await expect(await canvas.findByRole("button", { name: "Overdue" })).toHaveAttribute("aria-pressed", "true");
    await expect(await canvas.findByRole("button", { name: /Customer:/ })).toHaveTextContent("Acme");
  },
};

/** At 375px each condition stacks: field, operator and remove on one line, the value below. */
export const BuilderPhone: Story = {
  args: { fields, builder: true },
  decorators: [mouseSwipe, minHeight(640)],
  render: (args) => ({
    components: { VcSearchBar },
    setup() {
      provide(IsMobileKey, ref(true));
      return { args };
    },
    template: '<div style="width: 375px; min-height: 520px"><VcSearchBar v-bind="args" /></div>',
  }),
};

const advancedRender = scene({});

/** Advanced tab: the text reads as conditions ("Will apply"), and Conditions shows them back. */
export const AdvancedReadable: Story = {
  args: { fields, builder: true, advanced: true },
  render: scene({
    state: { search: "boots", values: { overdue: true } },
    show: async (root) => {
      await editFilters(root);
      await click([...(panel()?.querySelectorAll("[role=tab]") ?? [])][1]);
    },
  }),
};

/** Interaction test: type a readable query, switch to Conditions and apply. */
export const AdvancedReadableTest: Story = {
  name: "Advanced readable (test)",
  tags: TEST_ONLY,
  args: { fields, builder: true, advanced: true },
  render: advancedRender,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await canvas.findByRole("button", { name: "Edit filters" }));
    await userEvent.click(await body.findByRole("tab", { name: "Advanced" }));
    await userEvent.type(await body.findByRole("textbox", { name: "Filter query" }), "boots overdue:true");
    await expect(await body.findByText("Will apply:")).toBeInTheDocument();
    await userEvent.click(body.getByRole("tab", { name: "Conditions" }));
    await expect(await body.findByRole("button", { name: "Remove Overdue condition" })).toBeInTheDocument();
    await userEvent.click(body.getByRole("button", { name: "Apply" }));
    await expect(await canvas.findByRole("button", { name: "Overdue" })).toHaveAttribute("aria-pressed", "true");
    await expect(canvas.getByRole("textbox", { name: "Search" })).toHaveValue("boots");
  },
};

/** OR between fields cannot become rows: Conditions is disabled and Apply sends one Query pill that reopens Advanced. */
export const AdvancedQueryPill: Story = {
  args: { fields, builder: true, advanced: true },
  render: scene({
    state: { query: "status:Paid OR customer:Acme" },
    show: (root) => click(root.querySelector(".vc-search-bar__pill--query .vc-search-bar__pill-main")),
  }),
};

/** Interaction test for the Query pill: apply an OR query, reopen it, remove it. */
export const AdvancedQueryPillTest: Story = {
  name: "Advanced query pill (test)",
  tags: TEST_ONLY,
  args: { fields, builder: true, advanced: true },
  render: advancedRender,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await canvas.findByRole("button", { name: "Edit filters" }));
    await userEvent.click(await body.findByRole("tab", { name: "Advanced" }));
    await userEvent.type(await body.findByRole("textbox", { name: "Filter query" }), "status:Paid OR customer:Acme");
    await expect(await body.findByText(/it uses OR between different fields/)).toBeInTheDocument();
    await expect(body.getByRole("tab", { name: "Conditions" })).toBeDisabled();
    await userEvent.click(body.getByRole("button", { name: "Apply" }));
    const pill = await canvas.findByRole("button", { name: /^Edit query/ });
    await expect(pill).toHaveTextContent("Query: status:Paid OR customer:Acme");
    await userEvent.click(pill);
    await expect(await body.findByRole("textbox", { name: "Filter query" })).toHaveValue(
      "status:Paid OR customer:Acme",
    );
    await userEvent.click(body.getByRole("button", { name: "Cancel" }));
    await userEvent.click(await canvas.findByRole("button", { name: "Remove query" }));
    await waitFor(() => expect(canvas.queryByRole("button", { name: /^Edit query/ })).toBeNull());
  },
};

/** Without the constructor the panel is only the Advanced text, with the Syntax card. */
export const AdvancedOnly: Story = {
  args: { fields, advanced: true },
  render: scene({
    state: { values: { status: ["New", "Processing"] } },
    show: async (root) => {
      await editFilters(root);
      await click(panel()?.querySelector(".vc-search-bar__syntax"));
    },
  }),
};

/** Interaction test for the Syntax card: the docs link and inserting an example. */
export const AdvancedOnlyTest: Story = {
  name: "Advanced only (test)",
  tags: TEST_ONLY,
  args: { fields, advanced: true },
  render: advancedRender,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await canvas.findByRole("button", { name: "Edit filters" }));
    await expect(body.queryByRole("tab")).toBeNull();
    await userEvent.click(await body.findByRole("button", { name: "Syntax" }));
    await expect(await body.findByRole("link", { name: "Search phrase syntax reference" })).toHaveAttribute(
      "target",
      "_blank",
    );
    await userEvent.click(body.getByRole("button", { name: "Insert status:New,Processing" }));
    await expect(body.getByRole("textbox", { name: "Filter query" })).toHaveValue("status:New,Processing");
  },
};

/** Suggestions open under the word being typed: keys, then values with counts. The list has a fixed width. */
export const AdvancedSuggest: Story = {
  args: { fields, advanced: true },
  render: scene({
    show: async (root) => {
      await editFilters(root);
      // The list is placed from the caret's screen position: wait until the panel has its place
      await new Promise((r) => setTimeout(r, 300));
      const ta = panel()?.querySelector("textarea");
      if (!ta) return;
      ta.focus();
      ta.value = "status:";
      ta.setSelectionRange(7, 7);
      ta.dispatchEvent(new Event("input", { bubbles: true }));
    },
  }),
};

/** Interaction test for the suggestions: keys, values, keyboard choice and used values. */
export const AdvancedSuggestTest: Story = {
  name: "Advanced suggest (test)",
  tags: TEST_ONLY,
  args: { fields, advanced: true },
  render: advancedRender,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await canvas.findByRole("button", { name: "Edit filters" }));
    const box = await body.findByRole("textbox", { name: "Filter query" });
    await userEvent.type(box, "sta");
    await expect(await body.findByRole("option", { name: /status:/ })).toBeInTheDocument();
    await userEvent.keyboard("{Enter}");
    await expect(box).toHaveValue("status:");
    await expect(await body.findByRole("option", { name: /Paid/ })).toHaveTextContent("31");
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(box).toHaveValue("status:Processing");
    // typing the colon and the comma by hand opens values, minus the ones already used
    await userEvent.click(box);
    await userEvent.clear(box);
    await userEvent.type(box, "status:");
    await expect(await body.findByRole("option", { name: /Paid/ })).toBeInTheDocument();
    await userEvent.type(box, "Paid,");
    await waitFor(() => expect(body.queryByRole("option", { name: /^Paid/ })).toBeNull());
    await expect(await body.findByRole("option", { name: /New/ })).toBeInTheDocument();
  },
};

const StarsEditor = defineComponent({
  props: { modelValue: { type: Number, default: undefined } },
  emits: ["update:modelValue"],
  setup:
    (props, { emit }) =>
    () =>
      h(
        "div",
        { style: "display: flex; gap: 8px; padding: 8px" },
        [1, 2, 3, 4, 5].map((n) =>
          h(
            "button",
            {
              type: "button",
              style: "min-width: 32px; min-height: 32px",
              "aria-pressed": props.modelValue === n,
              onClick: () => emit("update:modelValue", n),
            },
            `${n}`,
          ),
        ),
      ),
});

const registerRating = () => {
  registerExternalSearchFilters({
    id: "story-external-rating",
    targetBlades: ["storybook-orders"],
    fields: [
      {
        id: "rating",
        label: "Rating",
        filter: { component: StarsEditor, label: (v) => `${v}+ stars`, toPhrase: (v) => `rating:[${v} TO]` },
      },
    ],
  });
  onBeforeUnmount(() => unregisterExternalSearchFilters("story-external-rating"));
};

const externalRender =
  (values: SearchBarState["values"]): Story["render"] =>
  (args) => ({
    components: { VcSearchBar },
    setup() {
      registerRating();
      const state = ref<SearchBarState>({ search: "", values });
      return { args, state };
    },
    template: '<div style="min-height: 320px"><VcSearchBar v-bind="args" v-model="state" /></div>',
  });

/** A module adds a custom-editor field to the bar of the "storybook-orders" screen. */
export const ExternalFilters: Story = {
  args: { fields, name: "storybook-orders" },
  render: externalRender({ rating: 4 }),
};

/** Interaction test for an external field's custom editor. */
export const ExternalFiltersTest: Story = {
  name: "External filters (test)",
  tags: TEST_ONLY,
  args: { fields, name: "storybook-orders" },
  render: externalRender({}),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await canvas.findByRole("button", { name: /^Rating/ }));
    await userEvent.click(await body.findByRole("button", { name: "4" }));
    await expect(await canvas.findByRole("button", { name: /^Rating/ })).toHaveTextContent("4+ stars");
  },
};
