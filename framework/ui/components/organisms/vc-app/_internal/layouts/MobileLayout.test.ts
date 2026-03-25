import { beforeEach, describe, expect, it, vi } from "vitest";
import { computed, defineComponent, h, nextTick, ref } from "vue";
import { mount } from "@vue/test-utils";
import MobileLayout from "@ui/components/organisms/vc-app/_internal/layouts/MobileLayout.vue";

const sidebarState = {
  isMenuOpen: ref(false),
  openMenu: vi.fn(() => {
    sidebarState.isMenuOpen.value = true;
  }),
  closeMenu: vi.fn(() => {
    sidebarState.isMenuOpen.value = false;
  }),
};

const blades = ref([{ id: "workspace", name: "Dashboard", title: "Dashboard", visible: true }] as unknown[]);
const activeBlade = computed(() => blades.value[blades.value.length - 1] as Record<string, unknown> | undefined);
const widgetItems = ref<Record<string, unknown>[]>([]);

vi.mock("@core/composables/useSidebarState", () => ({
  useSidebarState: () => sidebarState,
}));

vi.mock("@core/composables", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@core/composables")>();

  return {
    ...actual,
    useAppBarWidget: () => ({
      items: widgetItems,
    }),
  };
});

vi.mock("@core/blade-navigation", () => ({
  useBladeStack: () => ({
    blades,
    activeBlade,
  }),
}));

vi.mock("@shell/components/user-dropdown-button", () => ({
  UserDropdownButton: defineComponent({
    name: "UserDropdownButton",
    setup() {
      return () => h("div", { class: "stub-user-dropdown" });
    },
  }),
}));

const SidebarHeaderStub = defineComponent({
  name: "SidebarHeader",
  setup(_, { slots }) {
    return () => h("div", { class: "stub-sidebar-header" }, slots.actions?.());
  },
});

const MenuSidebarStub = defineComponent({
  name: "MenuSidebar",
  setup(_, { slots }) {
    return () => h("div", { class: "stub-menu-sidebar" }, [slots.navmenu?.(), slots["user-dropdown"]?.()]);
  },
});

const AppHubContentStub = defineComponent({
  name: "AppHubContent",
  setup(_, { slots }) {
    return () => h("div", { class: "stub-hub" }, slots.applications?.({ appsList: [], switchApp: vi.fn() }));
  },
});

const VcAppMenuStub = defineComponent({
  name: "VcAppMenu",
  setup() {
    return () => h("div", { class: "stub-menu" });
  },
});

const VcScrollableContainerStub = defineComponent({
  name: "VcScrollableContainer",
  setup(_, { slots }) {
    return () => h("div", { class: "stub-scroll" }, slots.default?.());
  },
});

function mountLayout(props?: Record<string, unknown>) {
  return mount(MobileLayout, {
    props,
    global: {
      mocks: {
        $t: (key: string) => key,
      },
      stubs: {
        SidebarHeader: SidebarHeaderStub,
        AppBarMobileActions: true,
        MenuSidebar: MenuSidebarStub,
        AppHubContent: AppHubContentStub,
        VcAppMenu: VcAppMenuStub,
        VcScrollableContainer: VcScrollableContainerStub,
      },
    },
  });
}

describe("MobileLayout", () => {
  beforeEach(() => {
    sidebarState.isMenuOpen.value = false;
    widgetItems.value = [];
    vi.clearAllMocks();
  });

  it("renders menu only when hub tab is unavailable", () => {
    const wrapper = mountLayout({
      appsList: [],
    });

    expect(wrapper.find(".mobile-layout__tabs").exists()).toBe(false);
    expect(wrapper.find(".stub-menu").exists()).toBe(true);
    expect(wrapper.find(".stub-hub").exists()).toBe(false);
  });

  it("renders hub only when menu is disabled", () => {
    const wrapper = mountLayout({
      disableMenu: true,
      appsList: [],
    });

    expect(wrapper.find(".mobile-layout__tabs").exists()).toBe(false);
    expect(wrapper.find(".stub-menu").exists()).toBe(false);
    expect(wrapper.find(".stub-hub").exists()).toBe(true);
  });

  it("shows tabs when hub content exists and resets active tab when sidebar closes", async () => {
    sidebarState.isMenuOpen.value = true;
    widgetItems.value = [{ id: "notifications", badge: true }];

    const wrapper = mountLayout({
      appsList: [],
    });

    const tabButtons = wrapper.findAll(".mobile-layout__tab");
    expect(tabButtons).toHaveLength(2);
    expect(tabButtons[0].classes()).toContain("mobile-layout__tab--active");

    await tabButtons[1].trigger("click");
    expect(tabButtons[1].classes()).toContain("mobile-layout__tab--active");

    sidebarState.isMenuOpen.value = false;
    await nextTick();

    expect(tabButtons[0].classes()).toContain("mobile-layout__tab--active");
  });
});
