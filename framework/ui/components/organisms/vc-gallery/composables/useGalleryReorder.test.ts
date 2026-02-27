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

  it("enables draggable only from drag handle", () => {
    const images = ref<ICommonAsset[]>([
      { id: "1", name: "a.png", sortOrder: 0 },
      { id: "2", name: "b.png", sortOrder: 1 },
    ]);
    const { reorderHandlers } = useGalleryReorder(images, { disabled: ref(false), onSort: vi.fn() });

    const tile = document.createElement("div");
    const handle = document.createElement("div");
    handle.className = "vc-gallery-item__drag-handle";
    tile.appendChild(handle);

    reorderHandlers.onItemMouseDown({ currentTarget: tile, target: handle, button: 0 } as unknown as MouseEvent);

    expect(tile.draggable).toBe(true);
  });

  it("does not enable draggable when clicking action controls", () => {
    const images = ref<ICommonAsset[]>([
      { id: "1", name: "a.png", sortOrder: 0 },
      { id: "2", name: "b.png", sortOrder: 1 },
    ]);
    const { reorderHandlers } = useGalleryReorder(images, { disabled: ref(false), onSort: vi.fn() });

    const tile = document.createElement("div");
    const actionButton = document.createElement("button");
    tile.appendChild(actionButton);

    reorderHandlers.onItemMouseDown({ currentTarget: tile, target: actionButton, button: 0 } as unknown as MouseEvent);

    expect(tile.draggable).toBe(false);
  });
});
