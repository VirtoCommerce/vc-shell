import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import MonthEventPopover from "@ui/components/organisms/vc-scheduler/_internal/month/MonthEventPopover.vue";

const t = { $t: (k: string) => k };

// Stub VcPopover: render its slots inline (and only when `show`) so we can assert content/emits
// without exercising floating-ui/teleport (covered by VcPopover's own tests).
const VcPopoverStub = {
  name: "VcPopover",
  props: ["show", "anchorRef", "title", "placement", "contentScrollable"],
  emits: ["update:show"],
  template: `<div v-if="show" class="vc-popover-stub" :data-title="title"><slot name="header"/><slot/><slot name="footer"/></div>`,
};

const event = {
  id: "a",
  title: "Summer Sale",
  start: new Date(2026, 6, 1),
  end: new Date(2026, 6, 6),
  allDay: true,
};

function mountPopover(over: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) {
  return mount(MonthEventPopover, {
    props: { open: true, event, anchorRect: null, ...over },
    slots,
    global: {
      mocks: t,
      stubs: {
        VcPopover: VcPopoverStub,
        VcButton: { template: "<button @click=\"$emit('click')\"><slot/></button>" },
        VcIcon: true,
      },
    },
  });
}

// Buttons in DOM order: [0] header close, [1] Delete, [2] Edit (Delete/Edit only when canEdit).

describe("MonthEventPopover", () => {
  it("renders nothing when closed", () => {
    const w = mountPopover({ open: false });
    expect(w.find(".vc-popover-stub").exists()).toBe(false);
  });

  it("renders the event title in the colored header and the date range", () => {
    const w = mountPopover();
    expect(w.find(".vc-scheduler__qi-header").text()).toContain("Summer Sale");
    expect(w.text()).toContain("2026");
  });

  it('emits edit with the event then close when "Edit" is clicked', async () => {
    const w = mountPopover();
    await w.findAll("button")[2].trigger("click"); // [0] close, [1] Delete, [2] Edit
    expect(w.emitted("edit")?.[0]?.[0]).toMatchObject({ id: "a" });
    expect(w.emitted("close")).toBeTruthy();
  });

  it('emits delete with the id then close when "Delete" is clicked', async () => {
    const w = mountPopover();
    await w.findAll("button")[1].trigger("click");
    expect(w.emitted("delete")?.[0]?.[0]).toEqual({ id: "a" });
    expect(w.emitted("close")).toBeTruthy();
  });

  it("shows a human-readable recurrence summary when the event carries a rule", () => {
    const w = mountPopover({ event: { ...event, recurrence: "FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=8" } });
    expect(w.text().toLowerCase()).toContain("every week");
  });

  it("shows a category/description row only when present in meta", () => {
    expect(mountPopover().text()).not.toContain("Promotions");
    const w = mountPopover({ event: { ...event, meta: { category: "Promotions" } } });
    expect(w.text()).toContain("Promotions");
  });

  it("emits close when VcPopover requests to hide (update:show=false)", async () => {
    const w = mountPopover();
    await w.findComponent(VcPopoverStub).vm.$emit("update:show", false);
    expect(w.emitted("close")).toBeTruthy();
  });

  it("supports the #event-popover scoped slot to override content", () => {
    const w = mountPopover({}, { "event-popover": '<div class="custom-pop">{{ params.event.title }}</div>' });
    expect(w.find(".custom-pop").exists()).toBe(true);
    expect(w.find(".custom-pop").text()).toBe("Summer Sale");
  });

  it("renders the Edit/Delete actions by default (canEdit defaults to true)", () => {
    const w = mountPopover();
    // header close + Edit + Delete
    expect(w.findAll("button")).toHaveLength(3);
  });

  it("hides the Edit/Delete actions when canEdit is false, but keeps the close and date range", () => {
    const w = mountPopover({ canEdit: false });
    expect(w.findAll("button")).toHaveLength(1); // header close only
    expect(w.text()).toContain("2026");
  });

  it("shows the Edit/Delete actions when canEdit is true", () => {
    const w = mountPopover({ canEdit: true });
    expect(w.findAll("button")).toHaveLength(3);
  });
});
