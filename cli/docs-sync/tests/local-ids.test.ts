import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { storyIdsFromSource, collectLocalStoryIds } from "../src/storybook/local-ids.js";

const story = (title: string, exportsSrc: string) => `
import type { Meta } from "@storybook/vue3-vite";
const LABELS = { title: "not the meta" };
const meta = {
  title: "${title}",
  component: X,
} satisfies Meta<typeof X>;
export default meta;
${exportsSrc}
`;

describe("storyIdsFromSource", () => {
  it("builds Storybook ids from the meta title and the story exports", () => {
    const src = story(
      "Data Display/VcSearchBar",
      "export const NarrowBlade = {};\nexport const PhoneFiltersSheetTest = {};\nexport const Step2 = {};",
    );
    expect(storyIdsFromSource(src)).toEqual([
      "data-display-vcsearchbar--narrow-blade",
      "data-display-vcsearchbar--phone-filters-sheet-test",
      "data-display-vcsearchbar--step-2",
    ]);
  });

  it("reads the title from the meta, not from an earlier object", () => {
    expect(storyIdsFromSource(story("Navigation/VcBlade", "export const Basic = {};"))).toEqual([
      "navigation-vcblade--basic",
    ]);
  });

  it("returns nothing for a file without a meta", () => {
    expect(storyIdsFromSource("export const helper = 1;")).toEqual([]);
  });
});

describe("collectLocalStoryIds", () => {
  it("finds the ids of the framework's own stories", async () => {
    const ids = await collectLocalStoryIds(resolve(__dirname, "../../../framework"));
    // ids that the published Storybook has, computed the same way
    expect(ids.has("data-display-vcdatatable--basic")).toBe(true);
    expect(ids.has("navigation-vcblade--widgets-with-alerts")).toBe(true);
  });
});
