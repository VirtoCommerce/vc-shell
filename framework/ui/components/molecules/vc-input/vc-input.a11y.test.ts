import { afterEach, describe, expect, it } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import axe from "axe-core";
import VcInput from "@ui/components/molecules/vc-input/vc-input.vue";

describe("VcInput a11y", () => {
  let wrapper: VueWrapper;

  afterEach(() => {
    wrapper?.unmount();
  });

  const mountInput = (props: Record<string, unknown> = {}) => {
    wrapper = mount(VcInput as any, {
      props: { modelValue: "", ...props },
      global: {
        stubs: {
          VcIcon: true,
          VcLabel: false,
          VcHint: false,
        },
      },
      attachTo: document.body,
    });
    return wrapper;
  };

  it("has no a11y violations with label", async () => {
    const w = mountInput({ label: "Username" });
    const results = await axe.run(w.element as HTMLElement);
    expect(results).toHaveNoViolations();
  });

  it("has no a11y violations with placeholder", async () => {
    const w = mountInput({ label: "Email", placeholder: "you@example.com" });
    const results = await axe.run(w.element as HTMLElement);
    expect(results).toHaveNoViolations();
  });

  it("has no a11y violations in error state", async () => {
    const w = mountInput({ label: "Email", error: true, errorMessage: "Required field" });
    const results = await axe.run(w.element as HTMLElement);
    expect(results).toHaveNoViolations();
  });

  it("has no a11y violations when disabled", async () => {
    const w = mountInput({ label: "Email", disabled: true });
    const results = await axe.run(w.element as HTMLElement);
    expect(results).toHaveNoViolations();
  });

  it("has no a11y violations when required", async () => {
    const w = mountInput({ label: "Email", required: true });
    const results = await axe.run(w.element as HTMLElement);
    expect(results).toHaveNoViolations();
  });
});
