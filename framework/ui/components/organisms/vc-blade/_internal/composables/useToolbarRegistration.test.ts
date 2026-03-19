import { ref, nextTick } from "vue";
import { mountWithSetup } from "@framework/test-helpers";

const mockRegisteredItems = ref<any[]>([]);
const mockRegister = vi.fn();
const mockUnregister = vi.fn();
const mockUpdate = vi.fn();
const mockGetItems = vi.fn(() => mockRegisteredItems.value);

vi.mock("@core/composables/usePermissions", () => ({
  usePermissions: () => ({
    hasAccess: (perms: string | string[] | undefined) => {
      if (!perms) return true;
      if (Array.isArray(perms)) return !perms.includes("denied");
      return perms !== "denied";
    },
  }),
}));

vi.mock("@core/composables/useToolbar", () => ({
  useToolbar: () => ({
    registerToolbarItem: mockRegister,
    unregisterToolbarItem: mockUnregister,
    getToolbarItems: mockGetItems,
    updateToolbarItem: mockUpdate,
  }),
}));

vi.mock("@core/composables/useBlade", () => ({
  useBlade: () => ({
    id: ref("test-blade"),
  }),
}));

import { useToolbarRegistration } from "./useToolbarRegistration";

describe("useToolbarRegistration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRegisteredItems.value = [];
  });

  it("returns visibleItems computed", () => {
    const items = ref<any[]>([]);
    const { result } = mountWithSetup(() => useToolbarRegistration(items));

    expect(result).toHaveProperty("visibleItems");
  });

  it("registers toolbar items on mount", () => {
    const items = ref([{ id: "btn-1", title: "Save" }]);
    mountWithSetup(() => useToolbarRegistration(items));

    expect(mockRegister).toHaveBeenCalledTimes(1);
    expect(mockRegister).toHaveBeenCalledWith(
      expect.objectContaining({ id: "btn-1", title: "Save", bladeId: "test-blade" }),
      "test-blade",
    );
  });

  it("unregisters items on unmount", () => {
    const items = ref([{ id: "btn-1" }]);
    const { wrapper } = mountWithSetup(() => useToolbarRegistration(items));

    wrapper.unmount();
    expect(mockUnregister).toHaveBeenCalledWith("btn-1", "test-blade");
  });

  it("updates existing items instead of re-registering", async () => {
    const items = ref([{ id: "btn-1", title: "Save" }]);
    mountWithSetup(() => useToolbarRegistration(items));

    // First call registers
    expect(mockRegister).toHaveBeenCalledTimes(1);

    // Trigger change
    items.value = [{ id: "btn-1", title: "Save Draft" }];
    await nextTick();

    expect(mockUpdate).toHaveBeenCalledWith(
      "btn-1",
      expect.objectContaining({ title: "Save Draft" }),
      "test-blade",
    );
  });

  it("visibleItems filters and sorts by priority", () => {
    mockGetItems.mockReturnValue([
      { id: "a", priority: 0, isVisible: true },
      { id: "b", priority: -1, isVisible: true },
      { id: "c", priority: 1, isVisible: false },
    ]);

    const items = ref<any[]>([]);
    const { result } = mountWithSetup(() => useToolbarRegistration(items));

    // "c" is filtered out (isVisible=false), "a" (priority 0) before "b" (priority -1)
    const ids = result.visibleItems.value.map((i: any) => i.id);
    expect(ids).toEqual(["a", "b"]);
  });

  it("generates an id when item has none", () => {
    const items = ref([{ title: "No Id" }]);
    mountWithSetup(() => useToolbarRegistration(items));

    expect(mockRegister).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.stringContaining("prop_toolbar_item_"),
      }),
      "test-blade",
    );
  });
});
