import { describe, it, expect, vi } from "vitest";
import { computed, defineComponent, h, inject, provide, ref } from "vue";
import { mount } from "@vue/test-utils";
import { useBlade } from "./index";
import {
  BladeDataKey,
  BladeDescriptorKey,
  BladeStackKey,
  BladeMessagingKey,
} from "@shared/components/blade-navigation/types";
import {
  mountWithBladeContext,
  mountWithoutBladeContext,
  createMockBladeStack,
  createMockBladeMessaging,
} from "@framework/test-helpers";

describe("useBlade().name", () => {
  it("returns descriptor.name", () => {
    const { result } = mountWithBladeContext(() => useBlade(), {
      descriptor: { id: "blade-42", name: "OrderDetails" },
    });
    expect(result.name.value).toBe("OrderDetails");
  });

  it("throws outside blade context", () => {
    const { result } = mountWithoutBladeContext(() => useBlade());
    expect(() => result.name.value).toThrow("requires blade context");
  });
});

describe("useBlade().provideBladeData", () => {
  function mountWithBladeDataChild(
    bladeSetup: () => void,
    childSetup: () => void,
    descriptorOverrides?: Record<string, unknown>,
  ) {
    const mockDescriptor = computed(() => ({
      id: "test-blade",
      parentId: "root",
      name: "TestBlade",
      visible: true,
      ...descriptorOverrides,
    }));

    const Child = defineComponent({
      setup() {
        childSetup();
        return () => h("span");
      },
    });

    const BladeComponent = defineComponent({
      setup() {
        bladeSetup();
        return () => h(Child);
      },
    });

    const Root = defineComponent({
      setup() {
        provide(BladeDescriptorKey, mockDescriptor);
        provide(BladeStackKey, createMockBladeStack());
        provide(BladeMessagingKey, createMockBladeMessaging());
        return () => h(BladeComponent);
      },
    });

    return mount(Root);
  }

  it("provides reactive data under BladeDataKey", () => {
    let injectedData: ReturnType<typeof inject<any>> | undefined;

    mountWithBladeDataChild(
      () => {
        const { provideBladeData } = useBlade();
        provideBladeData(computed(() => ({ id: "123", objectType: "Order" })));
      },
      () => {
        injectedData = inject(BladeDataKey);
      },
      { id: "blade-1", name: "OrderDetails" },
    );

    expect(injectedData).toBeDefined();
    expect(injectedData!.value).toEqual({ id: "123", objectType: "Order" });
  });

  it("accepts plain object and wraps in ref", () => {
    let injectedData: ReturnType<typeof inject<any>> | undefined;

    mountWithBladeDataChild(
      () => {
        const { provideBladeData } = useBlade();
        provideBladeData({ id: "static" });
      },
      () => {
        injectedData = inject(BladeDataKey);
      },
    );

    expect(injectedData!.value).toEqual({ id: "static" });
  });

  it("warns on duplicate call in dev mode", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    mountWithBladeDataChild(
      () => {
        const { provideBladeData } = useBlade();
        provideBladeData(ref({ id: "1" }));
        provideBladeData(ref({ id: "2" }));
      },
      () => {},
    );

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("provideBladeData"),
    );
    warnSpy.mockRestore();
  });
});
