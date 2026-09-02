import { describe, expect, it, vi } from "vitest";
import { computed, defineComponent, h, nextTick, provide, ref } from "vue";
import { mount } from "@vue/test-utils";
import VcBlade from "@ui/components/organisms/vc-blade/vc-blade.vue";
import { BladeBackButtonKey, ToolbarServiceKey, WidgetServiceKey } from "@framework/injection-keys";
import {
  BladeStackKey,
  BladeMessagingKey,
  BladeDescriptorKey,
  BladeRenderingStateKey,
} from "@core/blade-navigation/types";
import type { BladeDescriptor } from "@core/blade-navigation/types";
import { createToolbarService } from "@core/services/toolbar-service";
import { createWidgetService } from "@core/services/widget-service";

vi.mock("@shell/_internal/blade-navigation/plugin-v2", () => ({
  bladeStackInstance: {
    blades: ref([]),
    workspace: ref(undefined),
    activeBlade: ref(null),
    openBlade: vi.fn(),
    closeBlade: vi.fn(),
    replaceCurrentBlade: vi.fn(),
    registerBeforeClose: vi.fn(),
    setBladeError: vi.fn(),
    clearBladeError: vi.fn(),
    setBladeTitle: vi.fn(),
  },
  bladeMessagingInstance: { callParent: vi.fn(), exposeToChildren: vi.fn() },
  bladeRegistryInstance: undefined,
  bladeNavigationInstance: {
    router: { currentRoute: ref({ path: "/", params: {}, query: {} }), push: vi.fn(), replace: vi.fn() },
  },
}));
vi.mock("@core/blade-navigation/utils/urlSync", () => ({
  buildUrlFromStack: vi.fn().mockReturnValue("/"),
  createUrlSync: vi.fn().mockReturnValue({ syncUrlPush: vi.fn(), syncUrlReplace: vi.fn() }),
  getTenantPrefix: vi.fn().mockReturnValue(""),
}));

const maximized = ref(false);

function mountBlade() {
  const Wrapper = defineComponent({
    setup() {
      provide(BladeBackButtonKey, null as never);
      provide(ToolbarServiceKey, createToolbarService());
      provide(WidgetServiceKey, createWidgetService());
      provide(BladeRenderingStateKey, computed(() => ({ maximized: maximized.value })) as never);
      provide(BladeStackKey, {
        blades: ref([]),
        activeBlade: ref(null),
        openBlade: async () => {},
        closeBlade: async () => {},
        closeSelf: async () => {},
        closeChildren: async () => {},
        replaceBlade: async () => {},
        setBladeTitle: vi.fn(),
      } as never);
      provide(BladeMessagingKey, { callParent: async () => undefined, onParentCall: () => () => {} } as never);
      provide(
        BladeDescriptorKey,
        computed<BladeDescriptor>(() => ({ id: "b", name: "TestBlade", visible: true }) as never),
      );

      return () => h(VcBlade as never, { title: "Order" }, { default: () => h("div", "body") });
    },
  });

  return mount(Wrapper, {
    attachTo: document.body,
    global: { mocks: { $t: (k: string) => k }, stubs: { VcIcon: true, BladeHeader: true, BladeToolbar: true } },
  });
}

/**
 * Maximizing makes the regions the blade covers inert, and the browser drops focus
 * from a node that becomes inert. jsdom does not implement that rule — the same trap
 * as `disabled` — so these tests blur the origin themselves and assert what the blade
 * is responsible for: repairing focus that is already loose. The browser side is
 * covered by the live A/B on the ticket.
 */
describe("VcBlade focus across maximize", () => {
  it("takes focus when maximizing left it nowhere", async () => {
    const navButton = document.createElement("button");
    document.body.appendChild(navButton);
    navButton.focus();
    const w = mountBlade();
    try {
      // Let the mount-time repair run and decline first — focus is still held here.
      // Without this the test passes on that repair rather than on the maximize.
      await nextTick();
      await nextTick();
      expect(document.activeElement).toBe(navButton);

      // What `inert` does to the sidebar control the user was on.
      navButton.blur();
      maximized.value = true;
      await nextTick();
      await nextTick();

      expect(document.activeElement).toBe(w.find(".vc-blade").element);
    } finally {
      maximized.value = false;
      w.unmount();
      navButton.remove();
    }
  });

  it("recovers on restore too, so the user is not stranded", async () => {
    const w = mountBlade();
    try {
      maximized.value = true;
      await nextTick();
      (document.activeElement as HTMLElement | null)?.blur?.();

      maximized.value = false;
      await nextTick();
      await nextTick();

      expect(document.activeElement).toBe(w.find(".vc-blade").element);
    } finally {
      maximized.value = false;
      w.unmount();
    }
  });

  // The header hands focus between its own two expand controls. This must not
  // compete with that, nor yank focus from a user who is somewhere live.
  it("leaves focus alone when something still holds it", async () => {
    const elsewhere = document.createElement("button");
    document.body.appendChild(elsewhere);
    const w = mountBlade();
    try {
      elsewhere.focus();
      maximized.value = true;
      await nextTick();
      await nextTick();

      expect(document.activeElement).toBe(elsewhere);
    } finally {
      maximized.value = false;
      w.unmount();
      elsewhere.remove();
    }
  });
});
