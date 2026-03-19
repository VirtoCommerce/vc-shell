import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, provide, computed, ref } from "vue";
import { mount, VueWrapper } from "@vue/test-utils";
import axe from "axe-core";
import { createI18n } from "vue-i18n";
import VcBlade from "@ui/components/organisms/vc-blade/vc-blade.vue";
import { BladeInstanceKey, ToolbarServiceKey, WidgetServiceKey } from "@framework/injection-keys";
import { BladeStackKey, BladeMessagingKey, BladeDescriptorKey } from "@core/blade-navigation/types";
import { createToolbarService } from "@core/services/toolbar-service";
import { createWidgetService } from "@core/services/widget-service";
import type { IBladeInstance } from "@core/blade-navigation/types";

// useBladeNavigation reads module-level singletons from plugin-v2.
// Mock them so VcBlade's call to useBladeNavigation() succeeds without the full plugin.
vi.mock("@shell/_internal/blade-navigation/plugin-v2", () => ({
  bladeStackInstance: {
    blades: ref([]),
    workspace: ref(undefined),
    activeBlade: ref(null),
    openBlade: vi.fn().mockResolvedValue(undefined),
    closeBlade: vi.fn().mockResolvedValue(false),
    replaceCurrentBlade: vi.fn().mockResolvedValue(undefined),
    registerBeforeClose: vi.fn(),
    setBladeError: vi.fn(),
    clearBladeError: vi.fn(),
  },
  bladeMessagingInstance: {
    callParent: vi.fn().mockResolvedValue(undefined),
    exposeToChildren: vi.fn(),
  },
  bladeRegistryInstance: undefined,
  bladeNavigationInstance: {
    router: {
      currentRoute: ref({ path: "/", params: {}, query: {}, name: undefined }),
      push: vi.fn(),
      replace: vi.fn(),
    },
  },
}));

// Also mock urlSync to avoid router dependency in useBladeNavigation
vi.mock("@core/blade-navigation/utils/urlSync", () => ({
  buildUrlFromStack: vi.fn().mockReturnValue("/"),
  createUrlSync: vi.fn().mockReturnValue({ stop: vi.fn() }),
  getTenantPrefix: vi.fn().mockReturnValue(""),
}));

const i18n = createI18n({ legacy: false, locale: "en", messages: { en: {} } });

/**
 * VcBlade requires blade injection context. We wrap it in a parent component
 * that provides all required injection keys via provide/inject.
 */
function createBladeWrapper(bladeProps: Record<string, unknown> = {}) {
  const bladeInstance = computed<IBladeInstance>(() => ({
    id: "test-blade",
    error: null,
    expandable: false,
    maximized: false,
    navigation: undefined,
    breadcrumbs: undefined,
    param: undefined,
    options: undefined,
  }));

  return defineComponent({
    setup() {
      provide(BladeInstanceKey, bladeInstance);
      provide(ToolbarServiceKey, createToolbarService());
      provide(WidgetServiceKey, createWidgetService());
      provide(BladeStackKey, {
        blades: ref([]),
        activeBlade: ref(null),
        openBlade: async () => {},
        closeBlade: async () => {},
        closeSelf: async () => {},
        closeChildren: async () => {},
        replaceBlade: async () => {},
      } as any);
      provide(BladeMessagingKey, {
        callParent: async () => undefined,
        onParentCall: () => () => {},
      } as any);
      provide(BladeDescriptorKey, computed(() => ({
        id: "test-blade",
        index: 0,
        parentId: undefined,
      })) as any);

      return () => h(VcBlade as any, bladeProps);
    },
  });
}

describe("VcBlade a11y", () => {
  let wrapper: VueWrapper;

  afterEach(() => {
    wrapper?.unmount();
  });

  const mountBlade = (bladeProps: Record<string, unknown> = {}) => {
    const Wrapper = createBladeWrapper(bladeProps);
    wrapper = mount(Wrapper, {
      global: {
        plugins: [i18n],
        stubs: {
          VcIcon: true,
          BladeHeader: {
            // Provide a semantically valid header stub that supports :title-id prop
            // so aria-labelledby can be verified by axe and test assertions
            props: ["title", "titleId"],
            template: '<header><h2 :id="titleId">{{ title }}</h2><slot /><slot name="prepend" /><slot name="actions" /></header>',
          },
          BladeHeaderSkeleton: true,
          BladeToolbar: true,
          BladeToolbarSkeleton: true,
          BladeContentSkeleton: true,
          BladeStatusBanners: true,
          WidgetContainer: true,
          VcBreadcrumbs: true,
          VcButton: true,
          teleport: true,
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

  it("has no a11y violations in default state", async () => {
    const w = mountBlade({ title: "Test Blade", closable: true });
    const results = await axe.run(w.element as HTMLElement);
    expect(results).toHaveNoViolations();
  });

  it("has no a11y violations without closable", async () => {
    const w = mountBlade({ title: "Read-only Blade", closable: false });
    const results = await axe.run(w.element as HTMLElement);
    expect(results).toHaveNoViolations();
  });

  it("has role='region' with aria-labelledby when title is provided", async () => {
    const w = mountBlade({ title: "Test Blade" });
    // Wait for isInitializing to settle (nextTick in onMounted)
    await w.vm.$nextTick();
    await w.vm.$nextTick();
    const region = w.find('[role="region"]');
    expect(region.exists()).toBe(true);
    const labelledBy = region.attributes("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    // The referenced element should exist in the DOM
    const titleEl = w.find(`#${labelledBy}`);
    expect(titleEl.exists()).toBe(true);
  });

  it("falls back to aria-label when no title is provided", async () => {
    const w = mountBlade({});
    await w.vm.$nextTick();
    await w.vm.$nextTick();
    const region = w.find('[role="region"]');
    expect(region.exists()).toBe(true);
    expect(region.attributes("aria-label")).toBeTruthy();
    expect(region.attributes("aria-labelledby")).toBeUndefined();
  });
});
