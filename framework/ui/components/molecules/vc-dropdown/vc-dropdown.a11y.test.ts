import { afterEach, describe, expect, it } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import axe from "axe-core";
import VcDropdown from "@ui/components/molecules/vc-dropdown/vc-dropdown.vue";

describe("VcDropdown a11y", () => {
  let wrapper: VueWrapper;

  afterEach(() => {
    wrapper?.unmount();
  });

  const mountDropdown = (props: Record<string, unknown> = {}, slots: Record<string, string> = {}) => {
    wrapper = mount(VcDropdown as any, {
      props: { ...props },
      slots: {
        // Use a non-interactive span inside the trigger div (which already has role="button" + tabindex)
        // to avoid the nested-interactive axe violation (button inside role="button")
        trigger: '<span>Open menu</span>',
        ...slots,
      },
      global: {
        stubs: {
          VcIcon: true,
          teleport: true,
        },
      },
      attachTo: document.body,
    });
    return wrapper;
  };

  it("has no a11y violations in default (closed) state", async () => {
    const w = mountDropdown();
    const results = await axe.run(w.element as HTMLElement);
    expect(results).toHaveNoViolations();
  });

  it("has no a11y violations with listbox role", async () => {
    const w = mountDropdown({ role: "listbox" });
    const results = await axe.run(w.element as HTMLElement);
    expect(results).toHaveNoViolations();
  });
});
