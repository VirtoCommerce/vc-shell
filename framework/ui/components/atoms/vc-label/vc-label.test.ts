import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VcLabel from "./vc-label.vue";

describe("VcLabel", () => {
  const mountLabel = (props = {}, slots = {}) =>
    mount(VcLabel as any, {
      props,
      slots: { default: "Field name", ...slots },
      global: { stubs: { VcIcon: true, VcTooltip: true } },
    });

  it("renders slot content", () => {
    const w = mountLabel();
    expect(w.find(".vc-label__content").text()).toBe("Field name");
  });

  it("renders as div by default", () => {
    const w = mountLabel();
    expect(w.element.tagName).toBe("DIV");
  });

  it("renders as label when htmlFor provided", () => {
    const w = mountLabel({ htmlFor: "input-1" });
    expect(w.element.tagName).toBe("LABEL");
    expect(w.attributes("for")).toBe("input-1");
  });

  it("shows required asterisk", () => {
    const w = mountLabel({ required: true });
    expect(w.find(".vc-label__required").text()).toBe("*");
  });

  it("does not show asterisk when not required", () => {
    const w = mountLabel();
    expect(w.find(".vc-label__required").exists()).toBe(false);
  });

  it("applies error class", () => {
    const w = mountLabel({ error: true });
    expect(w.find(".vc-label--error").exists()).toBe(true);
  });

  it("shows language badge when multilanguage", () => {
    const w = mountLabel({ multilanguage: true, currentLanguage: "EN" });
    expect(w.find(".vc-label__language").text()).toBe("EN");
  });
});
