import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import axe from "axe-core";
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

describe("VcSelect a11y", () => {
  let wrapper: VueWrapper;

  afterEach(() => {
    wrapper?.unmount();
  });

  const mountSelect = (props: Record<string, unknown> = {}) => {
    wrapper = mount(VcSelect as any, {
      props: { modelValue: null, options: [], ...props },
      global: {
        plugins: [i18n],
        stubs: {
          VcIcon: true,
          teleport: true,
        },
      },
      attachTo: document.body,
    });
    return wrapper;
  };

  it("has no a11y violations in default state with label", async () => {
    const w = mountSelect({ label: "Select option" });
    const results = await axe.run(w.element as HTMLElement);
    expect(results).toHaveNoViolations();
  });

  it("has no a11y violations with options provided", async () => {
    const w = mountSelect({
      label: "Choose item",
      options: [
        { id: "1", name: "Option A" },
        { id: "2", name: "Option B" },
      ],
    });
    const results = await axe.run(w.element as HTMLElement);
    expect(results).toHaveNoViolations();
  });

  it("has no a11y violations when required", async () => {
    const w = mountSelect({ label: "Required field", required: true });
    const results = await axe.run(w.element as HTMLElement);
    expect(results).toHaveNoViolations();
  });

  it("has no a11y violations in error state", async () => {
    const w = mountSelect({ label: "Error field", error: true, errorMessage: "This field is required" });
    const results = await axe.run(w.element as HTMLElement);
    expect(results).toHaveNoViolations();
  });
});
