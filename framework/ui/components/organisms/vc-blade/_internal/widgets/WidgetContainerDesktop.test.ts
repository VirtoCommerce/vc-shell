import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, markRaw, onMounted, ref } from "vue";
import { mount, type VueWrapper } from "@vue/test-utils";
import { WidgetServiceKey } from "@framework/injection-keys";
import { createWidgetService, type IWidget } from "@core/services/widget-service";
import { useWidgetTrigger } from "@core/composables/useBladeWidgets";
import { BladeDescriptorKey } from "@core/blade-navigation/types";
import WidgetContainerDesktop from "./WidgetContainerDesktop.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string, p?: Record<string, unknown>) => (p?.title ? `${k}:${p.title}` : k) }),
}));
vi.mock("@ui/composables/useTeleportTarget", () => ({ useTeleportTarget: () => ({ teleportTarget: "body" }) }));
vi.mock("sortablejs", () => ({ default: { create: () => ({ option: vi.fn(), destroy: vi.fn() }) } }));

const KEY = "VC_BLADE_WIDGETS_TESTBLADE";
const alert = (severity: "warning" | "error") => ({ id: "a", severity, text: "t" });

function make(n: number, extra: Record<string, Partial<IWidget>> = {}): IWidget[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `w${i + 1}`,
    title: `W${i + 1}`,
    headless: { icon: "lucide-bell" },
    ...extra[`w${i + 1}`],
  })) as IWidget[];
}

let wrapper: VueWrapper;
function mountContainer(widgets: IWidget[], bladeName = "testblade") {
  wrapper = mount(WidgetContainerDesktop, {
    props: { widgets, bladeId: "b", bladeName },
    attachTo: document.body,
    global: {
      provide: { [WidgetServiceKey as symbol]: { updateWidget: vi.fn() } },
      stubs: { Teleport: true },
      mocks: { $t: (k: string) => k },
    },
  });
  return wrapper;
}
const ids = (sel: string) => wrapper.findAll(`${sel} > [data-widget-id]`).map((e) => e.attributes("data-widget-id"));
const strip = () => ids("[data-widget-list=strip]");
const overflow = () => ids("[data-widget-list=overflow]");
const byLabel = (re: RegExp) =>
  wrapper.findAll("button").filter((b) => re.test(b.attributes("aria-label") ?? b.text()));

describe("WidgetContainerDesktop", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    wrapper?.unmount();
    document.documentElement.dir = "";
  });

  it("puts 5 widgets in the strip and the rest in the dropdown", () => {
    mountContainer(make(7));
    expect(strip()).toEqual(["w1", "w2", "w3", "w4", "w5"]);
    expect(overflow()).toEqual(["w6", "w7"]);
  });

  it("renders the chevron and Customize with 3 widgets", () => {
    mountContainer(make(3));
    const chevron = wrapper.find("button[aria-label$='MORE_WIDGETS']");
    expect(chevron.exists()).toBe(true);
    expect(chevron.attributes("aria-expanded")).toBe("false");
    expect(overflow()).toEqual([]);
    expect(wrapper.text()).toContain("CUSTOMIZE");
  });

  it("names hidden alerts in the chevron label", () => {
    mountContainer(make(7, { w7: { headless: { icon: "x", alerts: ref([alert("error")]) } as IWidget["headless"] } }));
    const chevron = wrapper.find(".vc-widget-container-desktop__more");
    expect(chevron.attributes("aria-label")).toBe("COMPONENTS.ORGANISMS.VC_BLADE.WIDGETS.MORE_WIDGETS_ALERTS");
  });

  it("hides Customize when the blade has no name", () => {
    mountContainer(make(3), "");
    expect(wrapper.text()).not.toContain("CUSTOMIZE");
  });

  it("shows the chevron dot and mounts an overflow widget while closed, alerted first", () => {
    const mounted = vi.fn();
    const Comp = defineComponent({
      setup() {
        onMounted(mounted);
        return () => h("button", "c");
      },
    });
    const widgets = make(7, {
      w7: { headless: { icon: "x", alerts: ref([alert("error")]) } as IWidget["headless"] },
    });
    widgets[5] = { id: "w6", title: "W6", component: Comp } as IWidget;
    mountContainer(widgets);
    expect(wrapper.find(".vc-widget-container-desktop__more-dot--danger").exists()).toBe(true);
    expect(mounted).toHaveBeenCalled();
    expect(overflow()).toEqual(["w7", "w6"]);
    expect(strip()).toEqual(["w1", "w2", "w3", "w4", "w5"]);
  });

  describe("edit mode", () => {
    async function edit(widgets = make(7)) {
      mountContainer(widgets);
      await wrapper.find("button[aria-label$='MORE_WIDGETS']").trigger("click");
      await byLabel(/\.CUSTOMIZE$/)[0].trigger("click");
    }

    it("minus moves a widget to the dropdown, plus moves it back", async () => {
      await edit();
      await byLabel(/REMOVE:W1/)[0].trigger("click");
      expect(strip()).toEqual(["w2", "w3", "w4", "w5"]);
      expect(overflow()).toContain("w1");
      await byLabel(/ADD:W1/)[0].trigger("click");
      expect(strip()).toContain("w1");
    });

    it("keeps focus on the moved widget's control after minus and plus", async () => {
      await edit();
      (byLabel(/REMOVE:W1/)[0].element as HTMLElement).focus();
      await byLabel(/REMOVE:W1/)[0].trigger("click");
      await wrapper.vm.$nextTick();
      expect(document.activeElement).toBe(byLabel(/ADD:W1/)[0].element);
      await byLabel(/ADD:W1/)[0].trigger("click");
      await wrapper.vm.$nextTick();
      expect(document.activeElement).toBe(byLabel(/REMOVE:W1/)[0].element);
    });

    it("disables plus at 5 and shows the hint", async () => {
      await edit();
      const plus = byLabel(/ADD:W6/)[0];
      expect(plus.attributes("disabled")).toBeDefined();
      expect(wrapper.text()).toContain("STRIP_FULL");
    });

    it("Done writes storage, Reset clears it", async () => {
      await edit();
      await byLabel(/REMOVE:W1/)[0].trigger("click");
      await byLabel(/\.DONE$/)[0].trigger("click");
      expect(JSON.parse(localStorage.getItem(KEY)!).strip).not.toContain("w1");
      await byLabel(/\.CUSTOMIZE$/)[0].trigger("click");
      await byLabel(/\.RESET$/)[0].trigger("click");
      expect(localStorage.getItem(KEY)).toBeNull();
    });

    it("does not run a widget click handler while editing", async () => {
      const onClick = vi.fn();
      await edit(make(7, { w1: { headless: { icon: "x", onClick } as IWidget["headless"] } }));
      await wrapper.find("[data-widget-id=w1] .vc-widget").trigger("click");
      expect(onClick).not.toHaveBeenCalled();
    });

    it("inverts the arrows under dir=rtl", async () => {
      document.documentElement.dir = "rtl";
      await edit();
      await wrapper
        .find("[data-widget-list=strip] > [data-widget-id=w2] .vc-widget")
        .trigger("keydown", { key: "ArrowRight" });
      expect(strip().slice(0, 2)).toEqual(["w2", "w1"]);
    });

    it("ArrowDown reorders inside the dropdown list", async () => {
      await edit();
      await wrapper
        .find("[data-widget-list=overflow] > [data-widget-id=w6] .vc-widget")
        .trigger("keydown", { key: "ArrowDown" });
      expect(overflow()).toEqual(["w7", "w6"]);
    });

    it("ArrowRight swaps the focused strip item with the next", async () => {
      await edit();
      await wrapper
        .find("[data-widget-list=strip] [data-widget-id=w1] .vc-widget")
        .trigger("keydown", { key: "ArrowRight" });
      expect(strip().slice(0, 2)).toEqual(["w2", "w1"]);
    });
  });

  it("commits exactly once on Escape and on chevron toggle", async () => {
    const spy = vi.spyOn(Storage.prototype, "setItem");
    const writes = () => spy.mock.calls.filter(([k]) => k === KEY).length;
    mountContainer(make(7));
    const chevron = () => wrapper.find("button[aria-label$='MORE_WIDGETS']");
    await chevron().trigger("click");
    await byLabel(/\.CUSTOMIZE$/)[0].trigger("click");
    await byLabel(/REMOVE:W1/)[0].trigger("click");
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(writes()).toBe(1);
    await chevron().trigger("click");
    await byLabel(/\.CUSTOMIZE$/)[0].trigger("click");
    await byLabel(/REMOVE:W2/)[0].trigger("click");
    await chevron().trigger("click");
    expect(writes()).toBe(2);
    spy.mockRestore();
  });

  it("restores focus inside its own container when two blades share widget ids", async () => {
    const other = mount(WidgetContainerDesktop, {
      props: { widgets: make(7), bladeId: "c", bladeName: "otherblade" },
      attachTo: document.body,
      global: {
        provide: { [WidgetServiceKey as symbol]: { updateWidget: vi.fn() } },
        stubs: { Teleport: true },
        mocks: { $t: (k: string) => k },
      },
    });
    // Mounted second, so a document-wide lookup would hit `other` first
    mountContainer(make(7));
    await wrapper.find("button[aria-label$='MORE_WIDGETS']").trigger("click");
    await byLabel(/\.CUSTOMIZE$/)[0].trigger("click");
    const item = wrapper.find("[data-widget-list=strip] > [data-widget-id=w1]");
    await item.find(".vc-widget").trigger("keydown", { key: "ArrowRight" });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(other.element.contains(document.activeElement)).toBe(false);
    expect(
      wrapper.find("[data-widget-list=strip] > [data-widget-id=w1]").element.contains(document.activeElement),
    ).toBe(true);
    other.unmount();
  });

  it("keeps component widget triggers live across Customize and Done (real service)", async () => {
    const instances: Record<string, { badge: ReturnType<typeof ref<number>>; mounted: number }> = {};
    const comp = (id: string) =>
      markRaw({
        setup() {
          const badge = ref(1);
          const rec = (instances[id] ??= { badge, mounted: 0 });
          rec.badge = badge;
          onMounted(() => rec.mounted++);
          useWidgetTrigger({ badge: badge as never });
          return () => h("button", String(badge.value));
        },
      });
    const service = createWidgetService();
    // w2 sits in the strip, w6 in the dropdown
    for (const w of make(7)) {
      const component = ["w2", "w6"].includes(w.id) ? comp(w.id) : undefined;
      service.registerWidget(component ? { id: w.id, title: w.title, component } : w, "blade");
    }
    wrapper = mount(WidgetContainerDesktop, {
      props: { widgets: service.getWidgets("blade"), bladeId: "b", bladeName: "testblade" },
      attachTo: document.body,
      global: {
        provide: { [WidgetServiceKey as symbol]: service, [BladeDescriptorKey as symbol]: ref({ id: "blade" }) },
        mocks: { $t: (k: string) => k },
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.find("button[aria-label$='MORE_WIDGETS']").trigger("click");
    await byLabel(/\.CUSTOMIZE$/)[0].trigger("click");
    await byLabel(/\.DONE$/)[0].trigger("click");
    await wrapper.vm.$nextTick();
    for (const id of ["w2", "w6"]) {
      expect(instances[id].mounted).toBe(1);
      instances[id].badge.value = 5;
      expect(service.getWidgets("blade").find((w) => w.id === id)!.trigger?.badge).toBe(5);
    }
  });

  it("runs a widget click handler outside edit mode", async () => {
    const onClick = vi.fn();
    mountContainer(make(2, { w1: { headless: { icon: "x", onClick } as IWidget["headless"] } }));
    await wrapper.find("[data-widget-id=w1] .vc-widget").trigger("click");
    expect(onClick).toHaveBeenCalled();
  });
});
