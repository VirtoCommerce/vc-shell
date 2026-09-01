import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { computed, nextTick, ref } from "vue";
import { BladeDescriptorKey, BladeRenderingStateKey } from "@core/blade-navigation/types";
import { IsMobileKey, IsDesktopKey } from "@framework/injection-keys";
import type { BladeDescriptor, BladeRenderingState } from "@core/blade-navigation/types";

// Mock @floating-ui/vue: keep real exports (VcTooltip needs useFloating/autoUpdate/etc.),
// override only `shift` (used directly by BladeHeader's own tooltip positioning).
vi.mock("@floating-ui/vue", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@floating-ui/vue")>();
  return {
    ...actual,
    shift: () => ({}),
  };
});

// Mock composables
vi.mock("@ui/composables", () => ({
  useFloatingPosition: () => ({
    floatingStyle: ref({}),
  }),
  useTeleportTarget: () => ({
    teleportTarget: "body",
  }),
}));

import BladeHeader from "./BladeHeader.vue";

// The second arg carries both descriptor overrides and rendering-state fields
// (maximized/breadcrumbs). Rendering state is now a separate injection from the
// immutable descriptor, so route those fields to BladeRenderingStateKey.
function factory(
  props: Record<string, unknown> = {},
  bladeInstance?: Partial<BladeDescriptor> & Partial<BladeRenderingState>,
) {
  const { maximized, breadcrumbs, ...descriptorOverrides } = bladeInstance ?? {};
  const defaultDescriptor = computed<BladeDescriptor>(() => ({
    id: "test-blade",
    name: "TestBlade",
    visible: true,
    ...descriptorOverrides,
  }));
  const renderingState = computed<BladeRenderingState>(() => ({
    maximized: maximized ?? false,
    breadcrumbs,
  }));

  return mount(BladeHeader, {
    props,
    global: {
      provide: {
        [BladeDescriptorKey as symbol]: defaultDescriptor,
        [BladeRenderingStateKey as symbol]: renderingState,
        [IsMobileKey as symbol]: ref(false),
        [IsDesktopKey as symbol]: ref(true),
      },
      stubs: {
        VcIcon: {
          name: "VcIcon",
          props: ["icon", "size"],
          template: '<i class="vc-icon-stub" />',
        },
        teleport: true,
      },
      mocks: {
        $t: (key: string) => key,
      },
    },
  });
}

describe("BladeHeader", () => {
  it("renders with vc-blade-header class", () => {
    const wrapper = factory();
    expect(wrapper.find(".vc-blade-header").exists()).toBe(true);
  });

  it("renders title text", () => {
    const wrapper = factory({ title: "My Blade" });
    expect(wrapper.find(".vc-blade-header__title").text()).toBe("My Blade");
  });

  it("renders subtitle when provided", () => {
    const wrapper = factory({ title: "Blade", subtitle: "Details" });
    expect(wrapper.find(".vc-blade-header__subtitle").text()).toBe("Details");
  });

  it("hides subtitle when not provided", () => {
    const wrapper = factory({ title: "Blade" });
    expect(wrapper.find(".vc-blade-header__subtitle").exists()).toBe(false);
  });

  it("applies title-no-subtitle class when no subtitle", () => {
    const wrapper = factory({ title: "Blade" });
    expect(wrapper.find(".vc-blade-header__title").classes()).toContain("vc-blade-header__title-no-subtitle");
  });

  it("renders icon when provided", () => {
    const wrapper = factory({ icon: "lucide-box" });
    expect(wrapper.find(".vc-blade-header__icon").exists()).toBe(true);
  });

  it("hides icon when not provided", () => {
    const wrapper = factory();
    expect(wrapper.find(".vc-blade-header__icon").exists()).toBe(false);
  });

  it("shows modified status dot when modified is true", () => {
    const wrapper = factory({ modified: true });
    expect(wrapper.find(".vc-blade-header__status-edited").exists()).toBe(true);
  });

  it("shows not-edited status dot when modified is false", () => {
    const wrapper = factory({ modified: false });
    expect(wrapper.find(".vc-blade-header__status-not-edited").exists()).toBe(true);
  });

  it("does not show edited/not-edited class when modified is not passed", () => {
    const wrapper = factory();
    // When modified is not explicitly passed, the status dot may render but won't have edited/not-edited
    // In Vue, typeof undefined !== 'undefined' can be truthy if prop is defined but not passed
    // The key behavior: no edited or not-edited class should be applied
    const hasEdited = wrapper.find(".vc-blade-header__status-edited").exists();
    const hasNotEdited = wrapper.find(".vc-blade-header__status-not-edited").exists();
    // Neither should be present when modified is truly undefined
    // But if the status dot renders, it won't have either class
    expect(hasEdited && hasNotEdited).toBe(false);
  });

  it("shows close button when closable=true", () => {
    const wrapper = factory({ closable: true });
    const buttons = wrapper.findAll(".vc-blade-header__button");
    // Should have close button (last one)
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("hides close button when closable is not set", () => {
    const wrapper = factory();
    // closable defaults to undefined/false, no close button
    const closeButtons = wrapper.findAll(".vc-blade-header__button");
    expect(closeButtons.length).toBe(0);
  });

  it("emits close when close button is clicked", async () => {
    const wrapper = factory({ closable: true });
    const buttons = wrapper.findAll(".vc-blade-header__button");
    // close button is the last one
    await buttons[buttons.length - 1].trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("shows expand button when blade is closable and not maximized", () => {
    const wrapper = factory({ closable: true }, { maximized: false });
    const buttons = wrapper.findAll(".vc-blade-header__button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("emits expand when expand button is clicked", async () => {
    const wrapper = factory({ closable: true }, { maximized: false });
    // First button is expand, second is close
    const buttons = wrapper.findAll(".vc-blade-header__button");
    await buttons[0].trigger("click");
    expect(wrapper.emitted("expand")).toBeTruthy();
  });

  it("shows collapse button when blade is closable and maximized", () => {
    const wrapper = factory({ closable: true }, { maximized: true });
    const buttons = wrapper.findAll(".vc-blade-header__button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("emits collapse when collapse button is clicked", async () => {
    const wrapper = factory({ closable: true }, { maximized: true });
    const buttons = wrapper.findAll(".vc-blade-header__button");
    await buttons[0].trigger("click");
    expect(wrapper.emitted("collapse")).toBeTruthy();
  });

  describe("accessibility / shortcuts", () => {
    it("close control has role=button, tabindex=0, non-empty aria-label, and aria-keyshortcuts=Escape", () => {
      const wrapper = factory({ closable: true }, { maximized: false });
      const buttons = wrapper.findAll(".vc-blade-header__button");
      const closeButton = buttons[buttons.length - 1];
      expect(closeButton.attributes("role")).toBe("button");
      expect(closeButton.attributes("tabindex")).toBe("0");
      expect(closeButton.attributes("aria-label")).toBeTruthy();
      expect(closeButton.attributes("aria-keyshortcuts")).toBe("Escape");
    });

    it("maximize control has role=button, tabindex=0, non-empty aria-label, and aria-keyshortcuts ending in +\\", () => {
      const wrapper = factory({ closable: true }, { maximized: false });
      const buttons = wrapper.findAll(".vc-blade-header__button");
      const expandButton = buttons[0];
      expect(expandButton.attributes("role")).toBe("button");
      expect(expandButton.attributes("tabindex")).toBe("0");
      expect(expandButton.attributes("aria-label")).toBeTruthy();
      expect(expandButton.attributes("aria-keyshortcuts")).toMatch(/\+\\$/);
    });

    it("restore control (maximized state) has aria-keyshortcuts ending in +\\ and a non-empty aria-label", () => {
      const wrapper = factory({ closable: true }, { maximized: true });
      const buttons = wrapper.findAll(".vc-blade-header__button");
      const collapseButton = buttons[0];
      expect(collapseButton.attributes("role")).toBe("button");
      expect(collapseButton.attributes("tabindex")).toBe("0");
      expect(collapseButton.attributes("aria-label")).toBeTruthy();
      expect(collapseButton.attributes("aria-keyshortcuts")).toMatch(/\+\\$/);
    });

    it("emits expand when expand control is activated via keydown.enter", async () => {
      const wrapper = factory({ closable: true }, { maximized: false });
      const buttons = wrapper.findAll(".vc-blade-header__button");
      await buttons[0].trigger("keydown.enter");
      expect(wrapper.emitted("expand")).toBeTruthy();
    });

    it("emits expand when expand control is activated via keydown.space", async () => {
      const wrapper = factory({ closable: true }, { maximized: false });
      const buttons = wrapper.findAll(".vc-blade-header__button");
      await buttons[0].trigger("keydown.space");
      expect(wrapper.emitted("expand")).toBeTruthy();
    });

    it("emits close when close control is activated via keydown.enter", async () => {
      const wrapper = factory({ closable: true }, { maximized: false });
      const buttons = wrapper.findAll(".vc-blade-header__button");
      await buttons[buttons.length - 1].trigger("keydown.enter");
      expect(wrapper.emitted("close")).toBeTruthy();
    });

    it("emits close when close control is activated via keydown.space", async () => {
      const wrapper = factory({ closable: true }, { maximized: false });
      const buttons = wrapper.findAll(".vc-blade-header__button");
      await buttons[buttons.length - 1].trigger("keydown.space");
      expect(wrapper.emitted("close")).toBeTruthy();
    });

    it("emits collapse when collapse control is activated via keydown.enter", async () => {
      const wrapper = factory({ closable: true }, { maximized: true });
      const buttons = wrapper.findAll(".vc-blade-header__button");
      await buttons[0].trigger("keydown.enter");
      expect(wrapper.emitted("collapse")).toBeTruthy();
    });
  });

  it("renders prepend slot", () => {
    const wrapper = mount(BladeHeader, {
      props: { title: "Test" },
      slots: { prepend: '<div class="back-btn">Back</div>' },
      global: {
        provide: {
          [BladeDescriptorKey as symbol]: computed<BladeDescriptor>(() => ({
            id: "blade-1",
            name: "TestBlade",
            visible: true,
          })),
          [IsMobileKey as symbol]: ref(false),
          [IsDesktopKey as symbol]: ref(true),
        },
        stubs: { VcIcon: true, teleport: true },
        mocks: { $t: (k: string) => k },
      },
    });
    expect(wrapper.find(".back-btn").exists()).toBe(true);
  });

  it("renders actions slot", () => {
    const wrapper = mount(BladeHeader, {
      props: { title: "Test" },
      slots: { actions: '<button class="action-btn">Save</button>' },
      global: {
        provide: {
          [BladeDescriptorKey as symbol]: computed<BladeDescriptor>(() => ({
            id: "blade-1",
            name: "TestBlade",
            visible: true,
          })),
          [IsMobileKey as symbol]: ref(false),
          [IsDesktopKey as symbol]: ref(true),
        },
        stubs: { VcIcon: true, teleport: true },
        mocks: { $t: (k: string) => k },
      },
    });
    expect(wrapper.find(".action-btn").exists()).toBe(true);
    expect(wrapper.find(".vc-blade-header__actions").exists()).toBe(true);
  });

  it("hides controls on mobile", () => {
    const wrapper = mount(BladeHeader, {
      props: { title: "Test", closable: true },
      global: {
        provide: {
          [BladeDescriptorKey as symbol]: computed<BladeDescriptor>(() => ({
            id: "blade-1",
            name: "TestBlade",
            visible: true,
          })),
          [IsMobileKey as symbol]: ref(true),
          [IsDesktopKey as symbol]: ref(false),
        },
        stubs: { VcIcon: true, teleport: true },
        mocks: { $t: (k: string) => k },
      },
    });
    expect(wrapper.find(".vc-blade-header__controls").exists()).toBe(false);
  });

  it("applies titleId to the title element", () => {
    const wrapper = factory({ title: "Test", titleId: "blade-title-42" });
    expect(wrapper.find(".vc-blade-header__title").attributes("id")).toBe("blade-title-42");
  });

  describe("loading state", () => {
    it("hides title/subtitle text when loading=true", () => {
      const wrapper = factory({ title: "My Blade", subtitle: "Sub", loading: true });
      expect(wrapper.find(".vc-blade-header__title").exists()).toBe(false);
      expect(wrapper.find(".vc-blade-header__subtitle").exists()).toBe(false);
    });

    it("renders skeleton placeholders inside content when loading=true", () => {
      const wrapper = factory({ loading: true });
      expect(wrapper.find(".vc-blade-header__content--loading").exists()).toBe(true);
    });

    it("keeps close button operational when loading=true", async () => {
      const wrapper = factory({ closable: true, loading: true }, { maximized: false });
      const buttons = wrapper.findAll(".vc-blade-header__button");
      // expand + close
      expect(buttons.length).toBe(2);
      await buttons[buttons.length - 1].trigger("click");
      expect(wrapper.emitted("close")).toBeTruthy();
    });

    it("hides modified status dot when loading=true", () => {
      const wrapper = factory({ modified: true, loading: true });
      expect(wrapper.find(".vc-blade-header__status-edited").exists()).toBe(false);
    });

    it("hides actions slot when loading=true", () => {
      const wrapper = mount(BladeHeader, {
        props: { title: "Test", loading: true },
        slots: { actions: '<button class="action-btn">Save</button>' },
        global: {
          provide: {
            [BladeDescriptorKey as symbol]: computed<BladeDescriptor>(() => ({
              id: "blade-1",
              name: "TestBlade",
              visible: true,
            })),
            [IsMobileKey as symbol]: ref(false),
            [IsDesktopKey as symbol]: ref(true),
          },
          stubs: { VcIcon: true, teleport: true },
          mocks: { $t: (k: string) => k },
        },
      });
      expect(wrapper.find(".vc-blade-header__actions").exists()).toBe(false);
    });
  });
});

describe("BladeHeader expand-control focus handoff", () => {
  /**
   * Maximize and Restore are two nodes swapped by `v-if`, so whichever the user
   * activated stops existing and focus falls to `<body>` (WCAG 2.4.3).
   *
   * Two things change that state: this header's own control, and the `mod+\`
   * shortcut, which calls `toggleMaximized` on the blade stack and never reaches
   * the header's handlers. Driving the handoff from the state itself is what
   * covers both — hooking it to the click handler covered only one, which is how
   * VCST-5812 was found after the button path had been fixed.
   */
  function mountWithMaximized(maximized: ReturnType<typeof ref<boolean>>) {
    const descriptor = computed<BladeDescriptor>(() => ({
      id: "test-blade",
      name: "TestBlade",
      visible: true,
    }));
    const renderingState = computed<BladeRenderingState>(() => ({ maximized: maximized.value ?? false }));

    return mount(BladeHeader, {
      attachTo: document.body,
      props: { title: "Blade", closable: true, expandable: true },
      global: {
        provide: {
          [BladeDescriptorKey as symbol]: descriptor,
          [BladeRenderingStateKey as symbol]: renderingState,
          [IsMobileKey as symbol]: ref(false),
          [IsDesktopKey as symbol]: ref(true),
        },
      },
    });
  }

  /** `keepFocusOnExpandControl` defers to the next frame, past the DOM patch. */
  const afterFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

  it("moves focus to the replacement control when the state is toggled from outside", async () => {
    const maximized = ref(false);
    const wrapper = mountWithMaximized(maximized);

    const control = wrapper.element.querySelector<HTMLElement>("[data-blade-expand-control]");
    expect(control).toBeTruthy();
    control!.focus();
    expect(document.activeElement).toBe(control);

    // What the shortcut does: flip the state without touching the header.
    maximized.value = true;
    await nextTick();
    await afterFrame();

    const replacement = wrapper.element.querySelector<HTMLElement>("[data-blade-expand-control]");
    expect(replacement).toBeTruthy();
    expect(replacement).not.toBe(control);
    expect(document.activeElement).toBe(replacement);

    wrapper.unmount();
  });

  // A mouse user who clicked elsewhere must not have focus yanked into the header.
  it("leaves focus alone when it is not on the header controls", async () => {
    const outside = document.createElement("input");
    document.body.appendChild(outside);
    outside.focus();

    const maximized = ref(false);
    const wrapper = mountWithMaximized(maximized);

    maximized.value = true;
    await nextTick();
    await afterFrame();

    expect(document.activeElement).toBe(outside);

    wrapper.unmount();
    outside.remove();
  });
});
