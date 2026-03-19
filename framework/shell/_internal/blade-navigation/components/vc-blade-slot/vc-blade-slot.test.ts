import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, ref, computed } from "vue";
import VcBladeSlot from "./vc-blade-slot.vue";

// Mock all heavy dependencies
const mockGetBladeComponent = vi.fn(() => defineComponent({ setup: () => () => h("div", "blade-content") }));

vi.mock("@core/composables/useBladeRegistry", () => ({
  useBladeRegistry: () => ({
    getBladeComponent: mockGetBladeComponent,
  }),
}));

vi.mock("@core/blade-navigation/useBladeStack", () => ({
  useBladeStack: () => ({
    setBladeTitle: vi.fn(),
  }),
}));

vi.mock("@core/blade-navigation/useBladeMessaging", () => ({
  useBladeMessaging: () => ({
    exposeToChildren: vi.fn(),
    cleanup: vi.fn(),
  }),
}));

vi.mock("@shell/components/error-interceptor", () => ({
  ErrorInterceptor: defineComponent({
    name: "ErrorInterceptor",
    props: ["capture"],
    setup(_, { slots }) {
      return () => slots.default?.({ error: null, reset: () => {} });
    },
  }),
}));

const baseDescriptor = {
  id: "blade-1",
  parentId: "root",
  name: "TestBlade",
  param: { id: "123" },
  options: { key: "val" },
  visible: true,
  error: undefined,
  title: undefined,
  url: undefined,
  query: undefined,
};

function mountSlot(overrides = {}) {
  return mount(VcBladeSlot, {
    props: {
      descriptor: { ...baseDescriptor, ...overrides },
      closable: true,
      expanded: false,
      visible: true,
    },
  });
}

describe("vc-blade-slot.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetBladeComponent.mockReturnValue(
      defineComponent({ setup: () => () => h("div", "blade-content") }),
    );
  });

  it("renders when blade component is resolved", () => {
    const wrapper = mountSlot();
    expect(wrapper.html()).toContain("blade-content");
  });

  it("does not render blade when registry returns undefined", () => {
    mockGetBladeComponent.mockReturnValue(undefined);
    const wrapper = mountSlot();
    expect(wrapper.html()).not.toContain("blade-content");
  });

  it("resolves blade from registry using descriptor.name", () => {
    mountSlot({ name: "MyBlade" });
    expect(mockGetBladeComponent).toHaveBeenCalledWith("MyBlade");
  });

  it("emits close with bladeId when blade emits close:blade", async () => {
    const BladeComp = defineComponent({
      emits: ["close:blade"],
      setup(_, { emit }) {
        return () => h("button", { onClick: () => emit("close:blade") }, "Close");
      },
    });
    mockGetBladeComponent.mockReturnValue(BladeComp);

    const wrapper = mountSlot();
    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();
    expect(wrapper.emitted("close")![0][0]).toBe("blade-1");
  });

  it("emits parentCall when blade emits parent:call", async () => {
    const BladeComp = defineComponent({
      emits: ["parent:call"],
      setup(_, { emit }) {
        return () =>
          h("button", { onClick: () => emit("parent:call", { method: "reload" }) }, "Call");
      },
    });
    mockGetBladeComponent.mockReturnValue(BladeComp);

    const wrapper = mountSlot();
    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("parentCall")).toBeTruthy();
    expect(wrapper.emitted("parentCall")![0]).toEqual([{ method: "reload" }, "blade-1"]);
  });
});
