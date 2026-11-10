import { nextTick, onMounted, provide, ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { IsMobileKey } from "@framework/injection-keys";
import { VcSearchBar } from "./index";
import { createLocalPresetStore, type StoredPreset } from "./lib/storage";
import type { SearchBarField, SearchBarPreset, SearchBarState } from "./types";
import { minHeight, mouseSwipe } from "./vc-search-bar.story-helpers";

const STATUSES = ["New", "Processing", "Paid", "Shipped", "Cancelled"];

const fields: SearchBarField[] = [
  {
    id: "status",
    label: "Status",
    filter: { options: STATUSES.map((s) => ({ value: s, label: s })), multiple: true },
  },
  { id: "customer", label: "Customer", filter: true },
];

const presets: SearchBarPreset[] = [
  { id: "paid", name: "Paid", values: { status: ["Paid"] }, version: 1 },
  { id: "open", name: "Open", values: { status: ["New", "Processing"] }, version: 1 },
  { id: "done", name: "Done", values: { status: ["Shipped"] }, version: 1, pinned: false },
  { id: "cancelled", name: "Cancelled", values: { status: ["Cancelled"] }, version: 1, pinned: false },
];

// A fresh key per story run keeps saved presets from leaking between runs
const freshKey = (name: string) => `story-search-bar-${name}-${Math.random().toString(36).slice(2, 8)}`;

const withFreshKey = <T extends { storageKey?: string }>(args: T): T =>
  args.storageKey ? { ...args, storageKey: freshKey(args.storageKey) } : args;

/**
 * Presets are named sets of filter values shown as chips next to the search.
 * Module presets come from the `presets` prop; with a `storageKey` the user can also save their own,
 * rename, update, pin and hide them.
 */
const meta = {
  title: "Data Display/VcSearchBar",
  component: VcSearchBar,
  tags: ["!autodocs"],
  args: { fields, presets },
  decorators: [minHeight(420)],
} satisfies Meta<typeof VcSearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Hidden from the sidebar and docs, still run by the story tests
const TEST_ONLY = ["!dev", "!autodocs", "test"];

type Seed = Omit<StoredPreset, "updatedAt">;

interface Scene {
  values?: SearchBarState["values"];
  /** Presets written to storage before the bar mounts */
  seed?: Seed[];
  /** Clicked once on mount to show an open menu as the end state (story view only) */
  open?: string;
  phone?: boolean;
}

const scene =
  ({ values = { status: ["New"] }, seed = [], open, phone }: Scene = {}): Story["render"] =>
  (args, ctx) => ({
    components: { VcSearchBar },
    setup() {
      args = withFreshKey(args);
      if (args.storageKey) {
        const store = createLocalPresetStore(args.storageKey);
        seed.forEach((p) => store.save(p));
      }
      if (phone) provide(IsMobileKey, ref(true));
      const state = ref<SearchBarState>({ search: "", values });
      const root = ref<HTMLElement>();
      onMounted(async () => {
        if (!open || ctx.viewMode === "docs") return;
        // Presets load asynchronously; the chip shows up a tick later
        for (let i = 0; i < 5 && !root.value?.querySelector(open); i++) await nextTick();
        root.value?.querySelector<HTMLElement>(open)?.click();
      });
      return { args, state, root, width: phone ? "375px" : "720px" };
    },
    template:
      '<div ref="root" :style="{ width, minHeight: \'360px\' }"><VcSearchBar v-bind="args" v-model="state" /></div>',
  });

const render = scene();
const phoneRender = scene({ phone: true });
const userPreset = (id: string, name: string): Seed => ({
  id,
  name,
  values: { status: ["New"] },
  version: 1,
  scope: "user",
});

/** A preset saved from the current filters: its chip is lit while the filters match it. */
export const SavePreset: Story = {
  args: { storageKey: "save" },
  render: scene({ seed: [userPreset("fresh", "Fresh orders")] }),
};

/** Interaction test for saving a preset. */
export const SavePresetTest: Story = {
  name: "Save preset (test)",
  tags: TEST_ONLY,
  args: { storageKey: "save" },
  render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Save as preset" }));
    const input = await canvas.findByRole("textbox", { name: "Preset name" });
    await expect(input).toHaveValue("New");
    await userEvent.clear(input);
    await userEvent.type(input, "Fresh orders{Enter}");
    const chip = await canvas.findByRole("button", { name: "Fresh orders" });
    await expect(chip).toHaveAttribute("aria-pressed", "true");
    await waitFor(() => expect(canvas.queryByRole("button", { name: "Save as preset" })).toBeNull());
  },
};

/** The chip's options menu (ellipsis button or right click): here on a renamed module preset, so it offers "Restore default". */
export const PresetActions: Story = {
  args: { storageKey: "actions" },
  render: scene({
    seed: [{ ...presets[0], name: "Money in", scope: "module", edited: true }],
    open: '[aria-label="Money in options"]',
  }),
};

/** Interaction test for renaming a preset from its options menu. */
export const PresetActionsTest: Story = {
  name: "Preset actions (test)",
  tags: TEST_ONLY,
  args: { storageKey: "actions" },
  render,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await body.findByRole("button", { name: "Paid options" }));
    await userEvent.click(await body.findByRole("button", { name: "Rename" }));
    const input = await body.findByRole("textbox", { name: "New name" });
    await userEvent.clear(input);
    await userEvent.type(input, "Money in{Enter}");
    await expect(await body.findByRole("button", { name: "Money in" })).toBeInTheDocument();
    await userEvent.click(await body.findByRole("button", { name: "Money in options" }));
    await expect(await body.findByRole("button", { name: "Restore default" })).toBeInTheDocument();
  },
};

/** "All presets" lists every preset with its origin; here "Done" was pinned to the bar from its row options. */
export const AllPresetsList: Story = {
  args: { storageKey: "all" },
  render: scene({
    seed: [{ ...presets[2], scope: "module", pinned: true }],
    open: '[aria-label^="All presets"]',
  }),
};

/** Interaction test for the All presets list: row options expand inline and the list stays open. */
export const AllPresetsListTest: Story = {
  name: "All presets list (test)",
  tags: TEST_ONLY,
  args: { storageKey: "all" },
  render,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await body.findByRole("button", { name: /^All presets/ }));
    await expect((await body.findAllByText("from the module")).length).toBe(presets.length);
    await userEvent.click(await body.findByRole("button", { name: "Done options" }));
    await userEvent.click(await body.findByRole("button", { name: "Pin to the bar" }));
    await expect(await body.findByRole("button", { name: "Done" })).toBeInTheDocument();
    await expect(body.getByRole("button", { name: /^Cancelled from the module/ })).toBeInTheDocument();
  },
};

/** Module presets without a `storageKey` still work as chips; they can only be hidden for the session. */
export const WithoutStorage: Story = {
  render: scene({ values: { status: ["Paid"] } }),
};

/** Interaction test for a chip without storage. */
export const WithoutStorageTest: Story = {
  name: "Without storage (test)",
  tags: TEST_ONLY,
  render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("button", { name: "Save as preset" })).toBeNull();
    await userEvent.click(await canvas.findByRole("button", { name: "Paid" }));
    await expect(canvas.getByRole("button", { name: "Paid" })).toHaveAttribute("aria-pressed", "true");
  },
};

/** On a phone the presets are one bookmark button at the end of the row; it opens all presets and "Save as preset" in a bottom sheet. */
export const PresetsPhone: Story = {
  args: { storageKey: "phone" },
  decorators: [mouseSwipe, minHeight(640)],
  render: scene({ phone: true, seed: [userPreset("today", "New today")], open: ".vc-search-bar__phone-presets" }),
};

/** Interaction test for saving a preset on a phone. */
export const PresetsPhoneTest: Story = {
  name: "Presets on a phone (test)",
  tags: TEST_ONLY,
  args: { storageKey: "phone" },
  render: phoneRender,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await canvas.findByRole("button", { name: "Presets" }));
    const sheet = within(await body.findByRole("dialog", { name: "Presets" }));
    await expect(sheet.getByRole("button", { name: /^Paid from the module/ })).toBeInTheDocument();
    await userEvent.click(sheet.getByRole("button", { name: "Save as preset" }));
    const input = await sheet.findByRole("textbox", { name: "Preset name" });
    await userEvent.type(input, " today{Enter}");
    await expect(await sheet.findByRole("button", { name: /^New today yours/ })).toHaveFocus();
  },
};
