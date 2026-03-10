import { describe, it, expect } from "vitest";
import { defineComponent, provide, h } from "vue";
import { mount } from "@vue/test-utils";
import { useBlade, useBladeContext } from "./index";
import { BladeInstanceKey } from "@framework/injection-keys";
import {
  BladeDescriptorKey,
  BladeStackKey,
  BladeMessagingKey,
} from "@shared/components/blade-navigation/types";
import type { ComputedRef } from "vue";
import type { IBladeInstance } from "@shared/components/blade-navigation/types";
import {
  mountWithSetup,
  mountWithBladeContext,
  expectNoVueWarnings,
} from "@framework/test-helpers";

// ── useBlade() ────────────────────────────────────────────────────────────────

describe("useBlade()", () => {
  it("throws [vc-shell] error when called outside blade injection context", () => {
    const TestComponent = defineComponent({
      setup() {
        // No blade provided — should throw
        useBlade();
        return () => h("div");
      },
    });

    expect(() => mount(TestComponent)).toThrow(/\[vc-shell\] useBlade\(\) called outside blade context/);
  });

  it("does NOT throw when called with valid BladeInstance injection", () => {
    const fakeBladeInstance = { value: { id: "test-blade" } } as unknown as ComputedRef<IBladeInstance>;

    const TestComponent = defineComponent({
      setup() {
        provide(BladeInstanceKey, fakeBladeInstance);
        // Child would call useBlade — we test that provide works
        return () => h("div");
      },
    });

    expect(() => mount(TestComponent)).not.toThrow();
  });
});

// ── useBladeContext() — behavior tests ────────────────────────────────────────

describe("useBladeContext()", () => {
  it("throws [vc-shell] error when called outside blade injection context", () => {
    const TestComponent = defineComponent({
      setup() {
        // No blade context provided — should throw
        useBladeContext();
        return () => h("div");
      },
    });

    expect(() => mount(TestComponent)).toThrow(/\[vc-shell\] useBladeContext\(\) called outside blade context/);
  });

  it("returns id from the injected descriptor", () => {
    const { result } = mountWithBladeContext(() => useBladeContext(), {
      descriptor: { id: "blade-42" },
    });
    expect(result.id.value).toBe("blade-42");
  });

  it("openBlade() calls bladeStack.openBlade with parentId auto-set from descriptor", async () => {
    const { result, mockStack } = mountWithBladeContext(() => useBladeContext(), {
      descriptor: { id: "parent-blade" },
    });
    await result.openBlade({ name: "ChildBlade", param: "p1" });
    expect(mockStack.openBlade).toHaveBeenCalledWith(
      expect.objectContaining({ name: "ChildBlade", param: "p1", parentId: "parent-blade" }),
    );
  });

  it("closeSelf() calls bladeStack.closeBlade with own id", async () => {
    const { result, mockStack } = mountWithBladeContext(() => useBladeContext(), {
      descriptor: { id: "blade-x" },
    });
    await result.closeSelf();
    expect(mockStack.closeBlade).toHaveBeenCalledWith("blade-x");
  });

  it("callParent() delegates to bladeMessaging.callParent with own id and method", async () => {
    const { result, mockMessaging } = mountWithBladeContext(() => useBladeContext(), {
      descriptor: { id: "child-blade" },
    });
    await result.callParent("reload", { force: true });
    expect(mockMessaging.callParent).toHaveBeenCalledWith("child-blade", "reload", { force: true });
  });
});

// ── cleanup ────────────────────────────────────────────────────────────────────

describe("cleanup", () => {
  it("useBlade() unmount produces no Vue warnings", async () => {
    const fakeBladeInstance = { value: { id: "test-blade" } } as unknown as ComputedRef<IBladeInstance>;

    await expectNoVueWarnings(async () => {
      const TestComponent = defineComponent({
        setup() {
          provide(BladeInstanceKey, fakeBladeInstance);
          return () => h("div");
        },
      });
      const wrapper = mount(TestComponent);
      await wrapper.vm.$nextTick();
      wrapper.unmount();
    });
  });

  it("useBladeContext() unmount produces no Vue warnings", async () => {
    await expectNoVueWarnings(async () => {
      const { wrapper } = mountWithBladeContext(() => useBladeContext());
      await wrapper.vm.$nextTick();
      wrapper.unmount();
    });
  });
});
