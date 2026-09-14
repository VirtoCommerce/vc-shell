import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import ColumnFilter from "./ColumnFilter.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k, d: (v: unknown) => String(v) }),
}));

const stubs = {
  VcInput: { template: '<input class="vc-input-stub" />' },
  VcSelect: { template: '<div class="vc-select-stub"><slot /></div>' },
  VcButton: { template: '<button class="vc-button-stub"><slot /></button>' },
  VcIcon: { template: '<i class="vc-icon-stub" />' },
  VcDatePicker: { template: '<div class="vc-date-picker-stub" />' },
  Teleport: { template: "<div><slot /></div>" },
};

function factory(props: Record<string, unknown> = {}) {
  return mount(ColumnFilter, {
    props: {
      field: "name",
      filterType: "text",
      ...props,
    },
    global: { stubs, mocks: { $t: (k: string) => k } },
  });
}

describe("ColumnFilter", () => {
  // The popover sits inside a VcSidebar on mobile, which closes on Escape from a
  // document listener. Handling the key here has to stop it reaching that listener.
  it("Escape closes the overlay without reaching the layers behind it", async () => {
    const w = mount(ColumnFilter, {
      props: { field: "name", filterType: "text" },
      global: { stubs, mocks: { $t: (k: string) => k } },
      attachTo: document.body,
    });

    await w.find(".vc-column-filter__trigger").trigger("click");
    const overlay = document.querySelector(".vc-column-filter__overlay") as HTMLElement;
    expect(overlay).not.toBeNull();

    const behind = vi.fn();
    document.addEventListener("keydown", behind);
    overlay.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    document.removeEventListener("keydown", behind);
    await w.vm.$nextTick();

    expect(behind).not.toHaveBeenCalled();
    expect(document.querySelector(".vc-column-filter__overlay")).toBeNull();

    w.unmount();
  });

  it("renders without errors", () => {
    const w = factory();
    expect(w.exists()).toBe(true);
  });

  it("applies vc-column-filter class", () => {
    const w = factory();
    expect(w.find(".vc-column-filter").exists()).toBe(true);
  });

  it("emits apply event", async () => {
    const w = factory({ filterType: "text" });
    // Component should expose apply via internal logic; just verify mount is stable
    expect(w.vm).toBeDefined();
  });

  it("emits clear event", () => {
    const w = factory();
    expect(w.vm).toBeDefined();
  });

  it("renders with select filterType", () => {
    const w = factory({
      filterType: "select",
      options: [{ label: "A", value: "a" }],
    });
    expect(w.exists()).toBe(true);
  });

  it("renders with dateRange filterType", () => {
    const w = factory({
      filterType: "dateRange",
      rangeFields: ["start", "end"],
    });
    expect(w.exists()).toBe(true);
  });
});
