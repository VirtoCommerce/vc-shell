import { describe, it, expect, vi } from "vitest";
import { defineComponent, h, ref } from "vue";
import { mount } from "@vue/test-utils";
import { useGalleryReorder } from "./useGalleryReorder";
import type { AssetLike } from "@core/composables/useAssetsManager";

function mountGalleryReorder(images: AssetLike[], disabled = false) {
  let result!: ReturnType<typeof useGalleryReorder>;
  const Comp = defineComponent({
    setup() {
      result = useGalleryReorder(ref(images), { disabled: ref(disabled), onSort: vi.fn() });
      return () => h("div");
    },
  });
  const wrapper = mount(Comp);
  return { result, wrapper };
}

describe("useGalleryReorder", () => {
  it("disableDrag is true when images <= 1", () => {
    const { result, wrapper } = mountGalleryReorder([{ name: "a.png", sortOrder: 0 }], false);
    expect(result.disableDrag.value).toBe(true);
    wrapper.unmount();
  });

  it("disableDrag is false when images > 1", () => {
    const { result, wrapper } = mountGalleryReorder(
      [
        { name: "a.png", sortOrder: 0 },
        { name: "b.png", sortOrder: 1 },
      ],
      false,
    );
    expect(result.disableDrag.value).toBe(false);
    wrapper.unmount();
  });

  it("disableDrag is true when disabled prop is true", () => {
    const { result, wrapper } = mountGalleryReorder(
      [
        { name: "a.png", sortOrder: 0 },
        { name: "b.png", sortOrder: 1 },
      ],
      true,
    );
    expect(result.disableDrag.value).toBe(true);
    wrapper.unmount();
  });

  it("returns isDragging and draggedId refs", () => {
    const { result, wrapper } = mountGalleryReorder(
      [
        { name: "a.png", sortOrder: 0 },
        { name: "b.png", sortOrder: 1 },
      ],
      false,
    );
    expect(result.isDragging.value).toBe(false);
    expect(result.draggedId.value).toBeUndefined();
    wrapper.unmount();
  });

  // Handle-based drag is managed by SortableJS internally via the `handle` option.
  // No manual mousedown/draggable tests needed.
});
