import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import CellDate from "./CellDate.vue";
import { DateTimeFormatKey } from "@framework/injection-keys";
import type { DateTimeFormatter } from "@core/utilities/date";

const value = new Date(2026, 10, 19, 10, 18, 42);
const intl = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(undefined, options).format(value);

const cell = (props: Record<string, unknown>, formatter?: DateTimeFormatter) =>
  mount(CellDate, {
    props,
    global: { provide: formatter ? { [DateTimeFormatKey as symbol]: formatter } : {} },
  });

describe("CellDate", () => {
  describe("date-time", () => {
    it("shows the date with the time under it", () => {
      const wrapper = cell({ value, variant: "date-time" });
      expect(wrapper.find(".vc-table-cell-date__date").text()).toBe(intl({ dateStyle: "medium" }));
      expect(wrapper.find(".vc-table-cell-date__time").text()).toBe(intl({ timeStyle: "short" }));
    });

    it("puts the full date and time with seconds in the title", () => {
      const wrapper = cell({ value, variant: "date-time" });
      expect(wrapper.attributes("title")).toBe(intl({ dateStyle: "medium", timeStyle: "medium" }));
    });

    it("parses an ISO string", () => {
      const wrapper = cell({ value: value.toISOString(), variant: "date-time" });
      expect(wrapper.find(".vc-table-cell-date__date").text()).toBe(intl({ dateStyle: "medium" }));
    });

    it("shows one line when inline (mobile cards)", () => {
      const wrapper = cell({ value, variant: "date-time", inline: true });
      expect(wrapper.find(".vc-table-cell-date__time").exists()).toBe(false);
      expect(wrapper.text()).toBe(intl({ dateStyle: "medium", timeStyle: "short" }));
      expect(wrapper.attributes("title")).toBe(intl({ dateStyle: "medium", timeStyle: "medium" }));
    });

    it("uses the host's formatter when one is provided", () => {
      const formatter: DateTimeFormatter = {
        formatDateTime: (_value, options) => (options?.dateStyle ? "D" : "") + (options?.timeStyle ?? ""),
      };
      const wrapper = cell({ value, variant: "date-time" }, formatter);
      expect(wrapper.find(".vc-table-cell-date__date").text()).toBe("D");
      expect(wrapper.find(".vc-table-cell-date__time").text()).toBe("short");
      expect(wrapper.attributes("title")).toBe("Dmedium");
    });

    it("keeps a custom format on one line", () => {
      const wrapper = cell({ value, variant: "date-time", format: "YYYY-MM-DD HH:mm" });
      expect(wrapper.text()).toBe("2026-11-19 10:18");
      expect(wrapper.attributes("title")).toBeUndefined();
    });

    it("shows an unparsable value as it is", () => {
      const wrapper = cell({ value: "not a date", variant: "date-time" });
      expect(wrapper.text()).toBe("not a date");
    });
  });

  it("leaves the date variant without the time", () => {
    const wrapper = cell({ value, variant: "date" });
    expect(wrapper.text()).toBe(value.toLocaleDateString(window.navigator.language));
    expect(wrapper.attributes("title")).toBeUndefined();
  });
});
