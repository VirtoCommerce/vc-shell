import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VcCard from "./vc-card.vue";

describe("VcCard", () => {
  const mountCard = (props = {}, slots = {}) =>
    mount(VcCard as any, {
      props,
      slots,
      global: { stubs: { VcIcon: true } },
    });

  it("renders default slot content", () => {
    const w = mountCard({}, { default: "Card body" });
    expect(w.find(".vc-card__body").text()).toBe("Card body");
  });

  it("renders header when prop provided", () => {
    const w = mountCard({ header: "Title" }, { default: "Body" });
    expect(w.find(".vc-card__title").text()).toBe("Title");
  });

  it("does not render header when prop missing", () => {
    const w = mountCard({}, { default: "Body" });
    expect(w.find(".vc-card__header").exists()).toBe(false);
  });

  it("applies variant class", () => {
    const w = mountCard({ variant: "danger" }, { default: "x" });
    expect(w.find(".vc-card--danger").exists()).toBe(true);
  });

  it("emits header:click on header click", async () => {
    const w = mountCard({ header: "Title" }, { default: "Body" });
    await w.find(".vc-card__header").trigger("click");
    expect(w.emitted("header:click")).toHaveLength(1);
  });

  it("toggles collapse on header click when collapsable", async () => {
    const w = mountCard({ header: "T", isCollapsable: true }, { default: "B" });
    expect(w.find(".vc-card--collapsable").exists()).toBe(true);
    await w.find(".vc-card__header").trigger("click");
    expect(w.emitted("state:collapsed")).toBeTruthy();
  });

  it("sets aria-expanded when collapsable", () => {
    const w = mountCard({ header: "T", isCollapsable: true }, { default: "B" });
    expect(w.find(".vc-card__header").attributes("aria-expanded")).toBeDefined();
  });
});
