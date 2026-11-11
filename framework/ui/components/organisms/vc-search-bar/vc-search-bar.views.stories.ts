import { nextTick, onMounted } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { VcBlade } from "@ui/components/organisms/vc-blade";
import { VcSearchBar } from "./index";
import type { SearchBarView } from "./types";
import {
  allKinds,
  freshKey,
  minHeight,
  provideStoryBlade,
  provideStoryUrl,
  seedUserViews,
  viewCounts,
  views,
} from "./vc-search-bar.story-helpers";
import { withVcApp } from "../../../../../.storybook/decorators";

const meta = {
  title: "Data Display/VcSearchBar",
  component: VcSearchBar,
  // Grouped under the same sidebar node as the main file; autodocs lives only in vc-search-bar.stories.ts
  tags: ["!autodocs"],
  decorators: [minHeight(560), withVcApp],
} satisfies Meta<typeof VcSearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

const userViews: SearchBarView[] = [
  { id: "u-big", name: "Big orders", values: { total: { op: "gte", min: 1000 } } },
  { id: "u-acme", name: "Acme, last 7 days", values: { customer: "Acme", created: { relative: "7d" } } },
];

interface BladeOpts {
  width?: number;
  /** `<key>_filters` in the blade URL, with `<key>_view=open`: the default view, modified */
  filters?: string;
  seed?: SearchBarView[];
  /** Controls clicked one after another once mounted (story view only) */
  open?: string[];
}

// The bar in a real VcBlade: the view selector goes next to the blade title
const inBlade =
  (o: BladeOpts = {}): Story["render"] =>
  (args, ctx) => ({
    components: { VcBlade, VcSearchBar },
    setup() {
      provideStoryBlade();
      const storageKey = freshKey("views");
      if (o.seed) seedUserViews(storageKey, o.seed);
      provideStoryUrl(o.filters ? { [`${storageKey}_filters`]: o.filters, [`${storageKey}_view`]: "open" } : {});
      onMounted(async () => {
        if (!o.open || ctx.viewMode === "docs") return;
        for (const sel of o.open) {
          await nextTick();
          await new Promise((r) => setTimeout(r, 50));
          document.querySelector<HTMLElement>(sel)?.click();
        }
      });
      return { args, storageKey, width: o.width ?? 900 };
    },
    template: `
      <div style="height: 520px; display: flex">
        <VcBlade title="Orders" :width="width">
          <VcSearchBar v-bind="args" :storage-key="storageKey" />
        </VcBlade>
      </div>`,
  });

const MODIFIED = "status:New,Processing;overdue:1";

/** In a blade the view selector sits next to the blade title: bookmark, the view name and a chevron. */
export const ViewsInBlade: Story = {
  args: { fields: allKinds, views, viewCounts },
  render: inBlade(),
};

/** Filters that differ from the view mark it "Modified"; the menu offers Save changes, Save as new view and Revert. */
export const ModifiedView: Story = {
  args: { fields: allKinds, views, viewCounts },
  render: inBlade({
    filters: MODIFIED,
    open: [".vc-search-bar__view-btn"],
  }),
};

/** User views have a "⋯" menu with Rename and Delete; module views and "All" have none. */
export const ManageUserViews: Story = {
  args: { fields: allKinds, views },
  render: inBlade({
    seed: userViews,
    open: [".vc-search-bar__view-btn", ".vc-search-bar__view-more[data-view-id='u-big']"],
  }),
};

/** With the view modified, the Filters panel shows the unsaved row above its footer: revert, Save, Save as view. */
export const UnsavedRowInPanel: Story = {
  args: { fields: allKinds, views, resultCount: 9 },
  render: inBlade({
    filters: MODIFIED,
    open: [".vc-search-bar__filters-main"],
  }),
};

/** In a medium blade (600px) the selector stays in the header; the filters fold into the Filters button. */
export const ViewsInMediumBlade: Story = {
  args: { fields: allKinds, views },
  render: inBlade({ width: 600, filters: MODIFIED }),
};

/** A bar outside a blade shows the view selector at the start of its own row. */
export const ViewsOutsideBlade: Story = {
  args: { fields: allKinds, views },
  render: (args) => ({
    components: { VcSearchBar },
    setup: () => ({ args, storageKey: freshKey("row") }),
    template:
      '<div style="width: 1000px; max-width: 100%"><VcSearchBar v-bind="args" :storage-key="storageKey" /></div>',
  }),
};

// Hidden from the sidebar and docs, still run by the story tests
const TEST_ONLY = ["!dev", "!autodocs", "test"];

/** Test: save the modified filters as a new view, then change and revert it. */
export const ViewSaveRevertTest: Story = {
  name: "View save and revert (test)",
  tags: TEST_ONLY,
  args: { fields: allKinds, views },
  render: inBlade({ filters: MODIFIED }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(await canvas.findByRole("button", { name: "View: Open orders, Modified" }));
    await userEvent.click(await body.findByRole("button", { name: "Save as new view…" }));
    await userEvent.type(body.getByRole("textbox", { name: "View name" }), "Overdue open{Enter}");
    const selector = await canvas.findByRole("button", { name: "View: Overdue open" });
    await expect(selector).toBeInTheDocument();

    // a chip removed marks the new view modified; Revert brings the chip back
    await userEvent.click(canvas.getByRole("button", { name: "Remove Overdue filter" }));
    await userEvent.click(await canvas.findByRole("button", { name: "View: Overdue open, Modified" }));
    await userEvent.click(await body.findByRole("button", { name: "Revert to “Overdue open”" }));
    await waitFor(() => expect(canvas.getByRole("button", { name: "View: Overdue open" })).toBeInTheDocument());
    await expect(canvas.getByRole("button", { name: "Remove Overdue filter" })).toBeInTheDocument();
  },
};
