/**
 * Unit tests for vc-app (VcApp) component.
 *
 * This is the root shell component. Tests verify rendering states,
 * service provision, and key prop behavior. All heavy composables
 * and sub-components are mocked.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { ref, defineComponent, nextTick, h } from "vue";
import VcApp from "./vc-app.vue";
import { AppRootElementKey, BladeRoutesKey, ModulesLoadErrorKey, IsMobileKey, IsDesktopKey } from "@framework/injection-keys";
import { BladeStackKey, BladeMessagingKey } from "@core/blade-navigation/types";

// ============================================================================
// Mocks
// ============================================================================

// Track what useShellBootstrap received
const mockBootstrapArgs = vi.fn();

vi.mock("@ui/components/organisms/vc-app/composables/useShellBootstrap", () => ({
  useShellBootstrap: (opts: unknown) => {
    mockBootstrapArgs(opts);
  },
}));

const mockIsAppReady = ref(false);
const mockIsAuthenticated = ref(false);
const mockAppsList = ref([]);
const mockSwitchApp = vi.fn();

vi.mock("@ui/components/organisms/vc-app/composables/useShellLifecycle", () => ({
  useShellLifecycle: () => ({
    isAppReady: mockIsAppReady,
    isAuthenticated: mockIsAuthenticated,
    appsList: mockAppsList,
    switchApp: mockSwitchApp,
  }),
}));

const mockHandleMenuItemClick = vi.fn();
const mockOpenRoot = vi.fn();

vi.mock("@ui/components/organisms/vc-app/composables/useShellNavigation", () => ({
  useShellNavigation: () => ({
    handleMenuItemClick: mockHandleMenuItemClick,
    openRoot: mockOpenRoot,
  }),
}));

vi.mock("@core/composables/useSidebarState", () => ({
  provideSidebarState: () => ({
    isExpanded: ref(true),
    toggle: vi.fn(),
    collapse: vi.fn(),
    expand: vi.fn(),
  }),
}));

vi.mock("@ui/components/organisms/vc-app/_internal/app-bar/composables/useAppBarState", () => ({
  provideAppBarState: vi.fn(),
}));

vi.mock("@core/utilities", () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock("vue-router", () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({
    getRoutes: () => [],
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

vi.mock("@core/notifications/notification", () => ({
  notification: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

// Stub sub-components
vi.mock("@ui/components/organisms/vc-app/_internal/layouts/DesktopLayout.vue", () => ({
  default: defineComponent({
    name: "DesktopLayout",
    template:
      "<div class='mock-desktop-layout'><slot /><slot name='app-hub' /><slot name='menu' /><slot name='sidebar-header' /><slot name='sidebar-footer' /></div>",
  }),
}));

vi.mock("@ui/components/organisms/vc-app/_internal/layouts/MobileLayout.vue", () => ({
  default: defineComponent({
    name: "MobileLayout",
    template: "<div class='mock-mobile-layout'><slot /></div>",
  }),
}));

vi.mock("@shell/_internal/popup", () => ({
  VcPopupContainer: defineComponent({
    name: "VcPopupContainer",
    template: "<div class='mock-popup-container' />",
  }),
}));

vi.mock("@core/plugins/ai-agent", () => ({
  VcAiAgentPanel: defineComponent({
    name: "VcAiAgentPanel",
    template: "<div class='mock-ai-panel' />",
  }),
  provideAiAgentService: vi.fn(),
}));

// ============================================================================
// Helpers
// ============================================================================

const isMobileRef = ref(false);
const isDesktopRef = ref(true);

const VcLoadingStub = defineComponent({
  name: "VcLoading",
  props: ["active"],
  template: "<div class='mock-vc-loading' v-if='active'>Loading...</div>",
});

const VcBladeNavigationStub = defineComponent({
  name: "VcBladeNavigation",
  template: "<div class='mock-blade-nav' />",
});

function mountApp(propsOverride: Record<string, unknown> = {}) {
  return mount(VcApp, {
    props: {
      isReady: false,
      ...propsOverride,
    },
    global: {
      provide: {
        [BladeRoutesKey as symbol]: [],
        [ModulesLoadErrorKey as symbol]: ref(false),
        [BladeStackKey as symbol]: { blades: ref([]) },
        [BladeMessagingKey as symbol]: { on: vi.fn(), off: vi.fn() },
        [IsMobileKey as symbol]: isMobileRef,
        [IsDesktopKey as symbol]: isDesktopRef,
        aiAgentConfig: undefined,
        aiAgentAddGlobalToolbarButton: true,
      },
      components: {
        VcLoading: VcLoadingStub,
        VcBladeNavigation: VcBladeNavigationStub,
      },
    },
  });
}

// ============================================================================
// Tests
// ============================================================================

describe("vc-app", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAppReady.value = false;
    mockIsAuthenticated.value = false;
    isMobileRef.value = false;
    isDesktopRef.value = true;
  });

  it("shows loading state when app is not ready", () => {
    const wrapper = mountApp({ isReady: false });
    // When isAppReady is false, the loader is shown, not the .vc-app shell
    expect(wrapper.find(".vc-app").exists()).toBe(false);
    // VcLoading is rendered (registered as global component)
    expect(wrapper.findComponent({ name: "VcLoading" }).exists()).toBe(true);
  });

  it("shows app shell when app is ready", async () => {
    mockIsAppReady.value = true;
    const wrapper = mountApp({ isReady: true });
    await nextTick();
    expect(wrapper.find(".vc-app").exists()).toBe(true);
    expect(wrapper.find(".mock-vc-loading").exists()).toBe(false);
  });

  it("renders app root ref element when ready", async () => {
    mockIsAppReady.value = true;
    const wrapper = mountApp({ isReady: true });
    await nextTick();
    // The app root element has a ref="appRootRef" which is provided via AppRootElementKey
    const appEl = wrapper.find(".vc-app");
    expect(appEl.exists()).toBe(true);
    // The ref attribute is bound on the .vc-app div
    expect(appEl.element).toBeInstanceOf(HTMLElement);
  });

  it("renders workspace with blade navigation when authenticated", async () => {
    mockIsAppReady.value = true;
    mockIsAuthenticated.value = true;
    const wrapper = mountApp({ isReady: true });
    await nextTick();
    expect(wrapper.find(".vc-app__workspace").exists()).toBe(true);
    expect(wrapper.find(".mock-blade-nav").exists()).toBe(true);
  });

  it("does not render workspace when not authenticated", async () => {
    mockIsAppReady.value = true;
    mockIsAuthenticated.value = false;
    const wrapper = mountApp({ isReady: true });
    await nextTick();
    expect(wrapper.find(".vc-app__workspace").exists()).toBe(false);
  });

  it("renders popup container when ready", async () => {
    mockIsAppReady.value = true;
    const wrapper = mountApp({ isReady: true });
    await nextTick();
    expect(wrapper.find(".mock-popup-container").exists()).toBe(true);
  });

  it("calls useShellBootstrap with correct options", () => {
    mountApp({ isReady: true });
    expect(mockBootstrapArgs).toHaveBeenCalledWith(
      expect.objectContaining({
        isEmbedded: false,
        internalRoutes: expect.anything(),
      }),
    );
  });

  it("renders desktop layout when ready", async () => {
    mockIsAppReady.value = true;
    const wrapper = mountApp({ isReady: true });
    await nextTick();
    expect(wrapper.find(".mock-desktop-layout").exists()).toBe(true);
  });

  it("adds mobile class when isMobile is true", async () => {
    mockIsAppReady.value = true;
    isMobileRef.value = true;
    isDesktopRef.value = false;
    const wrapper = mountApp({ isReady: true });
    await nextTick();
    expect(wrapper.find(".vc-app--mobile").exists()).toBe(true);
  });
});
