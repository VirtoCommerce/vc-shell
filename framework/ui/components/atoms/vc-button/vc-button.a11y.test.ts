import { afterEach, describe, expect, it } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import axe from "axe-core";
import VcButton from "@ui/components/atoms/vc-button/vc-button.vue";

describe("VcButton a11y", () => {
  let wrapper: VueWrapper;

  afterEach(() => {
    wrapper?.unmount();
  });

  const mountButton = (props: Record<string, unknown> = {}, slots: Record<string, string> = {}) => {
    wrapper = mount(VcButton as any, {
      props,
      slots,
      global: { stubs: { VcIcon: true } },
      attachTo: document.body,
    });
    return wrapper;
  };

  it("has no a11y violations with text content", async () => {
    const w = mountButton({}, { default: "Submit" });
    const results = await axe.run(w.element as HTMLElement);
    expect(results).toHaveNoViolations();
  });

  it("has no a11y violations when disabled", async () => {
    const w = mountButton({ disabled: true }, { default: "Disabled" });
    const results = await axe.run(w.element as HTMLElement);
    expect(results).toHaveNoViolations();
  });

  it("has no a11y violations when loading", async () => {
    const w = mountButton({ loading: true }, { default: "Loading" });
    const results = await axe.run(w.element as HTMLElement);
    expect(results).toHaveNoViolations();
  });

  it("has no a11y violations for icon-only button with aria-label", async () => {
    const w = mountButton({ ariaLabel: "Add item", icon: "lucide-plus" });
    const results = await axe.run(w.element as HTMLElement);
    expect(results).toHaveNoViolations();
  });
});
