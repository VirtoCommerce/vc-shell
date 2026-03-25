import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import TableEmpty from "./TableEmpty.vue";

const stubs = {
  VcIcon: { template: '<i class="vc-icon-stub" />', props: ["icon", "size"] },
  VcButton: {
    template: '<button class="vc-button-stub" @click="$emit(\'click\')"><slot /></button>',
    props: ["variant"],
  },
};

function factory(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  return mount(TableEmpty, {
    props,
    slots,
    global: { stubs },
  });
}

describe("TableEmpty", () => {
  it("renders empty state container", () => {
    const w = factory();
    expect(w.find(".vc-table-composition__empty-state").exists()).toBe(true);
  });

  it("shows title when provided", () => {
    const w = factory({ title: "No results" });
    expect(w.find(".vc-table-composition__empty-title").text()).toBe("No results");
  });

  it("shows default title when not provided", () => {
    const w = factory();
    expect(w.find(".vc-table-composition__empty-title").text()).toBe("No data");
  });

  it("shows description when provided", () => {
    const w = factory({ description: "Try different filters" });
    expect(w.find(".vc-table-composition__empty-description").text()).toBe("Try different filters");
  });

  it("hides description when not provided", () => {
    const w = factory();
    expect(w.find(".vc-table-composition__empty-description").exists()).toBe(false);
  });

  it("shows icon when provided", () => {
    const w = factory({ icon: "lucide-inbox" });
    expect(w.find(".vc-icon-stub").exists()).toBe(true);
  });

  it("shows action button when actionLabel provided", () => {
    const handler = vi.fn();
    const w = factory({ actionLabel: "Reset", actionHandler: handler });
    expect(w.find(".vc-button-stub").text()).toBe("Reset");
  });

  it("renders default slot content", () => {
    const w = factory({}, { default: "<p>Custom empty</p>" });
    expect(w.text()).toContain("Custom empty");
  });

  it("renders action slot", () => {
    const w = factory({}, { action: "<button>Custom Action</button>" });
    expect(w.text()).toContain("Custom Action");
  });
});
