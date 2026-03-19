import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";

// Mock date utilities
vi.mock("@core/utilities/date", () => ({
  formatDateRelative: (val: unknown) => `relative(${val})`,
  formatDateWithPattern: (val: unknown, fmt: string) => `formatted(${val}, ${fmt})`,
}));

// Mock truncate-html
vi.mock("truncate-html", () => ({
  default: (html: string) => html,
}));

// Mock dompurify
vi.mock("dompurify", () => ({
  default: {
    sanitize: (html: string) => html,
  },
}));

// Mock vee-validate Field
vi.mock("vee-validate", () => ({
  Field: {
    name: "Field",
    props: ["name", "label", "modelValue", "rules"],
    template: '<div class="field-stub"><slot :errors="[]" :errorMessage="undefined" /></div>',
  },
}));

import VcTableCell from "./vc-table-cell.vue";

function factory(props: Record<string, unknown> = {}) {
  return mount(VcTableCell, {
    props: {
      cell: { id: "name", type: undefined, field: "name" },
      item: { name: "Test Item" },
      ...props,
    },
    global: {
      stubs: {
        VcImage: {
          name: "VcImage",
          props: ["src", "bordered", "size", "aspect", "emptyIcon", "background"],
          template: '<div class="vc-image-stub" />',
        },
        VcStatus: {
          name: "VcStatus",
          template: '<span class="vc-status-stub"><slot /></span>',
        },
        VcStatusIcon: {
          name: "VcStatusIcon",
          props: ["status"],
          template: '<span class="vc-status-icon-stub" />',
        },
        VcLink: {
          name: "VcLink",
          template: '<a class="vc-link-stub"><slot /></a>',
        },
        VcInput: {
          name: "VcInput",
          props: ["modelValue", "type", "error", "errorMessage"],
          template: '<input class="vc-input-stub" />',
        },
        VcInputCurrency: {
          name: "VcInputCurrency",
          props: ["modelValue", "options", "option", "currencyDisplay", "error", "errorMessage"],
          template: '<input class="vc-input-currency-stub" />',
        },
        VcTooltip: {
          name: "VcTooltip",
          props: ["placement"],
          template: '<div class="vc-tooltip-stub"><slot /><slot name="tooltip" /></div>',
        },
        VcIcon: {
          name: "VcIcon",
          props: ["icon", "class"],
          template: '<i class="vc-icon-stub" />',
        },
        Field: {
          name: "Field",
          props: ["name", "label", "modelValue", "rules"],
          template: '<div class="field-stub"><slot :errors="[]" :errorMessage="undefined" /></div>',
        },
      },
      mocks: {
        $t: (key: string) => key,
        $isMobile: ref(false),
        $isDesktop: ref(true),
      },
    },
  });
}

describe("VcTableCell", () => {
  // Default cell
  it("renders default cell with text value", () => {
    const wrapper = factory();
    expect(wrapper.find(".vc-table-cell__default").text()).toBe("Test Item");
  });

  it("renders default cell using nested field path", () => {
    const wrapper = factory({
      cell: { id: "address", field: "address.city" },
      item: { address: { city: "New York" } },
    });
    expect(wrapper.find(".vc-table-cell__default").text()).toBe("New York");
  });

  // Status cell
  it("renders status cell", () => {
    const wrapper = factory({
      cell: { id: "status", type: "status", field: "status" },
      item: { status: "Active" },
    });
    expect(wrapper.find(".vc-status-stub").text()).toBe("Active");
  });

  // Status icon cell
  it("renders status-icon cell with boolean true", () => {
    const wrapper = factory({
      cell: { id: "enabled", type: "status-icon", field: "enabled" },
      item: { enabled: true },
    });
    expect(wrapper.find(".vc-status-icon-stub").exists()).toBe(true);
  });

  // Image cell
  it("renders image cell", () => {
    const wrapper = factory({
      cell: { id: "thumb", type: "image", field: "thumb" },
      item: { thumb: "https://example.com/img.png" },
    });
    expect(wrapper.find(".vc-image-stub").exists()).toBe(true);
  });

  // Link cell
  it("renders link cell", () => {
    const wrapper = factory({
      cell: { id: "link", type: "link", field: "link" },
      item: { link: "Click here" },
    });
    expect(wrapper.find(".vc-link-stub").text()).toBe("Click here");
  });

  // HTML cell
  it("renders html cell", () => {
    const wrapper = factory({
      cell: { id: "desc", type: "html", field: "desc" },
      item: { desc: "<p>Hello</p>" },
    });
    expect(wrapper.find(".vc-table-cell__html").exists()).toBe(true);
  });

  // Money cell
  it("renders money cell with NOT_SET when value is 0 and not editable", () => {
    const wrapper = factory({
      cell: { id: "price", type: "money", field: "price" },
      item: { price: 0 },
    });
    expect(wrapper.find(".vc-table-cell__not-set").text()).toBe("COMPONENTS.ORGANISMS.VC_TABLE.NOT_SET");
  });

  it("renders money cell with formatted value when non-zero", () => {
    const wrapper = factory({
      cell: { id: "price", type: "money", field: "price" },
      item: { price: 99.99, currency: "USD" },
    });
    expect(wrapper.find(".vc-table-cell__money-display").exists()).toBe(true);
  });

  // Date-ago cell
  it("renders date-ago cell with NOT_SET when value is falsy", () => {
    const wrapper = factory({
      cell: { id: "updated", type: "date-ago", field: "updated" },
      item: { updated: null },
    });
    expect(wrapper.find(".vc-table-cell__not-set").text()).toBe("COMPONENTS.ORGANISMS.VC_TABLE.NOT_SET");
  });

  it("renders date-ago cell with relative date when value exists", () => {
    const wrapper = factory({
      cell: { id: "updated", type: "date-ago", field: "updated" },
      item: { updated: new Date("2024-01-01") },
    });
    expect(wrapper.find(".vc-table-cell__date-ago-content").exists()).toBe(true);
  });

  // Date cell
  it("renders date cell with NOT_SET when value is falsy", () => {
    const wrapper = factory({
      cell: { id: "created", type: "date", field: "created" },
      item: { created: null },
    });
    expect(wrapper.find(".vc-table-cell__not-set").text()).toBe("COMPONENTS.ORGANISMS.VC_TABLE.NOT_SET");
  });

  // Number cell
  it("renders number cell with formatted integer", () => {
    const wrapper = factory({
      cell: { id: "qty", type: "number", field: "qty" },
      item: { qty: 42 },
    });
    expect(wrapper.find(".vc-table-cell__number").text()).toBe("42");
  });

  it("renders number cell NOT_SET for negative/undefined", () => {
    const wrapper = factory({
      cell: { id: "qty", type: "number", field: "qty" },
      item: { qty: undefined },
    });
    expect(wrapper.find(".vc-table-cell__number").text()).toBe("COMPONENTS.ORGANISMS.VC_TABLE.NOT_SET");
  });

  // Editable cells
  it("renders editable input for default cell when editing=true and editable=true", () => {
    const wrapper = factory({
      cell: { id: "name", field: "name", editable: true },
      item: { name: "Editable" },
      editing: true,
      index: 0,
    });
    expect(wrapper.find(".vc-input-stub").exists()).toBe(true);
  });

  it("does not render editable input when editing=false", () => {
    const wrapper = factory({
      cell: { id: "name", field: "name", editable: true },
      item: { name: "Editable" },
      editing: false,
    });
    expect(wrapper.find(".vc-input-stub").exists()).toBe(false);
    expect(wrapper.find(".vc-table-cell__default").text()).toBe("Editable");
  });

  it("renders editable number input when type=number and editing", () => {
    const wrapper = factory({
      cell: { id: "qty", type: "number", field: "qty", editable: true },
      item: { qty: 10 },
      editing: true,
      index: 0,
    });
    expect(wrapper.find(".vc-input-stub").exists()).toBe(true);
  });

  it("renders editable money input when type=money and editing", () => {
    const wrapper = factory({
      cell: { id: "price", type: "money", field: "price", editable: true },
      item: { price: 50, currency: "USD" },
      editing: true,
      index: 0,
    });
    expect(wrapper.find(".vc-input-currency-stub").exists()).toBe(true);
  });
});
