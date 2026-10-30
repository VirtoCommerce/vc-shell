import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, onMounted } from "vue";
import VcSidebar from "@ui/components/organisms/vc-sidebar/vc-sidebar.vue";

describe("VcSidebar", () => {
  it("applies inert to its teleported root when requested", () => {
    const wrapper = mount(VcSidebar, {
      props: { modelValue: true, inert: true },
      global: { stubs: { teleport: true } },
    });

    expect(wrapper.find(".vc-sidebar").attributes()).toHaveProperty("inert");
    wrapper.unmount();
  });

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

  describe("forceMount", () => {
    function mountWithProbe(props: Record<string, unknown>) {
      const onProbeMounted = vi.fn();
      const Probe = defineComponent({
        setup() {
          onMounted(() => {
            onProbeMounted();
          });
          return () => h("button", { class: "probe" }, "probe");
        },
      });
      const wrapper = mount(VcSidebar, {
        props: { teleport: false, ...props } as any,
        slots: { default: () => h(Probe) },
      });
      return { wrapper, onProbeMounted };
    }

    it("keeps content mounted while closed", async () => {
      const { wrapper, onProbeMounted } = mountWithProbe({ forceMount: true, modelValue: false });
      await nextTick();

      const panel = wrapper.find(".vc-sidebar__panel");
      expect(panel.exists()).toBe(true);
      expect((panel.element as HTMLElement).style.display).toBe("none");
      expect(panel.attributes()).toHaveProperty("inert");
      expect(wrapper.find(".vc-sidebar__overlay").exists()).toBe(false);
      expect(onProbeMounted).toHaveBeenCalledTimes(1);

      await wrapper.setProps({ modelValue: true });
      const opened = wrapper.find(".vc-sidebar__panel");
      expect((opened.element as HTMLElement).style.display).not.toBe("none");
      expect(opened.attributes()).not.toHaveProperty("inert");

      await wrapper.setProps({ modelValue: false });
      await wrapper.setProps({ modelValue: true });
      expect(onProbeMounted).toHaveBeenCalledTimes(1);

      wrapper.unmount();
    });

    it("default unmounts when closed", () => {
      const { wrapper, onProbeMounted } = mountWithProbe({ modelValue: false });

      expect(wrapper.find(".vc-sidebar__panel").exists()).toBe(false);
      expect(onProbeMounted).not.toHaveBeenCalled();

      wrapper.unmount();
    });

    it("closed forced panel does not trap focus or lock scroll", async () => {
      const before = document.body.style.overflow;
      const outside = document.createElement("button");
      document.body.appendChild(outside);

      const { wrapper } = mountWithProbe({ forceMount: true, modelValue: false });
      await nextTick();

      expect(document.body.style.overflow).toBe(before);
      outside.focus();
      await nextTick();
      expect(document.activeElement).toBe(outside);

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      expect(wrapper.emitted("close")).toBeUndefined();

      await wrapper.setProps({ modelValue: true });
      expect(document.body.style.overflow).toBe("hidden");

      wrapper.unmount();
      outside.remove();
    });
  });
});
