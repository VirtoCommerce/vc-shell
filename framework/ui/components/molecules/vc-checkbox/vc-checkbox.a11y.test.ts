import { afterEach, describe, expect, it } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import axe from "axe-core";
import VcCheckbox from "@ui/components/molecules/vc-checkbox/vc-checkbox.vue";

describe("VcCheckbox a11y", () => {
  let wrapper: VueWrapper;

  afterEach(() => {
    wrapper?.unmount();
  });

  const mountCheckbox = (props: Record<string, unknown> = {}) => {
    wrapper = mount(VcCheckbox as any, {
      props: { modelValue: false, ...props },
      global: { stubs: { VcIcon: true } },
      attachTo: document.body,
    });
    return wrapper;
  };

  it("has no a11y violations with label", async () => {
    const w = mountCheckbox({ label: "Accept terms" });
    const results = await axe.run(w.element as HTMLElement);
    expect(results).toHaveNoViolations();
  });

  it("has no a11y violations when checked", async () => {
    const w = mountCheckbox({ label: "Accept terms", modelValue: true });
    const results = await axe.run(w.element as HTMLElement);
    expect(results).toHaveNoViolations();
  });

  it("has no a11y violations when disabled", async () => {
    const w = mountCheckbox({ label: "Accept terms", disabled: true });
    const results = await axe.run(w.element as HTMLElement);
    expect(results).toHaveNoViolations();
  });
});
