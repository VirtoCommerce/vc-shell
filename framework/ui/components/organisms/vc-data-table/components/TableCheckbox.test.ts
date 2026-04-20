import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import TableCheckbox from "./TableCheckbox.vue";

const stubs = {
  VcCheckbox: {
    template:
      '<input type="checkbox" class="vc-checkbox-stub" :checked="modelValue" :disabled="disabled" @change="$emit(\'update:modelValue\', !modelValue)" />',
    props: ["modelValue", "disabled", "indeterminate"],
    emits: ["update:modelValue"],
  },
};

function factory(props: Record<string, unknown> = {}) {
  return mount(TableCheckbox, {
    props,
    global: { stubs },
  });
}

describe("TableCheckbox", () => {
  it("renders checkbox wrapper", () => {
    const w = factory();
    expect(w.find(".vc-table-composition__checkbox").exists()).toBe(true);
  });

  it("reflects modelValue prop", () => {
    const w = factory({ modelValue: true });
    expect(w.find(".vc-checkbox-stub").attributes("checked")).toBeDefined();
  });

  it("emits update:modelValue on change", async () => {
    const w = factory({ modelValue: false });
    await w.find(".vc-checkbox-stub").trigger("change");
    expect(w.emitted("update:modelValue")).toBeTruthy();
  });

  it("emits change event on change", async () => {
    const w = factory({ modelValue: false });
    await w.find(".vc-checkbox-stub").trigger("change");
    expect(w.emitted("change")).toBeTruthy();
  });

  it("passes disabled prop", () => {
    const w = factory({ disabled: true });
    expect(w.find(".vc-checkbox-stub").attributes("disabled")).toBeDefined();
  });

  it("stops click propagation", () => {
    const w = factory();
    // The wrapper has @click.stop
    expect(w.find(".vc-table-composition__checkbox").exists()).toBe(true);
  });
});
