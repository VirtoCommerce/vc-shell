import { describe, expect, it, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { mount } from "@vue/test-utils";

const mockGetButtons = ref<Record<string, unknown>[]>([]);
const mockCurrentAction = ref<Record<string, unknown> | undefined>(undefined);
const mockToggleAction = vi.fn();
const mockHideAllActions = vi.fn();
const mockIsAnyActionVisible = ref(false);

vi.mock("@core/composables/useAppBarMobileButtons", () => ({
  useAppBarMobileButtons: () => ({
    getButtons: mockGetButtons,
  }),
}));

vi.mock("@ui/components/organisms/vc-app/_internal/app-bar/composables/useAppBarMobileActions", () => ({
  useAppBarMobileActions: () => ({
    currentAction: mockCurrentAction,
    toggleAction: mockToggleAction,
    hideAllActions: mockHideAllActions,
    isAnyActionVisible: mockIsAnyActionVisible,
  }),
}));

vi.mock("vue-router", () => ({
  useRoute: () => ({ fullPath: ref("/") }),
}));

import AppBarMobileActions from "./AppBarMobileActions.vue";

function mountActions(props: Record<string, unknown> = {}) {
  return mount(AppBarMobileActions, {
    props: {
      isSidebarMode: false,
      expanded: false,
      ...props,
    },
    global: {
      mocks: {
        $isMobile: ref(true),
      },
      stubs: {
        VcButton: {
          name: "VcButton",
          props: ["icon", "iconSize", "text"],
          template: '<button class="vc-button-stub" @click="$emit(\'click\')"><slot /></button>',
        },
        VcSidebar: {
          name: "VcSidebar",
          props: ["modelValue", "position", "size", "draggable", "dragHandle", "closeButton", "inset"],
          template: '<div class="vc-sidebar-stub" v-if="modelValue"><slot /></div>',
        },
      },
    },
  });
}

describe("AppBarMobileActions", () => {
  beforeEach(() => {
    mockGetButtons.value = [];
    mockCurrentAction.value = undefined;
    mockIsAnyActionVisible.value = false;
    vi.clearAllMocks();
  });

  it("renders root element only on mobile", () => {
    const wrapper = mountActions();
    expect(wrapper.find(".app-bar-mobile-actions").exists()).toBe(true);
  });

  it("does not render when $isMobile is false", () => {
    const wrapper = mount(AppBarMobileActions, {
      props: { isSidebarMode: false, expanded: false },
      global: {
        mocks: { $isMobile: ref(false) },
        stubs: {
          VcButton: { template: "<button />" },
          VcSidebar: { template: "<div />" },
        },
      },
    });
    expect(wrapper.find(".app-bar-mobile-actions").exists()).toBe(false);
  });

  it("renders buttons for each visible item", () => {
    mockGetButtons.value = [
      { id: "b1", icon: "lucide-bell", isVisible: true },
      { id: "b2", icon: "lucide-settings", isVisible: true },
    ];

    const wrapper = mountActions();
    expect(wrapper.findAll(".app-bar-mobile-actions__button-wrap")).toHaveLength(2);
  });

  it("hides button when isVisible is false", () => {
    mockGetButtons.value = [{ id: "b1", icon: "lucide-bell", isVisible: false }];

    const wrapper = mountActions();
    expect(wrapper.findAll(".vc-button-stub")).toHaveLength(0);
  });

  it("shows badge when button badge is truthy", () => {
    mockGetButtons.value = [{ id: "b1", icon: "lucide-bell", isVisible: true, badge: true }];

    const wrapper = mountActions();
    expect(wrapper.find(".app-bar-mobile-actions__badge").exists()).toBe(true);
  });

  it("hides badge when button badge is undefined", () => {
    mockGetButtons.value = [{ id: "b1", icon: "lucide-bell", isVisible: true }];

    const wrapper = mountActions();
    expect(wrapper.find(".app-bar-mobile-actions__badge").exists()).toBe(false);
  });

  it("applies active class when button matches currentAction", () => {
    mockGetButtons.value = [{ id: "b1", icon: "lucide-bell", isVisible: true }];
    mockCurrentAction.value = { id: "b1" };

    const wrapper = mountActions();
    expect(wrapper.find(".app-bar-mobile-actions__button--active").exists()).toBe(true);
  });

  it("calls toggleAction on button click", async () => {
    mockGetButtons.value = [{ id: "b1", icon: "lucide-bell", isVisible: true }];

    const wrapper = mountActions();
    await wrapper.find(".vc-button-stub").trigger("click");

    expect(mockToggleAction).toHaveBeenCalledWith("b1");
  });
});
