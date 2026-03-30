import { computed, defineComponent, h, provide, ref } from "vue";
import { mount } from "@vue/test-utils";
import { useBlade } from "./index";
import { BladeBannersKey, BladeDescriptorKey, BladeStackKey, BladeMessagingKey } from "@core/blade-navigation/types";
import type { IBladeBanner, IBladeStack, IBladeMessaging } from "@core/blade-navigation/types";

// Minimal stubs for required injections
const stubStack: IBladeStack = {
  workspace: ref(undefined),
  blades: ref([]),
  activeBlade: ref(undefined),
  openWorkspace: async () => {},
  openBlade: async () => {},
  closeBlade: async () => false,
  replaceCurrentBlade: async () => {},
  coverCurrentBlade: async () => {},
  closeChildren: async () => {},
  registerBeforeClose: () => {},
  unregisterBeforeClose: () => {},
  setBladeError: () => {},
  clearBladeError: () => {},
  setBladeTitle: () => {},
  _restoreStack: () => {},
} as unknown as IBladeStack;

const stubMessaging: IBladeMessaging = {
  exposeToChildren: () => {},
  callParent: async () => undefined as any,
  cleanup: () => {},
} as unknown as IBladeMessaging;

function mountUseBlade(banners: ReturnType<typeof ref<IBladeBanner[]>>) {
  const descriptor = computed(() => ({
    id: "blade-1",
    name: "TestBlade",
    visible: true,
    parentId: undefined,
    param: undefined,
    options: undefined,
    query: undefined,
    error: undefined,
    title: undefined,
    url: undefined,
  }));

  let result: ReturnType<typeof useBlade>;

  const Inner = defineComponent({
    setup() {
      result = useBlade();
      return () => h("div");
    },
  });

  const Outer = defineComponent({
    setup() {
      provide(BladeStackKey, stubStack);
      provide(BladeMessagingKey, stubMessaging);
      provide(BladeDescriptorKey, descriptor);
      provide(BladeBannersKey, banners);
      return () => h(Inner);
    },
  });

  mount(Outer);
  return { result: result! };
}

describe("useBlade banner methods", () => {
  it("addBanner adds a banner and returns its id", () => {
    const banners = ref<IBladeBanner[]>([]);
    const { result } = mountUseBlade(banners);

    const id = result.addBanner({ variant: "info", message: "Hello" });

    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
    expect(banners.value).toHaveLength(1);
    expect(banners.value[0]).toMatchObject({
      id,
      variant: "info",
      message: "Hello",
      dismissible: false,
    });
  });

  it("addBanner defaults dismissible to false", () => {
    const banners = ref<IBladeBanner[]>([]);
    const { result } = mountUseBlade(banners);

    result.addBanner({ variant: "warning", message: "Warn" });

    expect(banners.value[0].dismissible).toBe(false);
  });

  it("addBanner preserves explicit dismissible: true", () => {
    const banners = ref<IBladeBanner[]>([]);
    const { result } = mountUseBlade(banners);

    result.addBanner({ variant: "danger", message: "Error", dismissible: true });

    expect(banners.value[0].dismissible).toBe(true);
  });

  it("addBanner stores render function", () => {
    const banners = ref<IBladeBanner[]>([]);
    const { result } = mountUseBlade(banners);

    const renderFn = () => h("span", "Custom content");
    result.addBanner({ variant: "info", render: renderFn });

    expect(banners.value[0].render).toBe(renderFn);
  });

  it("addBanner stores action", () => {
    const banners = ref<IBladeBanner[]>([]);
    const { result } = mountUseBlade(banners);

    const handler = vi.fn();
    result.addBanner({ variant: "success", message: "Done", action: { label: "Undo", handler } });

    expect(banners.value[0].action).toEqual({ label: "Undo", handler });
  });

  it("addBanner stores custom icon", () => {
    const banners = ref<IBladeBanner[]>([]);
    const { result } = mountUseBlade(banners);

    result.addBanner({ variant: "info", message: "Custom", icon: "lucide-star" });

    expect(banners.value[0].icon).toBe("lucide-star");
  });

  it("removeBanner removes a banner by id", () => {
    const banners = ref<IBladeBanner[]>([]);
    const { result } = mountUseBlade(banners);

    const id1 = result.addBanner({ variant: "info", message: "First" });
    const id2 = result.addBanner({ variant: "warning", message: "Second" });

    result.removeBanner(id1);

    expect(banners.value).toHaveLength(1);
    expect(banners.value[0].id).toBe(id2);
  });

  it("removeBanner is a no-op for unknown id", () => {
    const banners = ref<IBladeBanner[]>([]);
    const { result } = mountUseBlade(banners);

    result.addBanner({ variant: "info", message: "Stays" });
    result.removeBanner("nonexistent");

    expect(banners.value).toHaveLength(1);
  });

  it("clearBanners removes all non-system banners", () => {
    const banners = ref<IBladeBanner[]>([{ id: "sys-1", variant: "danger", message: "System error", _system: true }]);
    const { result } = mountUseBlade(banners);

    result.addBanner({ variant: "info", message: "Custom" });
    expect(banners.value).toHaveLength(2);

    result.clearBanners();

    expect(banners.value).toHaveLength(1);
    expect(banners.value[0].id).toBe("sys-1");
  });

  it("clearBanners is safe when no banners exist", () => {
    const banners = ref<IBladeBanner[]>([]);
    const { result } = mountUseBlade(banners);

    result.clearBanners();

    expect(banners.value).toHaveLength(0);
  });

  it("addBanner does not set _system flag", () => {
    const banners = ref<IBladeBanner[]>([]);
    const { result } = mountUseBlade(banners);

    result.addBanner({ variant: "info", message: "User banner" });

    expect(banners.value[0]._system).toBeUndefined();
  });
});
