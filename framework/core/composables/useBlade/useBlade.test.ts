import { describe, it, expect, vi } from "vitest";
import { nextTick } from "vue";
import { useBlade } from "./index";
import {
  mountWithBladeContext,
  mountWithoutBladeContext,
  expectNoVueWarnings,
  createMockBladeStack,
} from "@framework/test-helpers";

// ── useBlade() inside blade context ────────────────────────────────────────

describe("useBlade() inside blade context", () => {
  it("returns id from the injected descriptor", () => {
    const { result } = mountWithBladeContext(() => useBlade(), {
      descriptor: { id: "blade-42" },
    });
    expect(result.id.value).toBe("blade-42");
  });

  it("openBlade() calls bladeStack.openBlade with parentId auto-set from descriptor", async () => {
    const { result, mockStack } = mountWithBladeContext(() => useBlade(), {
      descriptor: { id: "parent-blade" },
    });
    await result.openBlade({ name: "ChildBlade", param: "p1" });
    expect(mockStack.openBlade).toHaveBeenCalledWith(
      expect.objectContaining({ name: "ChildBlade", param: "p1", parentId: "parent-blade" }),
    );
  });

  it("closeSelf() calls bladeStack.closeBlade with own id", async () => {
    const { result, mockStack } = mountWithBladeContext(() => useBlade(), {
      descriptor: { id: "blade-x" },
    });
    await result.closeSelf();
    expect(mockStack.closeBlade).toHaveBeenCalledWith("blade-x");
  });

  it("closeChildren() calls bladeStack.closeChildren with own id", async () => {
    const { result, mockStack } = mountWithBladeContext(() => useBlade(), {
      descriptor: { id: "blade-parent" },
    });
    await result.closeChildren();
    expect(mockStack.closeChildren).toHaveBeenCalledWith("blade-parent");
  });

  it("callParent() delegates to bladeMessaging.callParent with own id and method", async () => {
    const { result, mockMessaging } = mountWithBladeContext(() => useBlade(), {
      descriptor: { id: "child-blade" },
    });
    await result.callParent("reload", { force: true });
    expect(mockMessaging.callParent).toHaveBeenCalledWith("child-blade", "reload", { force: true });
  });

  it("param reflects descriptor param", () => {
    const { result } = mountWithBladeContext(() => useBlade(), {
      descriptor: { id: "b1", param: "order-123" },
    });
    expect(result.param.value).toBe("order-123");
  });

  it("closable is true when parentId is set", () => {
    const { result } = mountWithBladeContext(() => useBlade(), {
      descriptor: { id: "b1", parentId: "root" },
    });
    expect(result.closable.value).toBe(true);
  });

  it("closable is false when parentId is undefined", () => {
    const { result } = mountWithBladeContext(() => useBlade(), {
      descriptor: { id: "b1", parentId: undefined },
    });
    expect(result.closable.value).toBe(false);
  });

  it("options returns typed value via generic", () => {
    interface TestOptions {
      productId: string;
      count: number;
    }
    const { result } = mountWithBladeContext(() => useBlade<TestOptions>(), {
      descriptor: { id: "b1", options: { productId: "p1", count: 5 } },
    });
    // TypeScript: result.options.value should be TestOptions | undefined
    expect(result.options.value?.productId).toBe("p1");
    expect(result.options.value?.count).toBe(5);
  });
});

// ── useBlade() outside blade context ───────────────────────────────────────

describe("useBlade() outside blade context", () => {
  it("openBlade() works without blade context (no parentId)", async () => {
    const { result, mockStack } = mountWithoutBladeContext(() => useBlade());
    await result.openBlade({ name: "OrderDetails", param: "order-1" });

    expect(mockStack.openBlade).toHaveBeenCalledWith(
      expect.objectContaining({ name: "OrderDetails", param: "order-1" }),
    );
    // parentId should NOT be set (no descriptor)
    const callArgs = (mockStack.openBlade as any).mock.calls[0][0];
    expect(callArgs.parentId).toBeUndefined();
  });

  it("closeSelf() throws descriptive error outside blade context", async () => {
    const { result } = mountWithoutBladeContext(() => useBlade());
    await expect(result.closeSelf()).rejects.toThrow(/closeSelf\(\) requires blade context/);
  });

  it("closeChildren() throws descriptive error outside blade context", async () => {
    const { result } = mountWithoutBladeContext(() => useBlade());
    await expect(result.closeChildren()).rejects.toThrow(/closeChildren\(\) requires blade context/);
  });

  it("id.value throws descriptive error outside blade context", () => {
    const { result } = mountWithoutBladeContext(() => useBlade());
    expect(() => result.id.value).toThrow(/id requires blade context/);
  });

  it("callParent() throws descriptive error outside blade context", async () => {
    const { result } = mountWithoutBladeContext(() => useBlade());
    await expect(result.callParent("reload")).rejects.toThrow(/callParent\(\) requires blade context/);
  });

  it("error message includes helpful context about VcBladeSlot", async () => {
    const { result } = mountWithoutBladeContext(() => useBlade());
    await expect(result.closeSelf()).rejects.toThrow(/VcBladeSlot/);
  });
});

// ── cleanup ────────────────────────────────────────────────────────────────────

describe("cleanup", () => {
  it("useBlade() unmount produces no Vue warnings", async () => {
    await expectNoVueWarnings(async () => {
      const { wrapper } = mountWithBladeContext(() => useBlade());
      await wrapper.vm.$nextTick();
      wrapper.unmount();
    });
  });
});

// ── lifecycle hooks ─────────────────────────────────────────────────────────

describe("useBlade() lifecycle hooks", () => {
  it("onActivated fires when blade becomes active", async () => {
    const callback = vi.fn();
    // Start as non-active blade
    const mockStack = createMockBladeStack();
    (mockStack.activeBlade as any).value = { id: "other-blade" };

    const { result } = mountWithBladeContext(
      () => {
        const blade = useBlade();
        blade.onActivated(callback);
        return blade;
      },
      { descriptor: { id: "blade-1", parentId: "root" }, stack: mockStack },
    );

    expect(callback).not.toHaveBeenCalled();

    // Simulate blade becoming active
    (mockStack.activeBlade as any).value = { id: "blade-1" };
    await nextTick();

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("onDeactivated fires when blade loses active status", async () => {
    const callback = vi.fn();
    const mockStack = createMockBladeStack();
    (mockStack.activeBlade as any).value = { id: "blade-1" };

    const { result } = mountWithBladeContext(
      () => {
        const blade = useBlade();
        blade.onDeactivated(callback);
        return blade;
      },
      { descriptor: { id: "blade-1", parentId: "root" }, stack: mockStack },
    );

    expect(callback).not.toHaveBeenCalled();

    // Simulate another blade becoming active
    (mockStack.activeBlade as any).value = { id: "other-blade" };
    await nextTick();

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("onActivated does not fire on initial mount (only transitions)", async () => {
    const callback = vi.fn();
    const mockStack = createMockBladeStack();
    // Blade is already active at mount time
    (mockStack.activeBlade as any).value = { id: "blade-1" };

    mountWithBladeContext(
      () => {
        const blade = useBlade();
        blade.onActivated(callback);
        return blade;
      },
      { descriptor: { id: "blade-1", parentId: "root" }, stack: mockStack },
    );

    await nextTick();
    expect(callback).not.toHaveBeenCalled();
  });

  it("onActivated warns on duplicate registration", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    mountWithBladeContext(() => {
      const blade = useBlade();
      blade.onActivated(() => {});
      blade.onActivated(() => {}); // duplicate
      return blade;
    });

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("onActivated() already registered"));
    warnSpy.mockRestore();
  });

  it("onDeactivated warns on duplicate registration", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    mountWithBladeContext(() => {
      const blade = useBlade();
      blade.onDeactivated(() => {});
      blade.onDeactivated(() => {}); // duplicate
      return blade;
    });

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("onDeactivated() already registered"));
    warnSpy.mockRestore();
  });

  it("onActivated throws outside blade context", () => {
    const { result } = mountWithoutBladeContext(() => useBlade());
    expect(() => result.onActivated(() => {})).toThrow(/onActivated\(\) requires blade context/);
  });

  it("onDeactivated throws outside blade context", () => {
    const { result } = mountWithoutBladeContext(() => useBlade());
    expect(() => result.onDeactivated(() => {})).toThrow(/onDeactivated\(\) requires blade context/);
  });
});
