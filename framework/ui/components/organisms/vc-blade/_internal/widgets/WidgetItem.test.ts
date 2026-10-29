import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, reactive, ref } from "vue";
import { mount } from "@vue/test-utils";
import { WidgetServiceKey } from "@framework/injection-keys";
import { useWidgetTrigger } from "@core/composables/useBladeWidgets";
import { VcWidget } from "@ui/components/atoms/vc-widget";
import { createWidgetService, type IWidget } from "@core/services/widget-service";
import { BladeDescriptorKey } from "@core/blade-navigation/types";
import WidgetItem from "./WidgetItem.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string, p?: { title?: string }) => (p?.title !== undefined ? `${p.title}|${k}` : k) }),
}));
vi.mock("@ui/composables/useTeleportTarget", () => ({ useTeleportTarget: () => ({ teleportTarget: "body" }) }));

const alert = (severity: "warning" | "error") => ({ id: "a", severity, text: "t" });

function mountItem(widget: IWidget, props: Record<string, unknown> = {}, service: unknown = { updateWidget: vi.fn() }) {
  return mount(WidgetItem, {
    props: { widget, editing: false, ...props },
    global: {
      provide: { [WidgetServiceKey as symbol]: service },
      stubs: { Teleport: true },
      mocks: { $t: (k: string) => k },
    },
  });
}

describe("WidgetItem", () => {
  it("shows a dot for a headless widget with alerts", () => {
    const widget = reactive<IWidget>({
      id: "w",
      title: "W",
      headless: { icon: "lucide-bell", alerts: ref([alert("warning")]) },
    });
    const wrapper = mountItem(widget as IWidget);
    expect(wrapper.find(".vc-widget__alert-dot--warning").exists()).toBe(true);
  });

  it("shows a dot for a component widget calling useWidgetTrigger", async () => {
    const Comp = defineComponent({
      setup() {
        useWidgetTrigger({ alerts: ref([alert("error")]) });
        return () => h(VcWidget, { icon: "x" });
      },
    });
    const widget = reactive<IWidget>({ id: "w", component: Comp });
    const service = {
      updateWidget: ({ widget: patch }: { widget: Partial<IWidget> }) => Object.assign(widget, patch),
    };
    const wrapper = mountItem(widget as IWidget, {}, service);
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".vc-widget__alert-dot--danger").exists()).toBe(true);
  });

  it("shows a dot when a component widget sets alerts after mount (real service)", async () => {
    const alerts = ref<ReturnType<typeof alert>[]>([]);
    const Comp = defineComponent({
      setup() {
        useWidgetTrigger({ alerts });
        return () => h(VcWidget, { icon: "x" });
      },
    });
    const service = createWidgetService();
    service.registerWidget({ id: "w", component: Comp }, "blade");
    const widget = service.getWidgets("blade")[0];
    const wrapper = mount(WidgetItem, {
      props: { widget, editing: false },
      global: {
        provide: {
          [WidgetServiceKey as symbol]: service,
          [BladeDescriptorKey as symbol]: ref({ id: "blade" }),
        },
      },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".vc-widget__alert-dot").exists()).toBe(false);
    alerts.value = [alert("warning")];
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".vc-widget__alert-dot--warning").exists()).toBe(true);
  });

  it("emits click and calls onClick when not editing", async () => {
    const onClick = vi.fn();
    const widget: IWidget = { id: "w", title: "W", headless: { icon: "x", onClick } };
    const wrapper = mountItem(widget);
    await wrapper.find(".vc-widget").trigger("click");
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted("click")).toHaveLength(1);
  });

  it("blocks clicks while editing", async () => {
    const onClick = vi.fn();
    const widget: IWidget = { id: "w", title: "W", headless: { icon: "x", onClick } };
    const wrapper = mountItem(widget, { editing: true });
    await wrapper.find(".vc-widget").trigger("click");
    await wrapper.find(".vc-widget").trigger("keydown", { key: "Enter" });
    expect(onClick).not.toHaveBeenCalled();
    expect(wrapper.emitted("click")).toBeUndefined();
  });

  it("renders a skeleton while a headless widget loads", () => {
    const widget: IWidget = { id: "w", headless: { icon: "x", loading: ref(true) } };
    const wrapper = mountItem(widget);
    expect(wrapper.find(".vc-widget-item__skeleton").exists()).toBe(true);
    expect(wrapper.find(".vc-widget").exists()).toBe(false);
  });

  describe("alerts popover trigger", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    const withAlerts = (onClick = vi.fn()): IWidget => ({
      id: "w",
      title: "W",
      headless: { icon: "x", onClick, alerts: ref([alert("warning")]) },
    });

    it("opens after 300 ms hover and not before", async () => {
      const wrapper = mountItem(withAlerts());
      await wrapper.find(".vc-widget-item").trigger("mouseenter");
      vi.advanceTimersByTime(299);
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".vc-widget-alerts__row").exists()).toBe(false);
      vi.advanceTimersByTime(2);
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".vc-widget-alerts__row").exists()).toBe(true);
    });

    it("exposes alerts and popup state on the trigger", async () => {
      const wrapper = mountItem(withAlerts());
      const trigger = wrapper.find(".vc-widget");
      expect(trigger.attributes("aria-haspopup")).toBe("dialog");
      expect(trigger.attributes("aria-expanded")).toBe("false");
      const describedBy = trigger.attributes("aria-describedby");
      expect(wrapper.find(`[id="${describedBy}"]`).text()).toBe("COMPONENTS.ORGANISMS.VC_BLADE.WIDGETS.ALERTS_COUNT");
      await trigger.trigger("keydown", { key: "ArrowDown" });
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".vc-widget").attributes("aria-expanded")).toBe("true");
    });

    it("a widget without alerts has no popup attributes", () => {
      const wrapper = mountItem({ id: "w", title: "W", headless: { icon: "x" } });
      expect(wrapper.find(".vc-widget").attributes("aria-haspopup")).toBeUndefined();
      expect(wrapper.find(".vc-widget").attributes("aria-expanded")).toBeUndefined();
    });

    it("names the popup after the VcWidget title of a component widget", async () => {
      const Comp = defineComponent({
        setup() {
          useWidgetTrigger({ alerts: ref([alert("warning")]) });
          return () => h(VcWidget, { icon: "x", title: "Messages" });
        },
      });
      const widget = reactive<IWidget>({ id: "w", component: Comp });
      const service = {
        updateWidget: ({ widget: patch }: { widget: Partial<IWidget> }) => Object.assign(widget, patch),
      };
      const wrapper = mountItem(widget as IWidget, {}, service);
      await wrapper.vm.$nextTick();
      await wrapper.find(".vc-widget").trigger("keydown", { key: "ArrowDown" });
      await wrapper.vm.$nextTick();
      expect(wrapper.findComponent({ name: "WidgetAlertsPopover" }).props("title")).toBe(
        "Messages|COMPONENTS.ORGANISMS.VC_BLADE.WIDGETS.ALERTS_TITLE",
      );
    });

    it("renders the alertsComponent a component widget passes to useWidgetTrigger", async () => {
      const Preview = defineComponent({
        props: { alerts: { type: Array, required: true }, close: { type: Function, required: true } },
        setup: (p) => () => h("div", { class: "preview" }, `${p.alerts.length} new`),
      });
      const Comp = defineComponent({
        setup() {
          useWidgetTrigger({ alerts: ref([alert("warning")]), alertsComponent: Preview });
          return () => h(VcWidget, { icon: "x", title: "Messages" });
        },
      });
      const widget = reactive<IWidget>({ id: "w", component: Comp });
      const service = {
        updateWidget: ({ widget: patch }: { widget: Partial<IWidget> }) => Object.assign(widget, patch),
      };
      const wrapper = mountItem(widget as IWidget, {}, service);
      await wrapper.vm.$nextTick();
      await wrapper.find(".vc-widget").trigger("keydown", { key: "ArrowDown" });
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".preview").text()).toBe("1 new");
      expect(wrapper.find(".vc-widget-alerts__row").exists()).toBe(false);
    });

    it("never opens without alerts", async () => {
      const wrapper = mountItem({ id: "w", title: "W", headless: { icon: "x" } });
      await wrapper.find(".vc-widget-item").trigger("mouseenter");
      vi.advanceTimersByTime(1000);
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".vc-widget-alerts__row").exists()).toBe(false);
    });

    it("never opens while editing", async () => {
      const wrapper = mountItem(withAlerts(), { editing: true });
      await wrapper.find(".vc-widget-item").trigger("mouseenter");
      vi.advanceTimersByTime(1000);
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".vc-widget-alerts__row").exists()).toBe(false);
    });

    it("closes 200 ms after leaving", async () => {
      const wrapper = mountItem(withAlerts());
      await wrapper.find(".vc-widget-item").trigger("mouseenter");
      vi.advanceTimersByTime(300);
      await wrapper.vm.$nextTick();
      await wrapper.find(".vc-widget-item").trigger("mouseleave");
      vi.advanceTimersByTime(201);
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".vc-widget-alerts__row").exists()).toBe(false);
    });

    it("opens on ArrowDown on the trigger", async () => {
      const wrapper = mountItem(withAlerts());
      await wrapper.find(".vc-widget").trigger("keydown", { key: "ArrowDown" });
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".vc-widget-alerts__row").exists()).toBe(true);
    });

    it("ignores ArrowDown from a descendant of the trigger", async () => {
      const wrapper = mountItem(withAlerts());
      const inner = document.createElement("input");
      wrapper.find(".vc-widget").element.appendChild(inner);
      inner.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".vc-widget-alerts__row").exists()).toBe(false);
    });

    it("keyboard open focuses the first row and Escape-style close restores focus", async () => {
      const wrapper = mount(WidgetItem, {
        props: { widget: withAlerts(), editing: false },
        attachTo: document.body,
        global: {
          provide: { [WidgetServiceKey as symbol]: { updateWidget: vi.fn() } },
          stubs: { Teleport: true },
          mocks: { $t: (k: string) => k },
        },
      });
      const trigger = wrapper.find(".vc-widget").element as HTMLElement;
      trigger.focus();
      await wrapper.find(".vc-widget").trigger("keydown", { key: "ArrowDown" });
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();
      const first = wrapper.find(".vc-widget-alerts__open").element;
      expect(document.activeElement).toBe(first);
      await wrapper.find(".vc-widget-alerts__open").trigger("click");
      await wrapper.vm.$nextTick();
      expect(document.activeElement).toBe(trigger);
      wrapper.unmount();
    });

    it("pointer open does not steal focus", async () => {
      const wrapper = mountItem(withAlerts());
      await wrapper.find(".vc-widget-item").trigger("mouseenter");
      vi.advanceTimersByTime(300);
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".vc-widget-alerts__row").exists()).toBe(true);
      expect(document.activeElement).toBe(document.body);
    });

    it("pointer handoff to the popover keeps it open", async () => {
      const wrapper = mountItem(withAlerts());
      await wrapper.find(".vc-widget-item").trigger("mouseenter");
      vi.advanceTimersByTime(300);
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();
      await wrapper.find(".vc-widget-item").trigger("mouseleave");
      vi.advanceTimersByTime(100);
      wrapper.findComponent({ name: "VcPopover" }).vm.$.exposed!.panelEl.value?.dispatchEvent(new Event("mouseenter"));
      vi.advanceTimersByTime(500);
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".vc-widget-alerts__row").exists()).toBe(true);
    });

    it("a tap does not open via emulated mouseenter", async () => {
      const wrapper = mountItem(withAlerts());
      const root = wrapper.find(".vc-widget-item");
      await root.trigger("touchstart");
      await root.trigger("touchend");
      await root.trigger("mouseenter");
      vi.advanceTimersByTime(400);
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".vc-widget-alerts__row").exists()).toBe(false);
    });

    const tap = async (wrapper: ReturnType<typeof mountItem>) => {
      await wrapper.find(".vc-widget-item").trigger("touchstart");
      await wrapper.find(".vc-widget").trigger("click");
    };

    it("first tap on a widget with alerts opens the popup, the second opens the widget", async () => {
      const onClick = vi.fn();
      const wrapper = mountItem(withAlerts(onClick));
      await tap(wrapper);
      expect(wrapper.find(".vc-widget-alerts__row").exists()).toBe(true);
      expect(onClick).not.toHaveBeenCalled();
      expect(wrapper.emitted("click")).toBeUndefined();
      await tap(wrapper);
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(wrapper.emitted("click")).toHaveLength(1);
      expect(wrapper.find(".vc-widget-alerts__row").exists()).toBe(false);
    });

    it("the popup opened by a tap has an Open button that opens the widget", async () => {
      const onClick = vi.fn();
      const wrapper = mountItem(withAlerts(onClick));
      await tap(wrapper);
      const open = wrapper.find(".vc-widget-alerts__open-widget");
      expect(open.text()).toBe("COMPONENTS.ORGANISMS.VC_BLADE.WIDGETS.OPEN");
      // Vue drops an event stamped no later than its listener was attached; frozen fake time would
      // stamp the replayed click with the same moment
      vi.advanceTimersByTime(10);
      await open.trigger("click");
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(wrapper.emitted("click")).toHaveLength(1);
      expect(wrapper.find(".vc-widget-alerts__row").exists()).toBe(false);
    });

    it("a tap on a widget without alerts opens it at once", async () => {
      const onClick = vi.fn();
      const wrapper = mountItem({ id: "w", title: "W", headless: { icon: "x", onClick } });
      await tap(wrapper);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("a mouse click opens the widget even with alerts, and hover shows no Open button", async () => {
      const onClick = vi.fn();
      const wrapper = mountItem(withAlerts(onClick));
      await wrapper.find(".vc-widget-item").trigger("mouseenter");
      vi.advanceTimersByTime(300);
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".vc-widget-alerts__row").exists()).toBe(true);
      expect(wrapper.find(".vc-widget-alerts__open-widget").exists()).toBe(false);
      await wrapper.find(".vc-widget").trigger("click");
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});
