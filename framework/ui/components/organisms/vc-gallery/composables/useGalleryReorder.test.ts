import { describe, it, expect, vi } from "vitest";
import { ref } from "vue";
import { useGalleryReorder } from "./useGalleryReorder";
import type { ICommonAsset } from "@core/types";

describe("useGalleryReorder", () => {
  it("disableDrag is true when images <= 1", () => {
    const images = ref<ICommonAsset[]>([{ name: "a.png", sortOrder: 0 }]);
    const { disableDrag } = useGalleryReorder(images, { disabled: ref(false), onSort: vi.fn() });
    expect(disableDrag.value).toBe(true);
  });

  it("disableDrag is false when images > 1", () => {
    const images = ref<ICommonAsset[]>([
      { name: "a.png", sortOrder: 0 },
      { name: "b.png", sortOrder: 1 },
    ]);
    const { disableDrag } = useGalleryReorder(images, { disabled: ref(false), onSort: vi.fn() });
    expect(disableDrag.value).toBe(false);
  });

  it("disableDrag is true when disabled prop is true", () => {
    const images = ref<ICommonAsset[]>([
      { name: "a.png", sortOrder: 0 },
      { name: "b.png", sortOrder: 1 },
    ]);
    const { disableDrag } = useGalleryReorder(images, { disabled: ref(true), onSort: vi.fn() });
    expect(disableDrag.value).toBe(true);
  });

  it("reorderArray moves element correctly", () => {
    const images = ref<ICommonAsset[]>([
      { name: "a", sortOrder: 0 },
      { name: "b", sortOrder: 1 },
      { name: "c", sortOrder: 2 },
    ]);
    const onSort = vi.fn();
    const { reorderArray } = useGalleryReorder(images, { disabled: ref(false), onSort });

    reorderArray(images.value, 0, 2);

    expect(images.value.map((i) => i.name)).toEqual(["b", "c", "a"]);
  });
});
