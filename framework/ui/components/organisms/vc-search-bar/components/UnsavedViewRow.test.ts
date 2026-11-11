import { afterEach, describe, expect, it } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import UnsavedViewRow from "./UnsavedViewRow.vue";
import { K, makeViews, stopViews, viewsGlobal } from "./views.test-helpers";
import type { ViewsApi } from "../composables/useViews";

const wrappers: VueWrapper[] = [];
afterEach(() => {
  wrappers.splice(0).forEach((w) => w.unmount());
  stopViews();
});

function mountRow(views: ViewsApi, touch = false) {
  const w = mount(UnsavedViewRow, { props: { views, touch }, global: viewsGlobal, attachTo: document.body });
  wrappers.push(w);
  return w;
}

const ROW = ".vc-search-bar__unsaved";
const byText = (w: VueWrapper, text: string) => w.findAll("button").find((b) => b.text() === text);

describe("UnsavedViewRow", () => {
  it("renders only while the filters differ from the current view", async () => {
    const { views, setValues } = makeViews();
    const w = mountRow(views);
    expect(w.find(ROW).exists()).toBe(false);
    setValues({ urgent: true });
    await nextTick();
    expect(w.get(ROW).text()).toContain(`${K}UNSAVED`);
  });

  it("the system view has no Save, only revert and Save as view", async () => {
    const { views, setValues } = makeViews();
    setValues({ urgent: true });
    const w = mountRow(views);
    expect(byText(w, `${K}SAVE`)).toBeUndefined();
    expect(w.find(`[aria-label="${K}REVERT:All"]`).exists()).toBe(true);
    expect(byText(w, `${K}SAVE_AS_VIEW`)).toBeDefined();
  });

  it("Save stores the changes into a module view", async () => {
    const { views, setValues } = makeViews();
    views.select("paid");
    setValues({ status: ["new"] });
    const w = mountRow(views);
    await byText(w, `${K}SAVE`)!.trigger("click");
    expect(views.current.value.values).toEqual({ status: ["new"] });
    expect(w.find(ROW).exists()).toBe(false);
  });

  it("revert restores the view's filters", async () => {
    const { views, state, setValues } = makeViews();
    views.select("paid");
    setValues({ urgent: true });
    const w = mountRow(views);
    await w.get(`[aria-label="${K}REVERT:Paid"]`).trigger("click");
    expect(state.value.values).toEqual({ status: ["paid"] });
    expect(w.find(ROW).exists()).toBe(false);
  });

  it("Save as view replaces the row with a name field; empty is disabled, Enter saves", async () => {
    const { views, setValues } = makeViews();
    setValues({ urgent: true });
    const w = mountRow(views);
    await byText(w, `${K}SAVE_AS_VIEW`)!.trigger("click");
    expect(w.text()).not.toContain(`${K}UNSAVED`);
    const input = w.get(`${ROW} input`);
    expect(document.activeElement).toBe(input.element);
    expect(byText(w, `${K}CANCEL`)).toBeDefined();
    expect(byText(w, `${K}SAVE`)!.attributes("disabled")).toBeDefined();

    await input.setValue("  ");
    await input.trigger("keydown", { key: "Enter" });
    expect(views.all.value).toHaveLength(2);

    await input.setValue("Urgent");
    expect(byText(w, `${K}SAVE`)!.attributes("disabled")).toBeUndefined();
    await input.trigger("keydown", { key: "Enter" });
    expect(views.current.value).toMatchObject({ name: "Urgent", scope: "user" });
    expect(w.find(ROW).exists()).toBe(false);
  });

  it("Esc and Cancel leave naming and refocus Save as view", async () => {
    const { views, setValues } = makeViews();
    setValues({ urgent: true });
    const w = mountRow(views);
    await byText(w, `${K}SAVE_AS_VIEW`)!.trigger("click");
    await w.get(`${ROW} input`).trigger("keydown", { key: "Escape" });
    expect(w.find(`${ROW} input`).exists()).toBe(false);
    await nextTick();
    expect(document.activeElement).toBe(byText(w, `${K}SAVE_AS_VIEW`)!.element);

    await byText(w, `${K}SAVE_AS_VIEW`)!.trigger("click");
    await byText(w, `${K}CANCEL`)!.trigger("click");
    expect(w.find(`${ROW} input`).exists()).toBe(false);
    expect(views.all.value).toHaveLength(2);
  });

  it("Enter on Cancel cancels", async () => {
    const { views, setValues } = makeViews();
    setValues({ urgent: true });
    const w = mountRow(views);
    await byText(w, `${K}SAVE_AS_VIEW`)!.trigger("click");
    await w.get(`${ROW} input`).setValue("Urgent");
    const cancel = byText(w, `${K}CANCEL`)!;
    const enter = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    cancel.element.dispatchEvent(enter);
    await nextTick();
    expect(views.all.value).toHaveLength(2);
    // Left alone, so the browser turns it into the button's click
    expect(enter.defaultPrevented).toBe(false);
    await cancel.trigger("click");
    expect(views.all.value).toHaveLength(2);
    expect(w.find(`${ROW} input`).exists()).toBe(false);
  });

  it("the revert icon is 14px, 16px and labelled with touch", async () => {
    const { views, setValues } = makeViews();
    setValues({ urgent: true });
    const revert = (w: VueWrapper) => w.get(".vc-search-bar__unsaved-revert");
    const icon = (w: VueWrapper) => revert(w).getComponent({ name: "VcIcon" });
    const desktop = mountRow(views, false);
    expect(icon(desktop).props("icon")).toBe("lucide-rotate-ccw");
    expect(icon(desktop).props("customSize")).toBe(14);
    expect(revert(desktop).text()).toBe("");
    const touch = mountRow(views, true);
    expect(icon(touch).props("customSize")).toBe(16);
    expect(revert(touch).text()).toBe(`${K}REVERT_SHORT`);
  });

  it("touch marks the row for bigger hit targets", async () => {
    const { views, setValues } = makeViews();
    setValues({ urgent: true });
    expect(mountRow(views, true).get(ROW).classes()).toContain("vc-search-bar__unsaved--touch");
    expect(mountRow(views, false).get(ROW).classes()).not.toContain("vc-search-bar__unsaved--touch");
  });
});
