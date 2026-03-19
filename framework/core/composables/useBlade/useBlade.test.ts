import { describe, it, expect } from "vitest";
import { useBlade } from "./index";
import {
  mountWithBladeContext,
  mountWithoutBladeContext,
  expectNoVueWarnings,
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
    interface TestOptions { productId: string; count: number }
    const { result } = mountWithBladeContext(
      () => useBlade<TestOptions>(),
      { descriptor: { id: "b1", options: { productId: "p1", count: 5 } } },
    );
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
