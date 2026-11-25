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

  it("leaves a click on a button in the actions to that button", async () => {
    const w = mountCard(
      { header: "T", isCollapsable: true },
      { default: "B", actions: '<button class="add">Add</button>' },
    );
    await w.find(".add").trigger("click");
    expect(w.emitted("state:collapsed")).toBeUndefined();
    expect(w.emitted("header:click")).toBeUndefined();
  });

  it("lets Enter and Space reach a button in the actions", async () => {
    const w = mountCard(
      { header: "T", isCollapsable: true },
      { default: "B", actions: '<button class="add">Add</button>' },
    );
    const enter = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    const space = new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true });
    w.find(".add").element.dispatchEvent(enter);
    w.find(".add").element.dispatchEvent(space);
    expect(enter.defaultPrevented).toBe(false);
    expect(space.defaultPrevented).toBe(false);
    expect(w.emitted("state:collapsed")).toBeUndefined();
  });

  it("toggles from the keyboard on the header itself", async () => {
    const w = mountCard({ header: "T", isCollapsable: true }, { default: "B" });
    await w.find(".vc-card__header").trigger("keydown", { key: "Enter" });
    await w.find(".vc-card__header").trigger("keydown", { key: " " });
    expect(w.emitted("state:collapsed")).toHaveLength(2);
  });

  it("sets aria-expanded when collapsable", () => {
    const w = mountCard({ header: "T", isCollapsable: true }, { default: "B" });
    expect(w.find(".vc-card__header").attributes("aria-expanded")).toBeDefined();
  });

  it("applies fill modifier to body-wrapper when fill=true", () => {
    const w = mountCard({ fill: true }, { default: "B" });
    expect(w.find(".vc-card__body-wrapper--fill").exists()).toBe(true);
  });

  it("does not apply fill modifier when fill is falsy", () => {
    const w = mountCard({}, { default: "B" });
    expect(w.find(".vc-card__body-wrapper--fill").exists()).toBe(false);
  });
});
