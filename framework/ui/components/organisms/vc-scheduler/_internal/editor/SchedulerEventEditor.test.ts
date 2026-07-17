import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import SchedulerEventEditor from "./SchedulerEventEditor.vue";
import type { IEventDraft } from "../../types";

const t = { $t: (k: string) => k };
const VcPopupStub = {
  name: "VcPopup",
  props: ["modelValue", "title"],
  emits: ["update:modelValue"],
  template: `<div v-if="modelValue"><slot name="content"/><slot name="footer" :close="() => {}"/><slot/></div>`,
};

function draft(over: Partial<IEventDraft> = {}): IEventDraft {
  return { title: "", start: new Date(2021, 0, 13, 9, 0), end: new Date(2021, 0, 13, 10, 0), allDay: false, ...over };
}
function mountEditor(props = {}) {
  return mount(SchedulerEventEditor, {
    props: { open: true, draft: draft(), mode: "create", ...props },
    global: { mocks: t, stubs: { VcPopup: VcPopupStub, VcSelect: true, teleport: true } },
  });
}

describe("SchedulerEventEditor", () => {
  it("renders create title in create mode", () => {
    const w = mountEditor({ mode: "create" });
    expect(w.html()).toContain("VC_SCHEDULER.NEW_EVENT");
  });
  it("emits save with the edited draft", async () => {
    const w = mountEditor({ draft: draft({ title: "Promo" }) });
    // find the title input, set a value, click save
    const input = w.find("input");
    await input.setValue("Summer Promo");
    await w.find("[data-test='editor-save']").trigger("click");
    const ev = w.emitted("save");
    expect(ev).toBeTruthy();
    expect((ev![0][0] as IEventDraft).title).toBe("Summer Promo");
  });
  it("disables save when title is empty", () => {
    const w = mountEditor({ draft: draft({ title: "" }) });
    expect(w.find("[data-test='editor-save']").attributes("disabled")).toBeDefined();
  });
  it("shows delete only in edit mode and emits it", async () => {
    const w = mountEditor({ mode: "edit", draft: draft({ id: "e1", title: "X" }) });
    await w.find("[data-test='editor-delete']").trigger("click");
    expect(w.emitted("delete")![0][0]).toEqual({ id: "e1" });
  });

  it("drops a stale id when the draft prop switches from edit (with id) to create (no id)", async () => {
    const w = mountEditor({ mode: "edit", draft: draft({ id: "e1", title: "Existing" }) });
    await w.setProps({ mode: "create", draft: draft({ title: "New" }) });
    await w.find("[data-test='editor-save']").trigger("click");
    const ev = w.emitted("save");
    expect(ev).toBeTruthy();
    expect((ev![0][0] as IEventDraft).id).toBeUndefined();
    expect((ev![0][0] as IEventDraft).title).toBe("New");
  });

  it("shows recurrence fields only when a frequency is chosen", async () => {
    const w = mountEditor({ draft: draft({ recurrence: null }) });
    expect(w.find("[data-test='recur-interval']").exists()).toBe(false);
    await w.setProps({
      draft: draft({ recurrence: { freq: "weekly", interval: 1, byWeekday: [1], end: { type: "never" } } }),
    });
    expect(w.find("[data-test='recur-interval']").exists()).toBe(true);
    expect(w.findAll("[data-test='recur-weekday']").length).toBe(7);
  });

  it("emits save with the edited recurrence rule", async () => {
    const w = mountEditor({
      draft: draft({ title: "X", recurrence: { freq: "daily", interval: 2, end: { type: "count", count: 5 } } }),
    });
    await w.find("[data-test='editor-save']").trigger("click");
    const saved = w.emitted("save")![0][0] as { recurrence: unknown };
    expect(saved.recurrence).toEqual({ freq: "daily", interval: 2, end: { type: "count", count: 5 } });
  });

  it("renders the Repeat control by default (allowRecurrence true)", () => {
    const w = mountEditor();
    expect(w.find("[data-test='editor-repeat']").exists()).toBe(true);
  });

  it("hides the Repeat control entirely when allowRecurrence is false", () => {
    const w = mountEditor({ allowRecurrence: false });
    expect(w.find("[data-test='editor-repeat']").exists()).toBe(false);
  });

  it("hides the Repeat control when allowRecurrence is false even if the draft carries a recurrence rule", () => {
    const w = mountEditor({
      allowRecurrence: false,
      draft: draft({ recurrence: { freq: "weekly", interval: 1, byWeekday: [1], end: { type: "never" } } }),
    });
    expect(w.find("[data-test='editor-repeat']").exists()).toBe(false);
    expect(w.find("[data-test='recur-interval']").exists()).toBe(false);
  });

  it("emits delete without an id when editing a draft with no id (routing is the parent's responsibility)", async () => {
    const w = mountEditor({ mode: "edit", draft: draft({ title: "X" }) });
    await w.find("[data-test='editor-delete']").trigger("click");
    expect(w.emitted("delete")![0][0]).toEqual({ id: undefined });
  });

  it("hides the color field by default and shows it when allowColor is true", () => {
    expect(mountEditor().find("[data-test='editor-color']").exists()).toBe(false);
    expect(mountEditor({ allowColor: true }).find("[data-test='editor-color']").exists()).toBe(true);
  });
});
