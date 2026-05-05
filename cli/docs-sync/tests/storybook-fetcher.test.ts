import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchStorybookIds } from "../src/storybook/index-fetcher.js";

describe("fetchStorybookIds", () => {
  beforeEach(() => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        v: 5,
        entries: {
          "atoms-vc-button--default": { id: "atoms-vc-button--default", type: "story" },
          "atoms-vc-button--primary": { id: "atoms-vc-button--primary", type: "story" },
          "docs-overview--page": { id: "docs-overview--page", type: "docs" }, // non-story
        },
      }),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a Set of story IDs (excludes type=docs)", async () => {
    const ids = await fetchStorybookIds("https://example.com");
    expect(ids.has("atoms-vc-button--default")).toBe(true);
    expect(ids.has("atoms-vc-button--primary")).toBe(true);
    expect(ids.has("docs-overview--page")).toBe(false);
  });

  it("throws on fetch failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false, status: 404 } as Response);
    await expect(fetchStorybookIds("https://example.com")).rejects.toThrow(/Storybook index/);
  });
});
