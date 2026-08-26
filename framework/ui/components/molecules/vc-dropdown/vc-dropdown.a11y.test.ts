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
        // The trigger wrapper is a passive container; the interactive control
        // lives inside the slot. A plain span keeps this unit case simple.
        trigger: "<span>Open menu</span>",
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
