import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import WidgetAlertsPopover from "./WidgetAlertsPopover.vue";
import type { IWidgetAlert } from "@core/services/widget-service";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (k: string) => k }) }));
vi.mock("@ui/composables/useTeleportTarget", () => ({ useTeleportTarget: () => ({ teleportTarget: "body" }) }));

function mountPopover(alerts: IWidgetAlert[], props: Record<string, unknown> = {}) {
  return mount(WidgetAlertsPopover, {
    props: { alerts, anchor: document.createElement("div"), show: true, title: "T", ...props },
    global: { stubs: { Teleport: true, VcIcon: true }, mocks: { $t: (k: string) => k } },
  });
}

describe("WidgetAlertsPopover", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("renders a row per alert with the severity class", () => {
    const wrapper = mountPopover([
      { id: "a", severity: "error", text: "A", meta: "now" },
      { id: "b", severity: "warning", text: "B" },
    ]);
    expect(wrapper.findAll(".vc-widget-alerts__row")).toHaveLength(2);
    expect(wrapper.find(".vc-widget-alerts__dot--danger").exists()).toBe(true);
    expect(wrapper.find(".vc-widget-alerts__dot--warning").exists()).toBe(true);
    expect(wrapper.text()).toContain("now");
  });

  it("row click calls onOpen and closes", async () => {
    const onOpen = vi.fn();
    const wrapper = mountPopover([{ id: "a", severity: "info", text: "A", onOpen }]);
    await wrapper.find(".vc-widget-alerts__open").trigger("click");
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted("update:show")?.at(-1)).toEqual([false]);
  });

  it("action click runs the action only", async () => {
    const onOpen = vi.fn();
    const run = vi.fn();
    const wrapper = mountPopover([{ id: "a", severity: "info", text: "A", onOpen, action: { label: "Fix", run } }]);
    await wrapper.find(".vc-widget-alerts__action").trigger("click");
    expect(run).toHaveBeenCalledTimes(1);
    expect(onOpen).not.toHaveBeenCalled();
  });

  it("uses sibling buttons, none nested in another", () => {
    const wrapper = mountPopover([{ id: "a", severity: "info", text: "A", action: { label: "Fix", run: vi.fn() } }]);
    expect(wrapper.find("li > button.vc-widget-alerts__open").exists()).toBe(true);
    expect(wrapper.find("li > button.vc-widget-alerts__action").exists()).toBe(true);
    expect(wrapper.find("button button").exists()).toBe(false);
  });

  it("does not call onSeen when unmounted before 300 ms", () => {
    const onSeen = vi.fn();
    const wrapper = mountPopover([{ id: "a", severity: "info", text: "A", onSeen }]);
    vi.advanceTimersByTime(100);
    wrapper.unmount();
    vi.advanceTimersByTime(1000);
    expect(onSeen).not.toHaveBeenCalled();
  });

  it("focuses the first row on keyboard open and returns focus on close", async () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    const wrapper = mount(WidgetAlertsPopover, {
      props: {
        alerts: [{ id: "a", severity: "info", text: "A" }],
        anchor: trigger,
        show: false,
        title: "T",
        focusOnOpen: true,
        returnFocusTo: trigger,
      },
      attachTo: document.body,
      global: { stubs: { Teleport: true, VcIcon: true }, mocks: { $t: (k: string) => k } },
    });
    await wrapper.setProps({ show: true });
    await wrapper.vm.$nextTick();
    expect(document.activeElement).toBe(wrapper.find(".vc-widget-alerts__open").element);
    await wrapper.setProps({ show: false });
    expect(document.activeElement).toBe(trigger);
    wrapper.unmount();
    trigger.remove();
  });

  it("does not move focus when not opened from the keyboard", async () => {
    const wrapper = mount(WidgetAlertsPopover, {
      props: { alerts: [{ id: "a", severity: "info", text: "A" }], anchor: null, show: false, title: "T" },
      attachTo: document.body,
      global: { stubs: { Teleport: true, VcIcon: true }, mocks: { $t: (k: string) => k } },
    });
    await wrapper.setProps({ show: true });
    await wrapper.vm.$nextTick();
    expect(document.activeElement).toBe(document.body);
    wrapper.unmount();
  });

  it("calls onSeen on close after at least 300 ms open, not while open", async () => {
    const onSeen = vi.fn();
    const wrapper = mountPopover([{ id: "a", severity: "info", text: "A", onSeen }]);
    vi.advanceTimersByTime(1000);
    expect(onSeen).not.toHaveBeenCalled();
    await wrapper.setProps({ show: false });
    expect(onSeen).toHaveBeenCalledTimes(1);
  });

  it("calls onSeen on unmount after at least 300 ms open", () => {
    const onSeen = vi.fn();
    const wrapper = mountPopover([{ id: "a", severity: "info", text: "A", onSeen }]);
    vi.advanceTimersByTime(301);
    expect(onSeen).not.toHaveBeenCalled();
    wrapper.unmount();
    expect(onSeen).toHaveBeenCalledTimes(1);
  });

  it("an alert added while open counts only after its own 300 ms", async () => {
    const first = vi.fn();
    const late = vi.fn();
    const wrapper = mountPopover([{ id: "a", severity: "info", text: "A", onSeen: first }]);
    vi.advanceTimersByTime(400);
    await wrapper.setProps({
      alerts: [
        { id: "b", severity: "info", text: "B", onSeen: late },
        { id: "a", severity: "info", text: "A", onSeen: first },
      ],
    });
    vi.advanceTimersByTime(100);
    await wrapper.setProps({ show: false });
    expect(first).toHaveBeenCalledTimes(1);
    expect(late).not.toHaveBeenCalled();
  });

  it("does not call onSeen when closed at 100 ms", async () => {
    const onSeen = vi.fn();
    const wrapper = mountPopover([{ id: "a", severity: "info", text: "A", onSeen }]);
    vi.advanceTimersByTime(100);
    await wrapper.setProps({ show: false });
    vi.advanceTimersByTime(1000);
    expect(onSeen).not.toHaveBeenCalled();
  });
});
