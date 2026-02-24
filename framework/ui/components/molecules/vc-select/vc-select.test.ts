import { beforeAll, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import VcSelect from "@ui/components/molecules/vc-select/vc-select.vue";

// jsdom lacks IntersectionObserver; provide a no-op stub
beforeAll(() => {
  if (!globalThis.IntersectionObserver) {
    globalThis.IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as any;
  }
});

const i18n = createI18n({ legacy: false, locale: "en", messages: { en: {} } });

describe("VcSelect", () => {
  const mountSelect = (props: Record<string, unknown> = {}) =>
    mount(VcSelect as any, {
      props: { modelValue: null, options: [], ...props },
      global: {
        plugins: [i18n],
        stubs: {
          VcIcon: true,
          VcLabel: false,
          VcHint: false,
          teleport: true,
        },
      },
    });

  it("renders a combobox role element", () => {
    const wrapper = mountSelect();
    expect(wrapper.find('[role="combobox"]').exists()).toBe(true);
  });

  it("sets aria-haspopup=listbox on trigger", () => {
    const wrapper = mountSelect();
    expect(wrapper.find('[role="combobox"]').attributes("aria-haspopup")).toBe("listbox");
  });

  it("sets aria-required on combobox when required", () => {
    const wrapper = mountSelect({ required: true });
    expect(wrapper.find('[role="combobox"]').attributes("aria-required")).toBe("true");
  });

  it("does not set aria-required when not required", () => {
    const wrapper = mountSelect();
    expect(wrapper.find('[role="combobox"]').attributes("aria-required")).toBeUndefined();
  });

  it("sets aria-invalid on combobox when error is true", () => {
    const wrapper = mountSelect({ error: true });
    expect(wrapper.find('[role="combobox"]').attributes("aria-invalid")).toBe("true");
  });

  it("does not set aria-invalid in default state", () => {
    const wrapper = mountSelect();
    expect(wrapper.find('[role="combobox"]').attributes("aria-invalid")).toBeUndefined();
  });

  it("links error message via aria-describedby", () => {
    const wrapper = mountSelect({ error: true, errorMessage: "Selection required" });
    const combobox = wrapper.find('[role="combobox"]');
    const describedBy = combobox.attributes("aria-describedby");

    expect(describedBy).toBeTruthy();
    const ids = describedBy!.split(/\s+/);
    const errorEl = wrapper.find(`#${ids.find((id) => id.includes("error"))}`);
    expect(errorEl.exists()).toBe(true);
    expect(errorEl.text()).toContain("Selection required");
  });

  it("associates label via aria-labelledby on combobox", () => {
    const wrapper = mountSelect({ label: "Country" });
    const combobox = wrapper.find('[role="combobox"]');
    const labelledBy = combobox.attributes("aria-labelledby");

    expect(labelledBy).toBeTruthy();
    expect(wrapper.find(`#${labelledBy}`).exists()).toBe(true);
  });

  it("starts with aria-expanded=false", () => {
    const wrapper = mountSelect();
    expect(wrapper.find('[role="combobox"]').attributes("aria-expanded")).toBe("false");
  });
});
