import { afterEach, describe, expect, it, vi } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import axe from "axe-core";
import { createI18n } from "vue-i18n";
import { ref } from "vue";
import { createRouter, createMemoryHistory } from "vue-router";
import VcBladeNavigation from "@shell/_internal/blade-navigation/components/vc-blade-navigation/vc-blade-navigation-new.vue";

// Mock blade-navigation composables and utils to avoid full plugin setup
vi.mock("@core/blade-navigation/useBladeStack", () => ({
  useBladeStack: () => ({
    blades: ref([]),
    activeBlade: ref(null),
    openBlade: vi.fn().mockResolvedValue(undefined),
    closeBlade: vi.fn().mockResolvedValue(false),
    replaceCurrentBlade: vi.fn().mockResolvedValue(undefined),
    registerBeforeClose: vi.fn(),
    setBladeError: vi.fn(),
    clearBladeError: vi.fn(),
  }),
}));

vi.mock("@core/blade-navigation/useBladeMessaging", () => ({
  useBladeMessaging: () => ({
    callParent: vi.fn().mockResolvedValue(undefined),
    exposeToChildren: vi.fn(),
  }),
}));

vi.mock("@core/blade-navigation/utils/urlSync", () => ({
  buildUrlFromStack: vi.fn().mockReturnValue("/"),
  createUrlSync: vi.fn().mockReturnValue({ syncUrlReplace: vi.fn(), stop: vi.fn() }),
  getTenantPrefix: vi.fn().mockReturnValue(""),
}));

vi.mock("@core/composables/useBreadcrumbs", () => ({
  useBreadcrumbs: () => ({
    breadcrumbs: ref([]),
    push: vi.fn(),
    remove: vi.fn(),
  }),
}));

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      COMPONENTS: {
        BLADE_NAVIGATION: {
          ARIA_LABEL: "Blade navigation",
        },
      },
    },
  },
});

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: "/", component: { template: "<div>Home</div>" } }],
});

describe("VcBladeNavigation a11y", () => {
  let wrapper: VueWrapper;

  afterEach(() => {
    wrapper?.unmount();
  });

  const mountNav = () => {
    wrapper = mount(VcBladeNavigation as any, {
      global: {
        plugins: [i18n, router],
        stubs: {
          RouterView: true,
          VcBladeSlot: true,
        },
        config: {
          globalProperties: {
            $isMobile: ref(false),
            $isDesktop: ref(true),
          },
        },
      },
      attachTo: document.body,
    });
    return wrapper;
  };

  it("has no a11y violations", async () => {
    const w = mountNav();
    const results = await axe.run(w.element as HTMLElement);
    expect(results).toHaveNoViolations();
  });

  it("has role='region' with aria-label", () => {
    const w = mountNav();
    const region = w.find('[role="region"]');
    expect(region.exists()).toBe(true);
    expect(region.attributes("aria-label")).toBe("Blade navigation");
  });
});
