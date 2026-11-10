import { describe, it, expect } from "vitest";
import { defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import SearchField from "./SearchField.vue";

const InputStub = defineComponent({
  name: "VcInput",
  props: ["modelValue"],
  emits: ["update:modelValue"],
  setup:
    (props, { emit }) =>
    () =>
      h("div", [
        h("input", {
          class: "input-stub",
          value: props.modelValue,
          onInput: (e: Event) => emit("update:modelValue", (e.target as HTMLInputElement).value),
        }),
      ]),
});
const global = { stubs: { VcInput: InputStub, VcIcon: true } };

const mountField = (props: Record<string, unknown> = {}) =>
  mount(SearchField, {
    props: { modelValue: "", placeholder: "Search", ...props },
    global,
    attachTo: document.body,
  });

describe("SearchField", () => {
  it("renders the input when not collapsed", () => {
    const w = mountField();
    expect(w.find(".input-stub").exists()).toBe(true);
    expect(w.find(".vc-search-bar__search-btn").exists()).toBe(false);
    w.unmount();
  });

  it("collapsed shows a named button; click opens the input with focus and emits open-change(true)", async () => {
    const w = mountField({ collapsed: true });
    expect(w.find(".input-stub").exists()).toBe(false);
    const btn = w.get(".vc-search-bar__search-btn");
    expect(btn.attributes("aria-label")).toBe("Search");
    expect(btn.attributes("title")).toBe("Search");

    await btn.trigger("click");
    await w.vm.$nextTick();

    expect(w.find(".input-stub").exists()).toBe(true);
    expect(document.activeElement).toBe(w.get(".input-stub").element);
    expect(w.classes()).toContain("vc-search-bar__search--open");
    expect(w.emitted("open-change")).toEqual([[true]]);
    w.unmount();
  });

  it("blur with an empty value folds back and emits open-change(false)", async () => {
    const w = mountField({ collapsed: true });
    await w.get(".vc-search-bar__search-btn").trigger("click");
    await w.vm.$nextTick();

    await w.get(".input-stub").trigger("focusout", { relatedTarget: null });

    expect(w.find(".input-stub").exists()).toBe(false);
    expect(w.classes()).not.toContain("vc-search-bar__search--open");
    expect(w.emitted("open-change")).toEqual([[true], [false]]);
    w.unmount();
  });

  it("blur with text stays open", async () => {
    const w = mountField({ collapsed: true });
    await w.get(".vc-search-bar__search-btn").trigger("click");
    await w.vm.$nextTick();
    await w.setProps({ modelValue: "abc" });

    await w.get(".input-stub").trigger("focusout", { relatedTarget: null });

    expect(w.find(".input-stub").exists()).toBe(true);
    expect(w.emitted("open-change")).toEqual([[true]]);
    w.unmount();
  });

  it("clearing the text while not focused folds back", async () => {
    const w = mountField({ collapsed: true });
    await w.get(".vc-search-bar__search-btn").trigger("click");
    await w.vm.$nextTick();
    await w.setProps({ modelValue: "abc" });
    await w.get(".input-stub").trigger("focusout", { relatedTarget: null });
    (document.activeElement as HTMLElement | null)?.blur();

    await w.setProps({ modelValue: "" });

    expect(w.find(".input-stub").exists()).toBe(false);
    expect(w.emitted("open-change")).toEqual([[true], [false]]);
    w.unmount();
  });

  it("forwards typing as update:modelValue", async () => {
    const w = mountField();
    await w.get(".input-stub").setValue("hi");
    expect(w.emitted("update:modelValue")).toEqual([["hi"]]);
    w.unmount();
  });

  it("disabled disables the button", () => {
    const w = mountField({ collapsed: true, disabled: true });
    expect(w.get(".vc-search-bar__search-btn").attributes("disabled")).toBeDefined();
    w.unmount();
  });

  it("starts open when collapsed with an active query", () => {
    const w = mountField({ collapsed: true, modelValue: "abc" });
    expect(w.find(".input-stub").exists()).toBe(true);
    expect(w.emitted("open-change")).toEqual([[true]]);
    w.unmount();
  });

  it("stays open when collapsed turns on while text is present", async () => {
    const w = mountField({ collapsed: false, modelValue: "abc" });
    await w.setProps({ collapsed: true });
    expect(w.find(".input-stub").exists()).toBe(true);
    expect(w.classes()).toContain("vc-search-bar__search--open");
    w.unmount();
  });

  it("a focused empty field stays open and focused when collapsed turns on", async () => {
    const w = mountField({ collapsed: false });
    const input = w.get(".input-stub").element as HTMLInputElement;
    input.focus();
    await w.setProps({ collapsed: true });
    expect(w.find(".input-stub").element).toBe(input);
    expect(document.activeElement).toBe(input);
    expect(w.classes()).toContain("vc-search-bar__search--open");
    w.unmount();
  });

  it("keeps one search icon in the box, outside the button and the input", async () => {
    const w = mountField({ collapsed: true });
    const icon = () => w.findAll(".vc-search-bar__search-icon");
    expect(icon()).toHaveLength(1);
    expect(icon()[0].element.parentElement).toBe(w.element);
    await w.get(".vc-search-bar__search-btn").trigger("click");
    await w.vm.$nextTick();
    expect(icon()).toHaveLength(1);
    expect(icon()[0].element.parentElement).toBe(w.element);
    w.unmount();
  });

  it("ignores the focusout fired by removing the clicked button", async () => {
    const w = mountField({ collapsed: true });
    const btn = w.get(".vc-search-bar__search-btn");
    await btn.trigger("click");
    btn.element.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: null }));
    await w.vm.$nextTick();
    await w.vm.$nextTick();
    expect(w.find(".input-stub").exists()).toBe(true);
    expect(document.activeElement).toBe(w.get(".input-stub").element);
    expect(w.emitted("open-change")).toEqual([[true]]);
    w.unmount();
  });

  it("falls back to the localized placeholder for the accessible name", () => {
    const w = mountField({ collapsed: true, placeholder: undefined });
    expect(w.get(".vc-search-bar__search-btn").attributes("aria-label")).toBeTruthy();
    w.unmount();
  });
});
