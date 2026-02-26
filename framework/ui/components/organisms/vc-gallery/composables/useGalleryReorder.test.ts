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

  it("returns isDragging and draggedId refs", () => {
    const images = ref<ICommonAsset[]>([
      { name: "a.png", sortOrder: 0 },
      { name: "b.png", sortOrder: 1 },
    ]);
    const { isDragging, draggedId } = useGalleryReorder(images, { disabled: ref(false), onSort: vi.fn() });
    expect(isDragging.value).toBe(false);
    expect(draggedId.value).toBeUndefined();
  });
});
