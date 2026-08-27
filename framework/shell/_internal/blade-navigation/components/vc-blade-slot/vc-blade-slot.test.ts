import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, inject, ref, type ComputedRef } from "vue";
import VcBladeSlot from "./vc-blade-slot.vue";
import { BLADE_ID_ATTRIBUTE } from "@shell/_internal/blade-navigation/components/vc-blade-navigation/focus-target";
import {
  BladeDescriptorKey,
  BladeRenderingStateKey,
  type BladeDescriptor,
  type BladeRenderingState,
} from "@core/blade-navigation/types";

// Mock all heavy dependencies
const mockGetBladeComponent = vi.fn(() => defineComponent({ setup: () => () => h("div", "blade-content") }));

vi.mock("@core/composables/useBladeRegistry", () => ({
  useBladeRegistry: () => ({
    getBladeComponent: mockGetBladeComponent,
  }),
}));

// `undefined` = a stack without trailFor, so the deprecated prop still shows through.
let mockTrail: BladeRenderingState["breadcrumbs"];

vi.mock("@core/blade-navigation/useBladeStack", () => ({
  useBladeStack: () => ({
    setBladeTitle: vi.fn(),
    getMaximizedRef: () => ref(false),
    trailFor: () => mockTrail,
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
    mockTrail = undefined;
    mockGetBladeComponent.mockReturnValue(defineComponent({ setup: () => () => h("div", "blade-content") }));
  });

  it("renders when blade component is resolved", () => {
    const wrapper = mountSlot();
    expect(wrapper.text()).toContain("blade-content");
  });

  // A maximized blade covers the ones behind it; without inert they stayed
  // keyboard-reachable and exposed to assistive tech (VCST-5632).
  it("marks the blade inert when another blade is maximized over it", () => {
    const wrapper = mount(VcBladeSlot, {
      props: { descriptor: baseDescriptor, closable: true, expanded: false, visible: true, inert: true },
    });
    expect(wrapper.find("[inert]").exists()).toBe(true);
  });

  it("does not set inert when no blade is maximized", () => {
    const wrapper = mountSlot();
    expect(wrapper.find("[inert]").exists()).toBe(false);
  });

  // Keyboard shortcuts resolve their target blade by walking up from
  // document.activeElement to this marker (VCST-5680).
  it("stamps the blade id on the rendered blade so focus can be traced back to it", () => {
    const wrapper = mountSlot({ id: "blade-42" });
    // Asserted through the constant the resolver reads, so the two cannot drift.
    expect(wrapper.find(`[${BLADE_ID_ATTRIBUTE}]`).attributes(BLADE_ID_ATTRIBUTE)).toBe("blade-42");
  });

  it("does not render blade when registry returns undefined", () => {
    mockGetBladeComponent.mockReturnValue(undefined);
    const wrapper = mountSlot();
    expect(wrapper.text()).not.toContain("blade-content");
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
        return () => h("button", { onClick: () => emit("parent:call", { method: "reload" }) }, "Call");
      },
    });
    mockGetBladeComponent.mockReturnValue(BladeComp);

    const wrapper = mountSlot();
    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("parentCall")).toBeTruthy();
    expect(wrapper.emitted("parentCall")![0]).toEqual([{ method: "reload" }, "blade-1"]);
  });

  // ── Immutable descriptor + rendering-state seam ─────────────────────────────

  describe("descriptor / rendering-state seam", () => {
    // Capture what the blade component sees through the two injections.
    let captured: {
      descriptor?: ComputedRef<BladeDescriptor>;
      renderingState?: ComputedRef<BladeRenderingState>;
    };

    function mountWithCapture(props: Record<string, unknown> = {}) {
      captured = {};
      const BladeComp = defineComponent({
        setup() {
          captured.descriptor = inject(BladeDescriptorKey);
          captured.renderingState = inject(BladeRenderingStateKey);
          return () => h("div", "blade-content");
        },
      });
      mockGetBladeComponent.mockReturnValue(BladeComp);
      return mount(VcBladeSlot, {
        props: {
          descriptor: { ...baseDescriptor },
          closable: true,
          expanded: false,
          visible: true,
          ...props,
        },
      });
    }

    it("provides the descriptor as the immutable data object (not enriched)", () => {
      mountWithCapture();
      const provided = captured.descriptor!.value;
      // Same object reference as props.descriptor — no spread/enrichment.
      expect(provided).toEqual(baseDescriptor);
      // The old enriched fields must NOT be spread onto the descriptor.
      expect("maximized" in provided).toBe(false);
      expect("breadcrumbs" in provided).toBe(false);
    });

    it("takes the breadcrumb trail from the stack and ignores the deprecated prop", () => {
      mockTrail = [{ id: "blade-0", title: "All orders" }];
      mountWithCapture({ breadcrumbs: [{ id: "0", title: "TestBlade" }] });

      expect(captured.renderingState!.value.breadcrumbs).toEqual([{ id: "blade-0", title: "All orders" }]);
    });

    it("exposes maximized + breadcrumbs via the rendering-state key, not the descriptor", () => {
      const breadcrumbs = [{ id: "b1", title: "Home" }] as unknown as BladeRenderingState["breadcrumbs"];
      mountWithCapture({ breadcrumbs });

      const rs = captured.renderingState!.value;
      expect(rs.maximized).toBe(false);
      expect(rs.breadcrumbs).toEqual(breadcrumbs);

      // And the descriptor is untouched by these view concerns.
      expect("maximized" in captured.descriptor!.value).toBe(false);
      expect("breadcrumbs" in captured.descriptor!.value).toBe(false);
    });

    it("rendering-state maximized reacts to expand/collapse without mutating the descriptor", async () => {
      const BladeComp = defineComponent({
        emits: ["expand:blade", "collapse:blade"],
        setup(_, { emit }) {
          captured = {
            descriptor: inject(BladeDescriptorKey),
            renderingState: inject(BladeRenderingStateKey),
          };
          return () =>
            h("div", [
              h("button", { class: "expand", onClick: () => emit("expand:blade") }, "expand"),
              h("button", { class: "collapse", onClick: () => emit("collapse:blade") }, "collapse"),
            ]);
        },
      });
      mockGetBladeComponent.mockReturnValue(BladeComp);
      const wrapper = mount(VcBladeSlot, {
        props: { descriptor: { ...baseDescriptor }, closable: true, expanded: false, visible: true },
      });

      expect(captured.renderingState!.value.maximized).toBe(false);

      await wrapper.find("button.expand").trigger("click");
      expect(captured.renderingState!.value.maximized).toBe(true);
      // Descriptor stays a pure data object.
      expect("maximized" in captured.descriptor!.value).toBe(false);

      await wrapper.find("button.collapse").trigger("click");
      expect(captured.renderingState!.value.maximized).toBe(false);
    });
  });
});
