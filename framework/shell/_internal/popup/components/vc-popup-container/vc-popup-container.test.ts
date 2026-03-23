import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, reactive } from "vue";
import VcPopupContainer from "./vc-popup-container.vue";
import { PopupPluginKey } from "@shell/_internal/popup/keys";
import type { PopupPlugin } from "@shell/_internal/popup/types";

// Mock DOMPurify
vi.mock("dompurify", () => ({
  default: {
    sanitize: (html: string) => html,
  },
}));

// Mock getPopupPlugin to use inject
vi.mock("@shell/_internal/popup/utils", () => {
  const vue = require("vue");
  return {
    getPopupPlugin: () => {
      return vue.inject(PopupPluginKey, undefined);
    },
  };
});

const DummyPopup = defineComponent({
  name: "DummyPopup",
  props: ["title"],
  emits: ["close"],
  setup(props, { slots }) {
    return () =>
      h("div", { class: "dummy-popup" }, [h("span", { class: "popup-title" }, props.title), slots.default?.()]);
  },
});

function mountContainer(popups: PopupPlugin["popups"] = []) {
  const popupPlugin = reactive({ popups }) as PopupPlugin;

  return mount(VcPopupContainer, {
    global: {
      provide: {
        [PopupPluginKey as symbol]: popupPlugin,
      },
    },
  });
}

describe("VcPopupContainer", () => {
  it("renders nothing when there are no popups", () => {
    const wrapper = mountContainer([]);
    // With no popups, the v-for renders nothing
    expect(wrapper.findAll(".dummy-popup")).toHaveLength(0);
  });

  it("renders a popup component when popups array has items", () => {
    const closeFn = vi.fn();
    const wrapper = mountContainer([
      {
        id: Symbol("test"),
        component: DummyPopup as any,
        props: { title: "Test Popup" },
        close: closeFn,
      },
    ]);
    expect(wrapper.find(".dummy-popup").exists()).toBe(true);
    expect(wrapper.find(".popup-title").text()).toBe("Test Popup");
  });

  it("renders multiple popups", () => {
    const wrapper = mountContainer([
      {
        id: Symbol("p1"),
        component: DummyPopup as any,
        props: { title: "First" },
        close: vi.fn(),
      },
      {
        id: Symbol("p2"),
        component: DummyPopup as any,
        props: { title: "Second" },
        close: vi.fn(),
      },
    ]);
    const popups = wrapper.findAll(".dummy-popup");
    expect(popups).toHaveLength(2);
  });

  it("calls close callback when popup emits close", async () => {
    const closeFn = vi.fn();
    const wrapper = mountContainer([
      {
        id: Symbol("test"),
        component: DummyPopup as any,
        props: { title: "Closable" },
        close: closeFn,
      },
    ]);
    await wrapper.findComponent(DummyPopup).vm.$emit("close");
    expect(closeFn).toHaveBeenCalled();
  });

  it("renders HTML string slots with sanitization", () => {
    const wrapper = mountContainer([
      {
        id: Symbol("html"),
        component: DummyPopup as any,
        props: { title: "HTML Slot" },
        slots: { default: "<p>Hello World</p>" },
        close: vi.fn(),
      },
    ]);
    expect(wrapper.html()).toContain("Hello World");
  });
});
