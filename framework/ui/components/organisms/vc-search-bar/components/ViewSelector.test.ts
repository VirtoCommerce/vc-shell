import { afterEach, describe, expect, it } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import ViewSelector from "./ViewSelector.vue";
import { K, makeViews, stopViews, viewsGlobal } from "./views.test-helpers";
import type { ViewsApi } from "../composables/useViews";

const wrappers: VueWrapper[] = [];
afterEach(() => {
  wrappers.splice(0).forEach((w) => w.unmount());
  stopViews();
});

function mountSelector(views: ViewsApi, props: Record<string, unknown> = {}) {
  const w = mount(ViewSelector, { props: { views, ...props }, global: viewsGlobal, attachTo: document.body });
  wrappers.push(w);
  return w;
}

const trigger = (w: VueWrapper) => w.get(".vc-search-bar__view-btn");
const rows = (w: VueWrapper) => w.findAll(".vc-search-bar__view-item");
const byText = (w: VueWrapper, text: string) => w.findAll("button").find((b) => b.text() === text);

async function open(w: VueWrapper) {
  await trigger(w).trigger("click");
}

describe("ViewSelector", () => {
  it("shows the current view name and a Modified badge only when the filters differ", async () => {
    const { views, setValues } = makeViews();
    const w = mountSelector(views);
    expect(trigger(w).text()).toContain("All");
    expect(w.find(".vc-search-bar__view-badge").exists()).toBe(false);
    expect(trigger(w).attributes("aria-label")).toBe(`${K}SELECTOR:All`);

    setValues({ urgent: true });
    await nextTick();
    expect(w.get(".vc-search-bar__view-badge").text()).toBe(`${K}MODIFIED`);
    expect(trigger(w).attributes("aria-label")).toBe(`${K}SELECTOR:All, ${K}MODIFIED`);
  });

  it("lists the views with a check on the current one", async () => {
    const { views } = makeViews();
    views.select("paid");
    const w = mountSelector(views);
    expect(w.find(".popover-stub").exists()).toBe(false);
    await open(w);
    expect(trigger(w).attributes("aria-expanded")).toBe("true");
    expect(w.text()).toContain(`${K}SAVED_VIEWS`);
    expect(rows(w).map((r) => r.text())).toEqual(["All", "Paid"]);
    expect(rows(w).map((r) => r.attributes("aria-current"))).toEqual([undefined, "true"]);
    expect(rows(w)[1].find(".vc-search-bar__view-check--on").exists()).toBe(true);
    expect(rows(w)[0].find(".vc-search-bar__view-check--on").exists()).toBe(false);
  });

  it("shows counts only when given", async () => {
    const { views } = makeViews();
    const w = mountSelector(views);
    await open(w);
    expect(w.find(".vc-search-bar__view-count").exists()).toBe(false);

    const c = mountSelector(views, { counts: { paid: 12 } });
    await open(c);
    expect(rows(c)[1].get(".vc-search-bar__view-count").text()).toBe("12");
    expect(rows(c)[0].find(".vc-search-bar__view-count").exists()).toBe(false);
  });

  it("selects a view, closes the menu and returns focus to the button", async () => {
    const { views, state } = makeViews();
    const w = mountSelector(views);
    await open(w);
    await rows(w)[1].trigger("click");
    expect(views.current.value.id).toBe("paid");
    expect(state.value.values).toEqual({ status: ["paid"] });
    expect(w.find(".popover-stub").exists()).toBe(false);
    await nextTick();
    expect(document.activeElement).toBe(trigger(w).element);
  });

  it("closes from the popover and refocuses the button", async () => {
    const { views } = makeViews();
    const w = mountSelector(views);
    await open(w);
    await w.findComponent({ name: "VcPopover" }).vm.$emit("update:show", false);
    await nextTick();
    expect(w.find(".popover-stub").exists()).toBe(false);
    expect(document.activeElement).toBe(trigger(w).element);
  });

  it("has no modified section while the filters match the view", async () => {
    const { views } = makeViews();
    const w = mountSelector(views);
    await open(w);
    expect(w.find(".vc-search-bar__views-modified").exists()).toBe(false);
  });

  it("modified section saves changes and reverts through the API", async () => {
    const { views, state, setValues } = makeViews();
    views.select("paid");
    setValues({ status: ["new"] });
    const w = mountSelector(views);
    await open(w);
    expect(w.find(".vc-search-bar__views-modified").exists()).toBe(true);

    await byText(w, `${K}SAVE_CHANGES:Paid`)!.trigger("click");
    expect(views.current.value.values).toEqual({ status: ["new"] });
    expect(views.modified.value).toBe(false);
    expect(w.find(".popover-stub").exists()).toBe(false);

    setValues({ urgent: true });
    await open(w);
    await byText(w, `${K}REVERT:Paid`)!.trigger("click");
    expect(state.value.values).toEqual({ status: ["new"] });
    expect(views.modified.value).toBe(false);
  });

  it("the system view offers no Save changes", async () => {
    const { views, setValues } = makeViews();
    setValues({ urgent: true });
    const w = mountSelector(views);
    await open(w);
    expect(byText(w, `${K}SAVE_CHANGES:All`)).toBeUndefined();
    expect(byText(w, `${K}SAVE_AS_NEW`)).toBeDefined();
    expect(byText(w, `${K}REVERT:All`)).toBeDefined();
  });

  it("Save as new view names inline: empty is disabled, Enter saves", async () => {
    const { views, setValues } = makeViews();
    setValues({ urgent: true });
    const w = mountSelector(views);
    await open(w);
    await byText(w, `${K}SAVE_AS_NEW`)!.trigger("click");
    const input = w.get(".vc-search-bar__views-modified input");
    expect(document.activeElement).toBe(input.element);
    expect(byText(w, `${K}SAVE`)!.attributes("disabled")).toBeDefined();

    await input.setValue("Urgent only");
    expect(byText(w, `${K}SAVE`)!.attributes("disabled")).toBeUndefined();
    await input.trigger("keydown", { key: "Enter" });
    expect(views.current.value).toMatchObject({ name: "Urgent only", scope: "user", values: { urgent: true } });
    expect(w.find(".popover-stub").exists()).toBe(false);
    await nextTick();
    expect(document.activeElement).toBe(trigger(w).element);
  });

  it("Esc in the name field cancels naming without closing the menu", async () => {
    const { views, setValues } = makeViews();
    setValues({ urgent: true });
    const w = mountSelector(views);
    await open(w);
    await byText(w, `${K}SAVE_AS_NEW`)!.trigger("click");
    const input = w.get(".vc-search-bar__views-modified input");
    await input.setValue("x");
    await input.trigger("keydown", { key: "Escape" });
    expect(w.find(".vc-search-bar__views-modified input").exists()).toBe(false);
    expect(byText(w, `${K}SAVE_AS_NEW`)).toBeDefined();
    expect(w.find(".popover-stub").exists()).toBe(true);
    expect(views.all.value).toHaveLength(2);
    await nextTick();
    expect(document.activeElement).toBe(byText(w, `${K}SAVE_AS_NEW`)!.element);
  });

  it("cancelling a rename returns focus to the view's options button", async () => {
    const { views, setValues } = makeViews();
    setValues({ urgent: true });
    views.saveAs("Mine");
    const w = mountSelector(views);
    await open(w);
    await w.get(".vc-search-bar__view-more").trigger("click");
    await byText(w, `${K}RENAME`)!.trigger("click");
    await w.get(".vc-search-bar__view-row input").trigger("keydown", { key: "Escape" });
    expect(w.find(".popover-stub").exists()).toBe(true);
    await nextTick();
    expect(document.activeElement).toBe(w.get(".vc-search-bar__view-more").element);
  });

  it("offers Rename and Delete only on user views", async () => {
    const { views, setValues } = makeViews();
    setValues({ urgent: true });
    views.saveAs("Mine");
    const w = mountSelector(views);
    await open(w);
    const more = w.findAll(".vc-search-bar__view-more");
    expect(more).toHaveLength(1);
    expect(more[0].attributes("aria-label")).toBe(`${K}OPTIONS:Mine`);
    expect(more[0].attributes("aria-expanded")).toBe("false");
    await more[0].trigger("click");
    expect(more[0].attributes("aria-expanded")).toBe("true");
    expect(byText(w, `${K}RENAME`)).toBeDefined();
    expect(byText(w, `${K}DELETE`)).toBeDefined();
  });

  it("renames a user view inline", async () => {
    const { views, setValues } = makeViews();
    setValues({ urgent: true });
    views.saveAs("Mine");
    const w = mountSelector(views);
    await open(w);
    await w.get(".vc-search-bar__view-more").trigger("click");
    await byText(w, `${K}RENAME`)!.trigger("click");
    const input = w.get(".vc-search-bar__view-row input");
    expect((input.element as HTMLInputElement).value).toBe("Mine");
    expect(document.activeElement).toBe(input.element);

    await input.trigger("keydown", { key: "Escape" });
    expect(w.find(".vc-search-bar__view-row input").exists()).toBe(false);
    expect(views.current.value.name).toBe("Mine");

    await w.get(".vc-search-bar__view-more").trigger("click");
    await byText(w, `${K}RENAME`)!.trigger("click");
    await w.get(".vc-search-bar__view-row input").setValue("Ours");
    await w.get(".vc-search-bar__view-row input").trigger("keydown", { key: "Enter" });
    expect(views.current.value.name).toBe("Ours");
    expect(w.find(".popover-stub").exists()).toBe(false);
  });

  it("deletes a user view", async () => {
    const { views, setValues } = makeViews();
    setValues({ urgent: true });
    views.saveAs("Mine");
    const w = mountSelector(views);
    await open(w);
    await w.get(".vc-search-bar__view-more").trigger("click");
    await byText(w, `${K}DELETE`)!.trigger("click");
    expect(views.all.value.map((v) => v.name)).toEqual(["All", "Paid"]);
    expect(views.current.value.id).toBe("all");
    await nextTick();
    expect(document.activeElement).toBe(trigger(w).element);
  });

  it("does not open when disabled", async () => {
    const { views } = makeViews();
    const w = mountSelector(views, { disabled: true });
    expect(trigger(w).attributes("disabled")).toBeDefined();
    await open(w);
    expect(w.find(".popover-stub").exists()).toBe(false);
  });
});
