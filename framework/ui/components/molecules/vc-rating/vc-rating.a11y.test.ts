import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick, ref } from "vue";
import VcRating from "@ui/components/molecules/vc-rating/vc-rating.vue";
import { InputGroupContextKey } from "@ui/components/molecules/vc-input-group/context";

/**
 * The invariant VM-1782 established for VcEditor, applied to the one remaining
 * control typed with `IFormFieldProps` that neither adopted `useFormField` nor
 * inherited it from a compliant child: a field told to show an error must connect
 * that error to the control, or a screen reader says "invalid" and never says why.
 */

const stubs = {
  VcLabel: { template: '<div class="stub-label"><slot /><slot name="tooltip" /></div>' },
  VcIcon: { template: '<span class="stub-icon" />' },
};

function mountRating(props: Record<string, unknown> = {}, provide?: Record<symbol, unknown>) {
  return mount(VcRating as any, {
    props,
    global: { stubs, ...(provide ? { provide } : {}) },
  });
}

function groupContext(overrides: Record<string, unknown> = {}) {
  return {
    [InputGroupContextKey as symbol]: {
      name: ref(undefined),
      disabled: ref(false),
      invalid: ref(false),
      describedBy: ref(undefined),
      ...overrides,
    },
  };
}

describe("VcRating accessibility", () => {
  it("renders the error message", () => {
    const wrapper = mountRating({ modelValue: 3, errorMessage: "Pick a rating" });
    expect(wrapper.text()).toContain("Pick a rating");
  });

  it("points aria-describedby at the element carrying the error", () => {
    const wrapper = mountRating({ modelValue: 3, errorMessage: "Pick a rating" });

    const describedBy = wrapper.find(".vc-rating__content").attributes("aria-describedby");
    expect(describedBy).toBeTruthy();

    const described = wrapper.find(`#${describedBy}`);
    expect(described.exists()).toBe(true);
    expect(described.text()).toContain("Pick a rating");
  });

  it("marks the control invalid while the error shows", () => {
    const wrapper = mountRating({ modelValue: 3, errorMessage: "Pick a rating" });
    expect(wrapper.find(".vc-rating__content").attributes("aria-invalid")).toBe("true");
  });

  it("drops the description when the error clears", async () => {
    const wrapper = mountRating({ modelValue: 3, errorMessage: "Pick a rating" });
    await wrapper.setProps({ errorMessage: undefined });
    await nextTick();

    expect(wrapper.find(".vc-rating__content").attributes("aria-describedby")).toBeUndefined();
    expect(wrapper.find(".vc-rating__content").attributes("aria-invalid")).toBeUndefined();
  });

  // A local `!!errorMessage` check cannot see a group's invalid state, so a field
  // inside an invalid group looks fine to assistive technology.
  it("takes invalid state from the surrounding input group", () => {
    const wrapper = mountRating({ modelValue: 3 }, groupContext({ invalid: ref(true) }));
    expect(wrapper.find(".vc-rating__content").attributes("aria-invalid")).toBe("true");
  });

  it("adopts the ids the group already describes its fields by", () => {
    const wrapper = mountRating({ modelValue: 3 }, groupContext({ describedBy: ref("group-help") }));
    expect(wrapper.find(".vc-rating__content").attributes("aria-describedby")).toContain("group-help");
  });
});
