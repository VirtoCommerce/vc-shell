import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import GlobalFiltersButton from "./GlobalFiltersButton.vue";

const stubs = {
  VcButton: {
    template: '<button class="vc-button-stub" :disabled="disabled" @click="$emit(\'click\', $event)"><slot /></button>',
    props: ["variant", "size", "icon", "selected", "disabled"],
  },
};

function factory(props: Record<string, unknown> = {}) {
  return mount(GlobalFiltersButton, {
    props,
    global: {
      stubs,
      mocks: { $t: (k: string) => k },
    },
  });
}

describe("GlobalFiltersButton", () => {
  it("renders button", () => {
    const w = factory();
    expect(w.find(".vc-button-stub").exists()).toBe(true);
  });

  it("shows badge when activeCount > 0", () => {
    const w = factory({ activeCount: 3 });
    expect(w.find(".vc-global-filters-button__badge").exists()).toBe(true);
    expect(w.find(".vc-global-filters-button__badge").text()).toBe("3");
  });

  it("hides badge when activeCount is 0", () => {
    const w = factory({ activeCount: 0 });
    expect(w.find(".vc-global-filters-button__badge").exists()).toBe(false);
  });

  it("emits click on button click", async () => {
    const w = factory();
    await w.find(".vc-button-stub").trigger("click");
    expect(w.emitted("click")).toBeTruthy();
  });

  it("disables button when disabled", () => {
    const w = factory({ disabled: true });
    expect(w.find(".vc-button-stub").attributes("disabled")).toBeDefined();
  });

  it("renders label span", () => {
    const w = factory();
    expect(w.find(".vc-global-filters-button__label").exists()).toBe(true);
  });
});
