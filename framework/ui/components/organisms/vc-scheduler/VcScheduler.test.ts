import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mount, config } from "@vue/test-utils";
import VcScheduler from "@ui/components/organisms/vc-scheduler/VcScheduler.vue";
import type { IEventDraft, ISchedulerEvent } from "@ui/components/organisms/vc-scheduler/types";

// The built-in editor renders a real VcPopup, whose HeadlessUI Dialog uses ResizeObserver
// internally; jsdom has none, so provide a no-op stub (mirrors vc-popup.a11y.test.ts).
// The editor's VcSelect (color) throws in its mounted hook under jsdom (floating-ui /
// observers), so stub it globally for this file — no test asserts on the color select.
beforeAll(() => {
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
  config.global.stubs = { ...config.global.stubs, VcSelect: true };
});
afterAll(() => {
  const stubs = config.global.stubs as Record<string, unknown>;
  delete stubs.VcSelect;
});

const events = [
  {
    id: "a",
    title: "Sale",
    start: new Date("2026-07-06T00:00:00Z"),
    end: new Date("2026-07-09T00:00:00Z"),
    allDay: true,
  },
];
const t = { $t: (k: string, p?: { count?: number }) => (p?.count != null ? `+${p.count} more` : k) };

describe("VcScheduler shell", () => {
  it("renders the Month view by default with the toolbar title", () => {
    const w = mount(VcScheduler, {
      props: { events, date: new Date("2026-07-15T00:00:00Z") },
      global: { mocks: t },
    });
    expect(w.findComponent({ name: "SchedulerMonthView" }).exists()).toBe(true);
    expect(w.find(".vc-scheduler__toolbar").text()).toContain("2026");
  });

  it("emits update:view when the view switch changes", async () => {
    const w = mount(VcScheduler, {
      props: { events, date: new Date("2026-07-15T00:00:00Z") },
      global: { mocks: t },
    });
    await w.findComponent({ name: "SchedulerToolbar" }).vm.$emit("update:view", "timeline-day");
    expect(w.emitted("update:view")![0]).toEqual(["timeline-day"]);
  });

  it("emits update:date on next", async () => {
    const w = mount(VcScheduler, {
      props: { events, date: new Date("2026-07-15T00:00:00Z") },
      global: { mocks: t },
    });
    await w.findComponent({ name: "SchedulerToolbar" }).vm.$emit("next");
    expect(w.emitted("update:date")).toBeTruthy();
  });

  it("forwards event-click from the month view", async () => {
    const w = mount(VcScheduler, {
      props: { events, date: new Date("2026-07-15T00:00:00Z") },
      global: { mocks: t },
    });
    await w.findComponent({ name: "SchedulerMonthView" }).vm.$emit("event-click", events[0]);
    expect(w.emitted("event-click")![0]).toEqual([events[0]]);
  });

  it("forwards event-delete from the month view", async () => {
    const w = mount(VcScheduler, {
      props: { events, date: new Date("2026-07-15T00:00:00Z") },
      global: { mocks: t },
    });
    const monthView = w.findComponent({ name: "SchedulerMonthView" });
    await monthView.vm.$emit("event-delete", { id: "a" });
    // A one-off delete is gated by a confirm dialog; nothing is emitted until confirmed.
    const confirm = w.findComponent({ name: "ConfirmDialog" });
    expect(confirm.props("open")).toBe(true);
    expect(w.emitted("event-delete")).toBeFalsy();
    await confirm.vm.$emit("confirm");
    expect(w.emitted("event-delete")![0]).toEqual([{ id: "a" }]);
  });

  it("cancelling the delete confirm emits nothing and closes the dialog", async () => {
    const w = mount(VcScheduler, {
      props: { events, date: new Date("2026-07-15T00:00:00Z") },
      global: { mocks: t },
    });
    const monthView = w.findComponent({ name: "SchedulerMonthView" });
    await monthView.vm.$emit("event-delete", { id: "a" });
    const confirm = w.findComponent({ name: "ConfirmDialog" });
    await confirm.vm.$emit("close");
    expect(confirm.props("open")).toBe(false);
    expect(w.emitted("event-delete")).toBeFalsy();
  });

  it("opens the editor in create mode from the toolbar New event button", async () => {
    const w = mount(VcScheduler, {
      props: { events, date: new Date("2026-07-15T00:00:00Z"), editable: true },
      global: { mocks: t },
    });
    await w.findComponent({ name: "SchedulerToolbar" }).vm.$emit("create");
    const editor = w.findComponent({ name: "SchedulerEventEditor" });
    expect(editor.props("open")).toBe(true);
    expect(editor.props("mode")).toBe("create");
    const draft = editor.props("draft") as { allDay: boolean };
    expect(draft.allDay).toBe(true);
  });

  it("shows the skeleton when loading with no events, and the view otherwise", async () => {
    const w = mount(VcScheduler, {
      props: { events: [], date: new Date("2026-07-15T00:00:00Z"), loading: true },
      global: { mocks: t },
    });
    expect(w.findComponent({ name: "SchedulerSkeleton" }).exists()).toBe(true);
    expect(w.findComponent({ name: "SchedulerMonthView" }).exists()).toBe(false);

    // Once events arrive, the skeleton yields to the view even while still loading (refresh).
    await w.setProps({ events });
    expect(w.findComponent({ name: "SchedulerSkeleton" }).exists()).toBe(false);
    expect(w.findComponent({ name: "SchedulerMonthView" }).exists()).toBe(true);
  });

  it("does not show the skeleton when not loading, even with no events", () => {
    const w = mount(VcScheduler, {
      props: { events: [], date: new Date("2026-07-15T00:00:00Z"), loading: false },
      global: { mocks: t },
    });
    expect(w.findComponent({ name: "SchedulerSkeleton" }).exists()).toBe(false);
    expect(w.findComponent({ name: "SchedulerMonthView" }).exists()).toBe(true);
  });

  it("defaults quickInfo to true and forwards it to the month view", () => {
    const w = mount(VcScheduler, {
      props: { events, date: new Date("2026-07-15T00:00:00Z") },
      global: { mocks: t },
    });
    expect(w.findComponent({ name: "SchedulerMonthView" }).props("quickInfo")).toBe(true);
  });

  it("forwards quickInfo: false to the month view", () => {
    const w = mount(VcScheduler, {
      props: { events, date: new Date("2026-07-15T00:00:00Z"), quickInfo: false },
      global: { mocks: t },
    });
    expect(w.findComponent({ name: "SchedulerMonthView" }).props("quickInfo")).toBe(false);
  });

  it("expands a recurring master into multiple occurrences passed to the month view", () => {
    const master = {
      id: "m1",
      title: "Standup",
      start: new Date(2026, 6, 6, 9, 0),
      end: new Date(2026, 6, 6, 9, 30),
      recurrence: "FREQ=WEEKLY;BYDAY=MO;COUNT=3",
    };
    const w = mount(VcScheduler, {
      props: { events: [master], date: new Date(2026, 6, 15) },
      global: { mocks: t },
    });
    const monthView = w.findComponent({ name: "SchedulerMonthView" });
    expect((monthView.props("events") as unknown[]).length).toBeGreaterThan(1);
  });
});

describe("VcScheduler create/edit orchestration", () => {
  const start = new Date("2026-07-15T00:00:00Z");
  const end = new Date("2026-07-16T00:00:00Z");

  it("opens the quick-create popover for a single-click create-intent", async () => {
    const w = mount(VcScheduler, {
      props: { events, date: start },
      global: { mocks: t },
    });
    const monthView = w.findComponent({ name: "SchedulerMonthView" });
    await monthView.vm.$emit("create-intent", { start, end, allDay: true, anchorRect: null, kind: "single" });

    expect(w.findComponent({ name: "QuickCreatePopover" }).props("open")).toBe(true);
    expect(w.findComponent({ name: "SchedulerEventEditor" }).props("open")).toBe(false);
  });

  it("opens the editor (create mode) for a double-click create-intent", async () => {
    const w = mount(VcScheduler, {
      props: { events, date: start },
      global: { mocks: t },
    });
    const monthView = w.findComponent({ name: "SchedulerMonthView" });
    await monthView.vm.$emit("create-intent", { start, end, allDay: true, anchorRect: null, kind: "double" });

    const editor = w.findComponent({ name: "SchedulerEventEditor" });
    expect(editor.props("open")).toBe(true);
    expect(editor.props("mode")).toBe("create");
    expect(w.findComponent({ name: "QuickCreatePopover" }).props("open")).toBe(false);
  });

  it("quick-create save emits the public event-create with the typed title", async () => {
    const w = mount(VcScheduler, {
      props: { events, date: start },
      global: { mocks: t },
    });
    const monthView = w.findComponent({ name: "SchedulerMonthView" });
    await monthView.vm.$emit("create-intent", { start, end, allDay: true, anchorRect: null, kind: "single" });

    const quickCreate = w.findComponent({ name: "QuickCreatePopover" });
    await quickCreate.vm.$emit("save", { title: "Flash Sale" });

    expect(w.emitted("event-create")![0][0]).toEqual({
      start,
      end,
      allDay: true,
      title: "Flash Sale",
      color: undefined,
    });
    expect(w.findComponent({ name: "QuickCreatePopover" }).props("open")).toBe(false);
  });

  it("editor save in edit mode emits the public event-update with id and title", async () => {
    const w = mount(VcScheduler, {
      props: { events, date: start, editable: true },
      global: { mocks: t },
    });
    const monthView = w.findComponent({ name: "SchedulerMonthView" });
    await monthView.vm.$emit("edit-intent", events[0]);

    const editor = w.findComponent({ name: "SchedulerEventEditor" });
    expect(editor.props("mode")).toBe("edit");
    await editor.vm.$emit("save", {
      id: "a",
      title: "Renamed Sale",
      start: events[0].start,
      end: events[0].end,
      allDay: true,
    });

    expect(w.emitted("event-update")![0][0]).toMatchObject({ id: "a", title: "Renamed Sale" });
    expect(editor.props("open")).toBe(false);
  });

  it("quick-create 'more' opens the editor with the typed title carried over", async () => {
    const w = mount(VcScheduler, {
      props: { events, date: start },
      global: { mocks: t },
    });
    const monthView = w.findComponent({ name: "SchedulerMonthView" });
    await monthView.vm.$emit("create-intent", { start, end, allDay: true, anchorRect: null, kind: "single" });

    const quickCreate = w.findComponent({ name: "QuickCreatePopover" });
    await quickCreate.vm.$emit("more", { title: "Flash Sale" });

    const editor = w.findComponent({ name: "SchedulerEventEditor" });
    expect(editor.props("open")).toBe(true);
    expect(editor.props("mode")).toBe("create");
    expect(editor.props("draft")).toMatchObject({ title: "Flash Sale", start, end, allDay: true });
    expect(quickCreate.props("open")).toBe(false);
  });

  it("editorMode='emit' makes create-intent emit event-create directly with no popover open", async () => {
    const w = mount(VcScheduler, {
      props: { events, date: start, editorMode: "emit" },
      global: { mocks: t },
    });
    const monthView = w.findComponent({ name: "SchedulerMonthView" });
    await monthView.vm.$emit("create-intent", { start, end, allDay: true, anchorRect: null, kind: "single" });

    expect(w.emitted("event-create")![0][0]).toEqual({ start, end, allDay: true, title: "" });
    expect(w.findComponent({ name: "QuickCreatePopover" }).props("open")).toBe(false);
    expect(w.findComponent({ name: "SchedulerEventEditor" }).props("open")).toBe(false);
  });

  it("does not open the built-in editor for an edit-intent when editable=false", async () => {
    const w = mount(VcScheduler, {
      props: { events, date: start, editable: false, editorMode: "builtin" },
      global: { mocks: t },
    });
    const monthView = w.findComponent({ name: "SchedulerMonthView" });
    await monthView.vm.$emit("edit-intent", events[0]);

    expect(w.findComponent({ name: "SchedulerEventEditor" }).props("open")).toBe(false);
  });

  it("editorMode='emit' still emits event-edit for an edit-intent regardless of editable", async () => {
    const w = mount(VcScheduler, {
      props: { events, date: start, editable: false, editorMode: "emit" },
      global: { mocks: t },
    });
    const monthView = w.findComponent({ name: "SchedulerMonthView" });
    await monthView.vm.$emit("edit-intent", events[0]);

    expect(w.emitted("event-edit")![0]).toEqual([events[0]]);
    expect(w.findComponent({ name: "SchedulerEventEditor" }).props("open")).toBe(false);
  });
});

describe("VcScheduler recurrence scope routing", () => {
  const master = {
    id: "m1",
    title: "Standup",
    start: new Date(2026, 6, 6, 9, 0),
    end: new Date(2026, 6, 6, 9, 30),
    recurrence: "FREQ=WEEKLY;BYDAY=MO;COUNT=3",
  };
  const focusDate = new Date(2026, 6, 15);

  function findOccurrence(w: ReturnType<typeof mount>) {
    const monthView = w.findComponent({ name: "SchedulerMonthView" });
    const occ = (monthView.props("events") as ISchedulerEvent[]).find((e) => e.recurrenceId === "m1");
    if (!occ) throw new Error("expected a recurring occurrence in displayEvents");
    return occ;
  }

  it("opens the scope dialog (not the editor) when editing a recurring occurrence", async () => {
    const w = mount(VcScheduler, {
      props: { events: [master], date: focusDate, editable: true },
      global: { mocks: t },
    });
    const monthView = w.findComponent({ name: "SchedulerMonthView" });
    const occ = findOccurrence(w);
    await monthView.vm.$emit("edit-intent", occ);

    const dialog = w.findComponent({ name: "RecurrenceScopeDialog" });
    expect(dialog.props("open")).toBe(true);
    expect(dialog.props("action")).toBe("edit");
    expect(w.findComponent({ name: "SchedulerEventEditor" }).props("open")).toBe(false);
  });

  it("does not open the scope dialog for a non-recurring event (edit or delete)", async () => {
    const w = mount(VcScheduler, {
      props: { events, date: new Date("2026-07-15T00:00:00Z"), editable: true },
      global: { mocks: t },
    });
    const monthView = w.findComponent({ name: "SchedulerMonthView" });
    await monthView.vm.$emit("edit-intent", events[0]);
    expect(w.findComponent({ name: "RecurrenceScopeDialog" }).props("open")).toBe(false);
    expect(w.findComponent({ name: "SchedulerEventEditor" }).props("open")).toBe(true);

    await monthView.vm.$emit("event-delete", { id: "a" });
    // Non-recurring: the scope dialog stays shut; a plain confirm dialog gates the delete.
    expect(w.findComponent({ name: "RecurrenceScopeDialog" }).props("open")).toBe(false);
    const confirm = w.findComponent({ name: "ConfirmDialog" });
    expect(confirm.props("open")).toBe(true);
    await confirm.vm.$emit("confirm");
    expect(w.emitted("event-delete")![0]).toEqual([{ id: "a" }]);
  });

  it("scope 'all' opens the editor seeded from the master with its parsed recurrence rule", async () => {
    const w = mount(VcScheduler, {
      props: { events: [master], date: focusDate, editable: true },
      global: { mocks: t },
    });
    const monthView = w.findComponent({ name: "SchedulerMonthView" });
    const occ = findOccurrence(w);
    await monthView.vm.$emit("edit-intent", occ);
    const dialog = w.findComponent({ name: "RecurrenceScopeDialog" });
    await dialog.vm.$emit("select", "all");

    const editor = w.findComponent({ name: "SchedulerEventEditor" });
    expect(editor.props("open")).toBe(true);
    expect(editor.props("mode")).toBe("edit");
    const draft = editor.props("draft") as IEventDraft;
    expect(draft.id).toBe("m1");
    expect(draft.title).toBe("Standup");
    expect(draft.recurrence).toMatchObject({ freq: "weekly" });
    expect(dialog.props("open")).toBe(false);

    await editor.vm.$emit("save", { ...draft, title: "Standup (renamed)" });
    expect(w.emitted("event-update")![0][0]).toMatchObject({
      id: "m1",
      title: "Standup (renamed)",
      recurrence: "FREQ=WEEKLY;INTERVAL=1;BYDAY=MO;COUNT=3",
    });
  });

  it("scope 'this' edit, with no existing override, saves via event-create with recurrenceId+originalStart", async () => {
    const w = mount(VcScheduler, {
      props: { events: [master], date: focusDate, editable: true },
      global: { mocks: t },
    });
    const monthView = w.findComponent({ name: "SchedulerMonthView" });
    const occ = findOccurrence(w);
    await monthView.vm.$emit("edit-intent", occ);
    const dialog = w.findComponent({ name: "RecurrenceScopeDialog" });
    await dialog.vm.$emit("select", "this");

    const editor = w.findComponent({ name: "SchedulerEventEditor" });
    expect(editor.props("open")).toBe(true);
    const draft = editor.props("draft") as IEventDraft;
    expect(draft.recurrence).toBeNull();

    await editor.vm.$emit("save", { ...draft, title: "Standup (moved)" });

    expect(w.emitted("event-create")![0][0]).toMatchObject({
      title: "Standup (moved)",
      recurrenceId: "m1",
      originalStart: occ.originalStart,
    });
    expect(w.emitted("event-update")).toBeFalsy();
  });

  it("scope 'this' edit, with an existing override, saves via event-update for the override id", async () => {
    const override = {
      id: "ov1",
      title: "Standup (already moved)",
      start: new Date(2026, 6, 13, 10, 0),
      end: new Date(2026, 6, 13, 10, 30),
      recurrenceId: "m1",
      originalStart: new Date(2026, 6, 13, 9, 0),
    };
    const w = mount(VcScheduler, {
      props: { events: [master, override], date: focusDate, editable: true },
      global: { mocks: t },
    });
    const monthView = w.findComponent({ name: "SchedulerMonthView" });
    const occ = (monthView.props("events") as ISchedulerEvent[]).find((e) => e.id === "ov1");
    expect(occ).toBeTruthy();
    await monthView.vm.$emit("edit-intent", occ);
    const dialog = w.findComponent({ name: "RecurrenceScopeDialog" });
    await dialog.vm.$emit("select", "this");

    const editor = w.findComponent({ name: "SchedulerEventEditor" });
    const draft = editor.props("draft") as IEventDraft;
    await editor.vm.$emit("save", { ...draft, title: "Standup (moved again)" });

    expect(w.emitted("event-update")![0][0]).toMatchObject({
      id: "ov1",
      title: "Standup (moved again)",
      recurrenceId: "m1",
    });
    expect(w.emitted("event-create")).toBeFalsy();
  });

  it("delete 'this' adds the occurrence to the master's exceptionDates", async () => {
    const w = mount(VcScheduler, {
      props: { events: [master], date: focusDate, editable: true },
      global: { mocks: t },
    });
    const monthView = w.findComponent({ name: "SchedulerMonthView" });
    const occ = findOccurrence(w);
    await monthView.vm.$emit("event-delete", { id: occ.id });

    const dialog = w.findComponent({ name: "RecurrenceScopeDialog" });
    expect(dialog.props("open")).toBe(true);
    expect(dialog.props("action")).toBe("delete");
    await dialog.vm.$emit("select", "this");

    expect(w.emitted("event-update")![0][0]).toMatchObject({
      id: "m1",
      exceptionDates: [occ.originalStart],
    });
    expect(w.emitted("event-delete")).toBeFalsy();
  });

  it("delete 'this' on an occurrence with an existing override also deletes the override", async () => {
    const override = {
      id: "ov1",
      title: "Standup (already moved)",
      start: new Date(2026, 6, 13, 10, 0),
      end: new Date(2026, 6, 13, 10, 30),
      recurrenceId: "m1",
      originalStart: new Date(2026, 6, 13, 9, 0),
    };
    const w = mount(VcScheduler, {
      props: { events: [master, override], date: focusDate, editable: true },
      global: { mocks: t },
    });
    const monthView = w.findComponent({ name: "SchedulerMonthView" });
    await monthView.vm.$emit("event-delete", { id: "ov1" });

    const dialog = w.findComponent({ name: "RecurrenceScopeDialog" });
    await dialog.vm.$emit("select", "this");

    expect(w.emitted("event-update")![0][0]).toMatchObject({ id: "m1" });
    expect(w.emitted("event-delete")![0][0]).toEqual({ id: "ov1" });
  });

  it("delete 'all' emits event-delete for the master id", async () => {
    const w = mount(VcScheduler, {
      props: { events: [master], date: focusDate, editable: true },
      global: { mocks: t },
    });
    const monthView = w.findComponent({ name: "SchedulerMonthView" });
    const occ = findOccurrence(w);
    await monthView.vm.$emit("event-delete", { id: occ.id });
    const dialog = w.findComponent({ name: "RecurrenceScopeDialog" });
    await dialog.vm.$emit("select", "all");

    expect(w.emitted("event-delete")![0][0]).toEqual({ id: "m1" });
  });

  it("cancelling the scope dialog closes it without emitting anything", async () => {
    const w = mount(VcScheduler, {
      props: { events: [master], date: focusDate, editable: true },
      global: { mocks: t },
    });
    const monthView = w.findComponent({ name: "SchedulerMonthView" });
    const occ = findOccurrence(w);
    await monthView.vm.$emit("edit-intent", occ);
    const dialog = w.findComponent({ name: "RecurrenceScopeDialog" });
    await dialog.vm.$emit("close");

    expect(dialog.props("open")).toBe(false);
    expect(w.findComponent({ name: "SchedulerEventEditor" }).props("open")).toBe(false);
    expect(w.emitted("event-update")).toBeFalsy();
    expect(w.emitted("event-create")).toBeFalsy();
    expect(w.emitted("event-delete")).toBeFalsy();
  });

  it("passes allow-recurrence=false to the editor for a 'this'-scope edit and true for 'all'-scope", async () => {
    const w = mount(VcScheduler, {
      props: { events: [master], date: focusDate, editable: true },
      global: { mocks: t },
    });
    const monthView = w.findComponent({ name: "SchedulerMonthView" });
    const occ = findOccurrence(w);
    await monthView.vm.$emit("edit-intent", occ);
    const dialog = w.findComponent({ name: "RecurrenceScopeDialog" });
    await dialog.vm.$emit("select", "this");

    expect(w.findComponent({ name: "SchedulerEventEditor" }).props("allowRecurrence")).toBe(false);
  });

  it("scope 'this' edit with no existing override, then editor Delete adds originalStart to the master's exceptionDates and does not emit event-delete with an undefined id", async () => {
    const w = mount(VcScheduler, {
      props: { events: [master], date: focusDate, editable: true },
      global: { mocks: t },
    });
    const monthView = w.findComponent({ name: "SchedulerMonthView" });
    const occ = findOccurrence(w);
    await monthView.vm.$emit("edit-intent", occ);
    const dialog = w.findComponent({ name: "RecurrenceScopeDialog" });
    await dialog.vm.$emit("select", "this");

    const editor = w.findComponent({ name: "SchedulerEventEditor" });
    expect(editor.props("draft")).toMatchObject({ id: undefined });
    await editor.vm.$emit("delete", { id: undefined });

    expect(w.emitted("event-update")![0][0]).toMatchObject({
      id: "m1",
      exceptionDates: [occ.originalStart],
    });
    expect(w.emitted("event-delete")).toBeFalsy();
  });

  it("scope 'this' edit with an existing override, then editor Delete emits both the master event-update and event-delete of the override", async () => {
    const override = {
      id: "ov1",
      title: "Standup (already moved)",
      start: new Date(2026, 6, 13, 10, 0),
      end: new Date(2026, 6, 13, 10, 30),
      recurrenceId: "m1",
      originalStart: new Date(2026, 6, 13, 9, 0),
    };
    const w = mount(VcScheduler, {
      props: { events: [master, override], date: focusDate, editable: true },
      global: { mocks: t },
    });
    const monthView = w.findComponent({ name: "SchedulerMonthView" });
    const occ = (monthView.props("events") as ISchedulerEvent[]).find((e) => e.id === "ov1");
    expect(occ).toBeTruthy();
    await monthView.vm.$emit("edit-intent", occ);
    const dialog = w.findComponent({ name: "RecurrenceScopeDialog" });
    await dialog.vm.$emit("select", "this");

    const editor = w.findComponent({ name: "SchedulerEventEditor" });
    await editor.vm.$emit("delete", { id: "ov1" });

    expect(w.emitted("event-update")![0][0]).toMatchObject({
      id: "m1",
      exceptionDates: [override.originalStart],
    });
    expect(w.emitted("event-delete")![0][0]).toEqual({ id: "ov1" });
  });

  it("scope 'all' edit, editor Delete emits event-delete for the master id", async () => {
    const w = mount(VcScheduler, {
      props: { events: [master], date: focusDate, editable: true },
      global: { mocks: t },
    });
    const monthView = w.findComponent({ name: "SchedulerMonthView" });
    const occ = findOccurrence(w);
    await monthView.vm.$emit("edit-intent", occ);
    const dialog = w.findComponent({ name: "RecurrenceScopeDialog" });
    await dialog.vm.$emit("select", "all");

    const editor = w.findComponent({ name: "SchedulerEventEditor" });
    expect(editor.props("allowRecurrence")).toBe(true);
    await editor.vm.$emit("delete", { id: "m1" });

    expect(w.emitted("event-delete")![0][0]).toEqual({ id: "m1" });
  });

  it("non-recurring edit, editor Delete emits event-delete for the event id (unchanged passthrough)", async () => {
    const w = mount(VcScheduler, {
      props: { events, date: new Date("2026-07-15T00:00:00Z"), editable: true },
      global: { mocks: t },
    });
    const monthView = w.findComponent({ name: "SchedulerMonthView" });
    await monthView.vm.$emit("edit-intent", events[0]);

    const editor = w.findComponent({ name: "SchedulerEventEditor" });
    expect(editor.props("allowRecurrence")).toBe(true);
    await editor.vm.$emit("delete", { id: "a" });

    expect(w.emitted("event-delete")![0][0]).toEqual({ id: "a" });
  });

  it("defensively no-ops a scope choice when the referenced master cannot be found", async () => {
    const orphanOverride = {
      id: "ov-orphan",
      title: "Orphan override",
      start: new Date(2026, 6, 13, 10, 0),
      end: new Date(2026, 6, 13, 10, 30),
      recurrenceId: "missing-master",
      originalStart: new Date(2026, 6, 13, 9, 0),
    };
    const w = mount(VcScheduler, {
      props: { events: [orphanOverride], date: focusDate, editable: true },
      global: { mocks: t },
    });
    const monthView = w.findComponent({ name: "SchedulerMonthView" });
    await monthView.vm.$emit("edit-intent", orphanOverride);
    const dialog = w.findComponent({ name: "RecurrenceScopeDialog" });
    expect(dialog.props("open")).toBe(true);

    await dialog.vm.$emit("select", "all");

    expect(w.findComponent({ name: "SchedulerEventEditor" }).props("open")).toBe(false);
    expect(w.emitted("event-update")).toBeFalsy();
    expect(w.emitted("event-create")).toBeFalsy();
  });
});
