import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import VcSidebar from "@ui/components/organisms/vc-sidebar/vc-sidebar.vue";

describe("VcSidebar", () => {
  it("closes by Escape and emits close reason", async () => {
    const wrapper = mount(VcSidebar, {
      props: {
        modelValue: true,
        title: "Settings",
      },
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await nextTick();

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([false]);
    expect(wrapper.emitted("close")?.[0]).toEqual(["escape"]);
    wrapper.unmount();
  });

  it("closes by overlay click when closeOnOverlay=true", async () => {
    const wrapper = mount(VcSidebar, {
      props: {
        modelValue: true,
        closeOnOverlay: true,
      },
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    await wrapper.find(".vc-sidebar__overlay").trigger("click");

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([false]);
    expect(wrapper.emitted("close")?.[0]).toEqual(["overlay"]);
    wrapper.unmount();
  });

  it("ignores overlay click when closeOnOverlay=false", async () => {
    const wrapper = mount(VcSidebar, {
      props: {
        modelValue: true,
        closeOnOverlay: false,
      },
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    await wrapper.find(".vc-sidebar__overlay").trigger("click");

    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(wrapper.emitted("close")).toBeUndefined();
    wrapper.unmount();
  });

  it("locks body scroll when opened and restores on close", async () => {
    const initialOverflow = document.body.style.overflow;

    const wrapper = mount(VcSidebar, {
      props: {
        modelValue: false,
      },
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    await wrapper.setProps({ modelValue: true });
    await nextTick();
    expect(document.body.style.overflow).toBe("hidden");

    await wrapper.setProps({ modelValue: false });
    await nextTick();
    expect(document.body.style.overflow).toBe(initialOverflow);
    wrapper.unmount();
  });

  it("traps focus inside sidebar when pressing Tab", async () => {
    const wrapper = mount(VcSidebar, {
      props: {
        modelValue: true,
        closeButton: false,
      },
      slots: {
        default: `
          <div class="tw-p-4">
            <button id="first-focusable" type="button">First</button>
            <button id="last-focusable" type="button">Last</button>
          </div>
        `,
      },
      attachTo: document.body,
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    await nextTick();

    const last = document.getElementById("last-focusable");
    last?.focus();

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    await nextTick();

    expect((document.activeElement as HTMLElement | null)?.id).toBe("first-focusable");
    wrapper.unmount();
  });
});
