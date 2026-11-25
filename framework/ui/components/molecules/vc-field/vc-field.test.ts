import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import VcField from "@ui/components/molecules/vc-field/vc-field.vue";
import { DateTimeFormatKey } from "@framework/injection-keys";

describe("VcField", () => {
  const mountComponent = (props: Record<string, unknown> = {}) =>
    mount(VcField as any, {
      props,
      global: {
        stubs: {
          VcLabel: {
            template: '<div class="stub-label"><slot /></div>',
            props: ["required", "multilanguage", "currentLanguage", "error"],
          },
          VcCol: {
            template: '<div class="stub-col"><slot /></div>',
            props: ["size"],
          },
          VcFieldType: {
            template: '<div class="stub-field-type"><slot /></div>',
            props: ["value", "type"],
          },
          VcLink: {
            template: '<a class="stub-link"><slot /></a>',
          },
          VcButton: true,
        },
      },
    });

  it("renders correctly with default props", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".vc-field").exists()).toBe(true);
  });

  it("applies vertical orientation by default", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".vc-field--vertical").exists()).toBe(true);
  });

  it("applies horizontal orientation", () => {
    const wrapper = mountComponent({ orientation: "horizontal" });
    expect(wrapper.find(".vc-field--horizontal").exists()).toBe(true);
  });

  it("renders label when provided", () => {
    const wrapper = mountComponent({ label: "Name" });
    expect(wrapper.find(".stub-label").exists()).toBe(true);
    expect(wrapper.find(".stub-label").text()).toContain("Name");
  });

  it("does not render label when not provided", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".stub-label").exists()).toBe(false);
  });

  it("passes modelValue to field type", () => {
    const wrapper = mountComponent({ modelValue: "Test value" });
    expect(wrapper.find(".vc-field__text").text()).toBe("Test value");
  });

  it("renders copy button when copyable is true", () => {
    const wrapper = mountComponent({ copyable: true });
    expect(wrapper.findComponent({ name: "VcButton" }).exists()).toBe(true);
  });

  it("does not render copy button when copyable is false", () => {
    const wrapper = mountComponent({ copyable: false });
    expect(wrapper.findComponent({ name: "VcButton" }).exists()).toBe(false);
  });

  it("renders with type prop", () => {
    const wrapper = mountComponent({ type: "date", modelValue: "2024-01-01" });
    expect(wrapper.find(".vc-field").exists()).toBe(true);
  });

  it("reserves an empty label track in horizontal mode when label is omitted", () => {
    const wrapper = mountComponent({ orientation: "horizontal" });
    expect(wrapper.find(".vc-field__label--empty").exists()).toBe(true);
    expect(wrapper.find(".stub-label").exists()).toBe(false);
  });

  it("does not reserve a label track in vertical mode when label is omitted", () => {
    const wrapper = mountComponent({ orientation: "vertical" });
    expect(wrapper.find(".vc-field__label").exists()).toBe(false);
  });

  describe('type "datetime"', () => {
    const value = new Date(2026, 10, 19, 10, 18, 42);

    it("shows the date with its time in the browser's format by default", () => {
      const wrapper = mountComponent({ type: "datetime", modelValue: value });
      const expected = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(value);
      expect(wrapper.find(".vc-field__text").text()).toBe(expected);
    });

    it("puts the full date and time with seconds in the title", () => {
      const wrapper = mountComponent({ type: "datetime", modelValue: value });
      const expected = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "medium" }).format(value);
      expect(wrapper.find(".vc-field__text").attributes("title")).toBe(expected);
    });

    it("parses an ISO string", () => {
      const wrapper = mountComponent({ type: "datetime", modelValue: value.toISOString() });
      const expected = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(value);
      expect(wrapper.find(".vc-field__text").text()).toBe(expected);
    });

    it("uses the host's formatter when one is provided", () => {
      const formatDateTime = vi.fn((_value: unknown, options?: Intl.DateTimeFormatOptions) =>
        options?.timeStyle === "medium" ? "full" : "host",
      );
      const wrapper = mount(VcField as any, {
        props: { type: "datetime", modelValue: value },
        global: { provide: { [DateTimeFormatKey as symbol]: { formatDateTime } }, stubs: { VcButton: true } },
      });
      expect(wrapper.find(".vc-field__text").text()).toBe("host");
      expect(wrapper.find(".vc-field__text").attributes("title")).toBe("full");
      expect(formatDateTime).toHaveBeenCalledWith(value, { dateStyle: "medium", timeStyle: "short" });
    });

    it('shows "N/A" and no title without a value', () => {
      const wrapper = mountComponent({ type: "datetime" });
      expect(wrapper.find(".vc-field__text").text()).toBe("N/A");
      expect(wrapper.find(".vc-field__text").attributes("title")).toBeUndefined();
    });

    it("leaves type date without the time", () => {
      const wrapper = mountComponent({ type: "date", modelValue: value });
      expect(wrapper.find(".vc-field__text").text()).toBe(value.toLocaleDateString());
      expect(wrapper.find(".vc-field__text").attributes("title")).toBeUndefined();
    });
  });
});
