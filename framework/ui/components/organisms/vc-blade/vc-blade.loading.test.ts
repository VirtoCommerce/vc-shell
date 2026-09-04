import { describe, expect, it, vi, beforeEach } from "vitest";
import { computed, defineComponent, h, nextTick, provide, ref } from "vue";
import { mount } from "@vue/test-utils";
import VcBlade from "@ui/components/organisms/vc-blade/vc-blade.vue";
import { BladeBackButtonKey, ToolbarServiceKey, WidgetServiceKey } from "@framework/injection-keys";
import { BladeStackKey, BladeMessagingKey, BladeDescriptorKey } from "@core/blade-navigation/types";
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

const loading = ref(false);
const param = ref<string | undefined>("order-1");

function mountBlade() {
  const Wrapper = defineComponent({
    setup() {
      provide(BladeBackButtonKey, null as never);
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
        setBladeTitle: vi.fn(),
      } as never);
      provide(BladeMessagingKey, { callParent: async () => undefined, onParentCall: () => () => {} } as never);
      provide(
        BladeDescriptorKey,
        computed<BladeDescriptor>(() => ({ id: "b", name: "TestBlade", visible: true, param: param.value }) as never),
      );

      return () => h(VcBlade as never, { loading: loading.value, title: "Order" }, { default: () => h("div", "body") });
    },
  });

  return mount(Wrapper, {
    global: { mocks: { $t: (k: string) => k }, stubs: { VcIcon: true, BladeHeader: true, BladeToolbar: true } },
  });
}

/** Let a frame go by, which is how the blade decides whether content was ever painted. */
const frame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

describe("VcBlade loading treatment", () => {
  beforeEach(() => {
    loading.value = false;
    param.value = "order-1";
  });

  const overlay = (w: ReturnType<typeof mountBlade>) => w.find(".vc-blade__busy").exists();

  it("shows the busy overlay for a load that follows a completed one", async () => {
    const w = mountBlade();
    loading.value = true;
    await nextTick();
    expect(overlay(w)).toBe(false);

    loading.value = false;
    await nextTick();
    await frame();

    loading.value = true;
    await nextTick();
    await frame();

    expect(overlay(w)).toBe(true);
    w.unmount();
  });

  /**
   * A page that loads in two steps — here the order details blade, which fetches its
   * state machines and then the order — drops `loading` between them. Nothing has
   * rendered at that point, so treating the gap as "content exists" left the real
   * fetch showing an overlay over an empty blade instead of skeletons.
   */
  it("keeps showing skeletons when a second load starts before anything was painted", async () => {
    const w = mountBlade();
    loading.value = true;
    await nextTick();

    // The gap between the two awaits: shorter than a frame, measured at under 8ms
    // against the running app.
    loading.value = false;
    await nextTick();
    loading.value = true;
    await nextTick();
    await frame();

    expect(overlay(w)).toBe(false);
    w.unmount();
  });

  it("still treats a different entity in the same blade as having nothing rendered", async () => {
    const w = mountBlade();
    loading.value = true;
    await nextTick();
    loading.value = false;
    await nextTick();
    await frame();

    param.value = "order-2";
    loading.value = true;
    await nextTick();
    await frame();

    expect(overlay(w)).toBe(false);
    w.unmount();
  });
});
