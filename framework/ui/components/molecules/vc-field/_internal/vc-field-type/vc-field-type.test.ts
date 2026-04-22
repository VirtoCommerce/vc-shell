import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import VcFieldType from "./vc-field-type.vue";

// Mock date utility
vi.mock("@core/utilities/date", () => ({
  formatDateRelative: (_d: Date) => "2 days ago",
}));

const mountFieldType = (props: Record<string, unknown>, options: Record<string, unknown> = {}) =>
  mount(VcFieldType, {
    props,
    global: {
      stubs: {
        VcLink: {
          template: '<a class="vc-field-type__link" @click="$emit(\'click\')"><slot /></a>',
          emits: ["click"],
        },
      },
    },
    ...options,
  });

describe("VcFieldType", () => {
  it("renders text type with string value", () => {
    const wrapper = mountFieldType({ type: "text", value: "Hello world" });
    expect(wrapper.find(".vc-field-type__text").text()).toBe("Hello world");
  });

  it("renders text type with numeric value", () => {
    const wrapper = mountFieldType({ type: "text", value: 42 });
    expect(wrapper.find(".vc-field-type__text").text()).toBe("42");
  });

  it("renders date type with string value", () => {
    const wrapper = mountFieldType({ type: "date", value: "2024-01-15" });
    expect(wrapper.find(".vc-field-type__text").text()).toBe("2024-01-15");
  });

  it("renders date type with Date value using toLocaleDateString", () => {
    const d = new Date("2024-06-15T00:00:00");
    const wrapper = mountFieldType({ type: "date", value: d });
    // Should call toLocaleDateString
    expect(wrapper.find(".vc-field-type__text").text()).toBe(d.toLocaleDateString());
  });

  it("renders date-ago type with Date value using formatDateRelative", () => {
    const d = new Date();
    const wrapper = mountFieldType({ type: "date-ago", value: d });
    expect(wrapper.find(".vc-field-type__text").text()).toBe("2 days ago");
  });

  it("renders date-ago type with string fallback", () => {
    const wrapper = mountFieldType({ type: "date-ago", value: "some date string" });
    expect(wrapper.find(".vc-field-type__text").text()).toBe("some date string");
  });

  it("renders link type with VcLink", () => {
    const wrapper = mountFieldType({ type: "link", value: "https://example.com" });
    expect(wrapper.find(".vc-field-type__link").exists()).toBe(true);
    expect(wrapper.text()).toContain("https://example.com");
  });

  it("renders email type with mailto link", () => {
    const wrapper = mountFieldType({ type: "email", value: "test@example.com" });
    const link = wrapper.find("a.vc-field-type__link");
    expect(link.exists()).toBe(true);
    expect(link.attributes("href")).toBe("mailto:test@example.com");
    expect(link.text()).toBe("test@example.com");
  });

  it("renders default slot for link type", () => {
    const wrapper = mountFieldType(
      { type: "link", value: "link" },
      { slots: { default: "<span class='extra'>Extra</span>" } },
    );
    expect(wrapper.find(".extra").exists()).toBe(true);
  });

  it("renders default slot for email type", () => {
    const wrapper = mountFieldType(
      { type: "email", value: "a@b.com" },
      { slots: { default: "<span class='extra'>Extra</span>" } },
    );
    expect(wrapper.find(".extra").exists()).toBe(true);
  });
});
