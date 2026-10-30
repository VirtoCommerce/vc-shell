import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";

const floatingSpy = vi.hoisted(() => ({
  update: vi.fn(),
  options: [] as any[],
  autoUpdate: vi.fn(),
  autoUpdateCleanup: vi.fn(),
}));

vi.mock("@floating-ui/vue", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@floating-ui/vue")>();
  return {
    ...actual,
    autoUpdate: (...args: Parameters<typeof actual.autoUpdate>) => {
      floatingSpy.autoUpdate();
      const cleanup = actual.autoUpdate(...args);
      return () => {
        floatingSpy.autoUpdateCleanup();
        cleanup();
      };
    },
    useFloating: (...args: any[]) => {
      floatingSpy.options.push(args[2]);
      const result = (actual.useFloating as any)(...args);
      return { ...result, update: floatingSpy.update };
    },
  };
});

import VcDropdown from "@ui/components/molecules/vc-dropdown/vc-dropdown.vue";

describe("VcDropdown floating position", () => {
  beforeEach(() => {
    floatingSpy.update.mockClear();
    floatingSpy.options.length = 0;
    floatingSpy.autoUpdate.mockClear();
    floatingSpy.autoUpdateCleanup.mockClear();
  });

  it("runs no autoUpdate while force-mounted and closed", async () => {
    const wrapper = mount(VcDropdown as any, {
      props: { floating: true, forceMount: true, modelValue: false, items: [{ id: "1" }] },
      slots: { trigger: "<button>T</button>" },
      attachTo: document.body,
    });
    await nextTick();
    expect(floatingSpy.autoUpdate).not.toHaveBeenCalled();

    await wrapper.setProps({ modelValue: true });
    await nextTick();
    expect(floatingSpy.autoUpdate).toHaveBeenCalledTimes(1);

    await wrapper.setProps({ modelValue: false });
    await nextTick();
    expect(floatingSpy.autoUpdateCleanup).toHaveBeenCalledTimes(1);
    expect(floatingSpy.autoUpdate).toHaveBeenCalledTimes(1);

    wrapper.unmount();
  });

  it("keeps autoUpdate active for a floating dropdown that starts closed", async () => {
    const wrapper = mount(VcDropdown as any, {
      props: { floating: true, modelValue: false, items: [{ id: "1" }] },
      attachTo: document.body,
    });

    await wrapper.setProps({ modelValue: true });

    expect(floatingSpy.options[0].whileElementsMounted).toBeTypeOf("function");
    wrapper.unmount();
  });

  it("recomputes position each time a force-mounted dropdown opens", async () => {
    const wrapper = mount(VcDropdown as any, {
      props: { floating: true, forceMount: true, modelValue: false, items: [{ id: "1" }] },
      attachTo: document.body,
    });
    floatingSpy.update.mockClear();

    await wrapper.setProps({ modelValue: true });
    await nextTick();
    expect(floatingSpy.update).toHaveBeenCalledTimes(1);

    await wrapper.setProps({ modelValue: false });
    await wrapper.setProps({ modelValue: true });
    await nextTick();
    expect(floatingSpy.update).toHaveBeenCalledTimes(2);

    wrapper.unmount();
  });
});
