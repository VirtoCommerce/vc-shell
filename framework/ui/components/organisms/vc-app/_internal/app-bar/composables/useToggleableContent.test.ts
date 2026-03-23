import { ref } from "vue";
import { mountWithSetup } from "@framework/test-helpers";
import { useToggleableContent, type ToggleableItem } from "./useToggleableContent";

describe("useToggleableContent", () => {
  const items: ToggleableItem[] = [{ id: "a" }, { id: "b" }, { id: "c" }];

  it("returns the expected API shape", () => {
    const activeId = ref<string | null>(null);
    const { result } = mountWithSetup(() => useToggleableContent(items, activeId));

    expect(result).toHaveProperty("showItem");
    expect(result).toHaveProperty("hideAllItems");
    expect(result).toHaveProperty("toggleItem");
    expect(result).toHaveProperty("currentItem");
    expect(result).toHaveProperty("isAnyItemVisible");
    expect(result).toHaveProperty("closeItem");
  });

  it("currentItem is null when no item is active", () => {
    const activeId = ref<string | null>(null);
    const { result } = mountWithSetup(() => useToggleableContent(items, activeId));

    expect(result.currentItem.value).toBeNull();
    expect(result.isAnyItemVisible.value).toBe(false);
  });

  it("showItem sets the active item", () => {
    const activeId = ref<string | null>(null);
    const { result } = mountWithSetup(() => useToggleableContent(items, activeId));

    result.showItem("b");
    expect(activeId.value).toBe("b");
    expect(result.currentItem.value).toEqual({ id: "b" });
    expect(result.isAnyItemVisible.value).toBe(true);
  });

  it("toggleItem activates an inactive item", () => {
    const activeId = ref<string | null>(null);
    const { result } = mountWithSetup(() => useToggleableContent(items, activeId));

    result.toggleItem("a");
    expect(activeId.value).toBe("a");
  });

  it("toggleItem deactivates an already-active item", () => {
    const activeId = ref<string | null>("a");
    const { result } = mountWithSetup(() => useToggleableContent(items, activeId));

    result.toggleItem("a");
    expect(activeId.value).toBeNull();
  });

  it("hideAllItems resets activeId to null", () => {
    const activeId = ref<string | null>("c");
    const { result } = mountWithSetup(() => useToggleableContent(items, activeId));

    result.hideAllItems();
    expect(activeId.value).toBeNull();
    expect(result.isAnyItemVisible.value).toBe(false);
  });

  it("closeItem resets activeId to null", () => {
    const activeId = ref<string | null>("b");
    const { result } = mountWithSetup(() => useToggleableContent(items, activeId));

    result.closeItem();
    expect(activeId.value).toBeNull();
  });

  it("currentItem returns null for non-existent id", () => {
    const activeId = ref<string | null>("missing");
    const { result } = mountWithSetup(() => useToggleableContent(items, activeId));

    expect(result.currentItem.value).toBeNull();
  });

  it("handles null/undefined items getter gracefully", () => {
    const activeId = ref<string | null>("a");
    const { result } = mountWithSetup(() => useToggleableContent(null, activeId));

    expect(result.currentItem.value).toBeNull();
  });

  it("works with a computed/ref getter", () => {
    const activeId = ref<string | null>(null);
    const itemsRef = ref(items);
    const { result } = mountWithSetup(() => useToggleableContent(itemsRef, activeId));

    result.showItem("c");
    expect(result.currentItem.value).toEqual({ id: "c" });
  });
});
