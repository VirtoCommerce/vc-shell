import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, markRaw, onMounted, ref } from "vue";
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { WidgetServiceKey } from "@framework/injection-keys";
import { createWidgetService, type IWidget } from "@core/services/widget-service";
import { useWidgetTrigger } from "@core/composables/useBladeWidgets";
import { BladeDescriptorKey } from "@core/blade-navigation/types";
import { VcWidget } from "@ui/components/atoms/vc-widget";

// Fixed container width; jsdom has no layout
vi.mock("@vueuse/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@vueuse/core")>()),
  useElementSize: () => ({ width: ref(300), height: ref(0) }),
}));
vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string, p?: Record<string, unknown>) => (p?.title ? `${k}:${p.title}` : k) }),
}));
vi.mock("@ui/composables/useTeleportTarget", () => ({ useTeleportTarget: () => ({ teleportTarget: "body" }) }));
vi.mock("sortablejs", () => ({ default: { create: () => ({ option: vi.fn(), destroy: vi.fn() }) } }));

import WidgetContainerMobile from "./WidgetContainerMobile.vue";

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
async function mountContainer(
  widgets: IWidget[],
  bladeName = "testblade",
  service: unknown = { updateWidget: vi.fn() },
  // The Teleport stub re-creates its content on every patch, so mount counts need the real one
  realTeleport = false,
) {
  wrapper = mount(WidgetContainerMobile, {
    props: { widgets, bladeId: "b", bladeName },
    attachTo: document.body,
    global: {
      provide: { [WidgetServiceKey as symbol]: service, [BladeDescriptorKey as symbol]: ref({ id: "blade" }) },
      stubs: realTeleport ? {} : { Teleport: true },
      mocks: { $t: (k: string) => k },
    },
  });
  await flushPromises();
  return wrapper;
}
const ids = (sel: string) => wrapper.findAll(`${sel} > [data-widget-id]`).map((e) => e.attributes("data-widget-id"));
const strip = () => ids("[data-widget-list=strip]");
const overflow = () => ids("[data-widget-list=overflow]");
const byLabel = (re: RegExp) =>
  wrapper.findAll("button").filter((b) => re.test(b.attributes("aria-label") ?? b.text()));
const chevron = () => wrapper.find("[data-more-button]");

describe("WidgetContainerMobile", () => {
  const offsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth");

  beforeAll(() => {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      get(this: HTMLElement) {
        return this.hasAttribute("data-item-key") ? 100 : 0;
      },
    });
  });
  afterAll(() => {
    vi.unstubAllGlobals();
    if (offsetWidth) Object.defineProperty(HTMLElement.prototype, "offsetWidth", offsetWidth);
  });
  beforeEach(() => localStorage.clear());
  afterEach(() => wrapper?.unmount());

  it("always shows the chevron, even when every widget fits", async () => {
    await mountContainer(make(2));
    expect(chevron().exists()).toBe(true);
    expect(chevron().attributes("aria-label")).toBe("COMPONENTS.ORGANISMS.VC_BLADE.WIDGETS.MORE_WIDGETS");
  });

  it("fits the strip by width and lists the adaptive-hidden ones in the sheet", async () => {
    await mountContainer(make(5));
    const inBar = wrapper.findAll(".vc-widget-container-mobile__content > [data-item-key]");
    expect(inBar.length).toBeLessThan(5);
    const sheet = wrapper.findAll(".vc-widget-container-mobile__sheet-list > [data-widget-id]");
    expect(sheet.length).toBe(5 - inBar.length);
  });

  it("mounts an overflow widget while the sheet is closed and shows the dot", async () => {
    const mounted = vi.fn();
    const Comp = defineComponent({
      setup() {
        onMounted(mounted);
        return () => h("button", "c");
      },
    });
    const widgets = make(7, { w7: { headless: { icon: "x", alerts: ref([alert("error")]) } as IWidget["headless"] } });
    widgets[5] = { id: "w6", title: "W6", component: Comp } as IWidget;
    await mountContainer(widgets);
    expect(mounted).toHaveBeenCalled();
    expect(wrapper.find(".vc-widget-container-mobile__more-dot--danger").exists()).toBe(true);
    const sheet = wrapper.findAll(".vc-widget-container-mobile__sheet-list > [data-widget-id]");
    expect(sheet.map((e) => e.attributes("data-widget-id")).slice(-2)).toEqual(["w7", "w6"]);
  });

  it("puts the dot on the chevron for an alerted adaptive-hidden strip widget", async () => {
    const widgets = make(5, {
      w5: { headless: { icon: "x", alerts: ref([alert("warning")]) } as IWidget["headless"] },
    });
    await mountContainer(widgets);
    expect(wrapper.find(".vc-widget-container-mobile__more-dot--warning").exists()).toBe(true);
  });

  it("names hidden alerts in the chevron label", async () => {
    await mountContainer(
      make(7, { w7: { headless: { icon: "x", alerts: ref([alert("error")]) } as IWidget["headless"] } }),
    );
    expect(chevron().attributes("aria-label")).toBe("COMPONENTS.ORGANISMS.VC_BLADE.WIDGETS.MORE_WIDGETS_ALERTS");
  });

  it("hides Customize when the blade has no name", async () => {
    await mountContainer(make(3), "");
    expect(wrapper.text()).not.toContain("CUSTOMIZE");
  });

  describe("edit mode", () => {
    async function edit(widgets = make(7)) {
      await mountContainer(widgets);
      await chevron().trigger("click");
      await byLabel(/\.CUSTOMIZE$/)[0].trigger("click");
    }

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

    it("lists strip and overflow with grips and minus/plus", async () => {
      await edit();
      expect(strip()).toEqual(["w1", "w2", "w3", "w4", "w5"]);
      expect(overflow()).toEqual(["w6", "w7"]);
      expect(wrapper.findAll(".vc-widget-container-mobile__grip").length).toBe(7);
      expect(byLabel(/REORDER:W1/).length).toBe(1);
      await byLabel(/REMOVE:W1/)[0].trigger("click");
      expect(strip()).toEqual(["w2", "w3", "w4", "w5"]);
      await byLabel(/ADD:W1/)[0].trigger("click");
      expect(strip()).toContain("w1");
    });

    it("disables plus at 5 and shows the hint", async () => {
      await edit();
      expect(byLabel(/ADD:W6/)[0].attributes("disabled")).toBeDefined();
      expect(wrapper.text()).toContain("STRIP_FULL");
    });

    it("Done persists, Reset clears", async () => {
      await edit();
      await byLabel(/REMOVE:W1/)[0].trigger("click");
      await byLabel(/\.DONE$/)[0].trigger("click");
      expect(JSON.parse(localStorage.getItem(KEY)!).strip).not.toContain("w1");
      await byLabel(/\.CUSTOMIZE$/)[0].trigger("click");
      await byLabel(/\.RESET$/)[0].trigger("click");
      expect(localStorage.getItem(KEY)).toBeNull();
    });

    it("commits when the sheet closes while editing", async () => {
      await edit();
      await byLabel(/REMOVE:W1/)[0].trigger("click");
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      await flushPromises();
      expect(JSON.parse(localStorage.getItem(KEY)!).strip).not.toContain("w1");
    });

    it("ArrowDown on a grip reorders the strip list", async () => {
      await edit();
      await wrapper
        .find("[data-widget-list=strip] > [data-widget-id=w1] .vc-widget-container-mobile__grip")
        .trigger("keydown", { key: "ArrowDown" });
      expect(strip().slice(0, 2)).toEqual(["w2", "w1"]);
    });

    it("ArrowDown reorders the not-on-blade list", async () => {
      await edit();
      await wrapper
        .find("[data-widget-list=overflow] > [data-widget-id=w6] .vc-widget-container-mobile__grip")
        .trigger("keydown", { key: "ArrowDown" });
      expect(overflow()).toEqual(["w7", "w6"]);
    });
  });

  it("edit rows are lightweight: no widget component mounts for them", async () => {
    const mounted = vi.fn();
    const Comp = defineComponent({
      setup() {
        onMounted(mounted);
        return () => h("button", "c");
      },
    });
    const widgets = make(7);
    widgets[1] = { id: "w2", title: "W2", component: Comp, trigger: { icon: "lucide-star" } } as IWidget;
    await mountContainer(widgets);
    expect(mounted).toHaveBeenCalledTimes(1);
    await chevron().trigger("click");
    await byLabel(/\.CUSTOMIZE$/)[0].trigger("click");
    expect(wrapper.find("[data-widget-list=strip] > [data-widget-id=w2]").text()).toContain("W2");
    await byLabel(/\.DONE$/)[0].trigger("click");
    expect(mounted).toHaveBeenCalledTimes(1);
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
          return () => h(VcWidget, { icon: "x", value: badge.value });
        },
      });
    const service = createWidgetService();
    // w2 sits in the bar, w3 is adaptive-hidden, w6 is in the overflow
    for (const w of make(7)) {
      const component = ["w2", "w3", "w6"].includes(w.id) ? comp(w.id) : undefined;
      service.registerWidget(component ? { id: w.id, title: w.title, component } : w, "blade");
    }
    await mountContainer(service.getWidgets("blade"), "testblade", service, true);
    const bodyButton = (re: RegExp) =>
      Array.from(document.body.querySelectorAll("button")).find((b) =>
        re.test(b.getAttribute("aria-label") ?? b.textContent ?? ""),
      )!;
    await chevron().trigger("click");
    // An adaptive-hidden widget first renders in the bar while measuring, so count from here
    const before = Object.fromEntries(Object.entries(instances).map(([k, v]) => [k, v.mounted]));
    bodyButton(/\.CUSTOMIZE$/).click();
    await flushPromises();
    bodyButton(/\.DONE$/).click();
    await flushPromises();
    for (const id of ["w2", "w3", "w6"]) {
      expect(instances[id].mounted).toBe(before[id]);
      const widget = service.getWidgets("blade").find((w) => w.id === id)!;
      // The registry unwraps the ref, so a change on the live instance's badge shows through
      instances[id].badge.value = 5;
      expect(widget.trigger?.badge).toBe(5);
    }
    instances.w2.badge.value = 9;
    await flushPromises();
    expect(wrapper.find(".vc-widget-container-mobile__content").text()).toContain("9");
  });

  it("passes editing to the bar so widget clicks are blocked", async () => {
    const onClick = vi.fn();
    await mountContainer(make(7, { w1: { headless: { icon: "x", onClick } as IWidget["headless"] } }));
    await chevron().trigger("click");
    await byLabel(/\.CUSTOMIZE$/)[0].trigger("click");
    await wrapper.find(".vc-widget-container-mobile__content [data-item-key=w1] .vc-widget").trigger("click");
    expect(onClick).not.toHaveBeenCalled();
  });

  it("the bar follows a saved custom order", async () => {
    localStorage.setItem(KEY, JSON.stringify({ strip: ["w3", "w1"], overflow: ["w2"] }));
    await mountContainer(make(3));
    const keys = wrapper
      .findAll(".vc-widget-container-mobile__content [data-item-key]")
      .map((e) => e.attributes("data-item-key"));
    // w2 was saved in the overflow, so it stays in the sheet
    expect(keys).toEqual(["w3", "w1"]);
  });

  it("keeps the sheet panel hidden and inert while closed", async () => {
    await mountContainer(make(3));
    const panel = wrapper.find(".vc-sidebar__panel");
    expect(panel.exists()).toBe(true);
    expect(panel.attributes()).toHaveProperty("inert");
    expect((panel.element as HTMLElement).style.display).toBe("none");
  });
});
