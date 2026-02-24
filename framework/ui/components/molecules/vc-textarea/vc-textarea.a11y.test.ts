import { afterEach, describe, expect, it } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import axe from "axe-core";
import VcTextarea from "@ui/components/molecules/vc-textarea/vc-textarea.vue";

describe("VcTextarea a11y", () => {
  let wrapper: VueWrapper;

  afterEach(() => {
    wrapper?.unmount();
  });

  const mountTextarea = (props: Record<string, unknown> = {}) => {
    wrapper = mount(VcTextarea as any, {
      props: { modelValue: "", ...props },
      global: {
        stubs: {
          VcLabel: false,
          VcHint: false,
        },
      },
      attachTo: document.body,
    });
    return wrapper;
  };

  it("has no a11y violations with label", async () => {
    const w = mountTextarea({ label: "Description" });
    const results = await axe.run(w.element as HTMLElement);
    expect(results).toHaveNoViolations();
  });

  it("has no a11y violations in error state", async () => {
    const w = mountTextarea({ label: "Description", error: true, errorMessage: "Too short" });
    const results = await axe.run(w.element as HTMLElement);
    expect(results).toHaveNoViolations();
  });

  it("has no a11y violations when disabled", async () => {
    const w = mountTextarea({ label: "Description", disabled: true });
    const results = await axe.run(w.element as HTMLElement);
    expect(results).toHaveNoViolations();
  });
});
