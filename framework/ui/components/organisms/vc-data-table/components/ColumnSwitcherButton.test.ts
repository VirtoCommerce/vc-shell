import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import ColumnSwitcherButton from "./ColumnSwitcherButton.vue";

const stubs = {
  VcButton: {
    template: '<button class="vc-button-stub" :disabled="disabled" @click="$emit(\'click\', $event)"><slot /></button>',
    props: ["variant", "size", "icon", "disabled"],
  },
};

function factory(props: Record<string, unknown> = {}) {
  return mount(ColumnSwitcherButton, {
    props,
    global: {
      stubs,
      mocks: { $t: (k: string) => k },
    },
  });
}

describe("ColumnSwitcherButton", () => {
  it("renders a button", () => {
    const w = factory();
    expect(w.find(".vc-button-stub").exists()).toBe(true);
  });

  it("is not disabled by default", () => {
    const w = factory();
    expect(w.find(".vc-button-stub").attributes("disabled")).toBeUndefined();
  });

  it("can be disabled", () => {
    const w = factory({ disabled: true });
    expect(w.find(".vc-button-stub").attributes("disabled")).toBeDefined();
  });

  it("emits click on button click", async () => {
    const w = factory();
    await w.find(".vc-button-stub").trigger("click");
    expect(w.emitted("click")).toBeTruthy();
  });

  it("renders label span", () => {
    const w = factory();
    expect(w.find(".vc-column-switcher-button__label").exists()).toBe(true);
  });
});
