import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import QuickCreatePopover from "./QuickCreatePopover.vue";
import type { IEventDraft } from "../../types";

const t = { $t: (k: string) => k };
const VcPopoverStub = {
  name: "VcPopover",
  props: ["show", "anchorRef", "title", "placement", "contentScrollable"],
  emits: ["update:show"],
  template: `<div v-if="show"><slot name="header"/><slot/></div>`,
};
const draft: IEventDraft = { title: "", start: new Date(2021, 0, 13), end: new Date(2021, 0, 14), allDay: true };

function mountQC(props = {}) {
  return mount(QuickCreatePopover, {
    props: { open: true, anchorRect: null, draft, ...props },
    global: { mocks: t, stubs: { VcPopover: VcPopoverStub, teleport: true } },
  });
}

describe("QuickCreatePopover", () => {
  it("saves the typed title", async () => {
    const w = mountQC();
    await w.find("input").setValue("Flash Sale");
    await w.find("[data-test='qc-save']").trigger("click");
    expect(w.emitted("save")![0][0]).toEqual({ title: "Flash Sale" });
  });
  it("emits more with the typed title for the details link", async () => {
    const w = mountQC();
    await w.find("input").setValue("Flash Sale");
    await w.find("[data-test='qc-more']").trigger("click");
    expect(w.emitted("more")![0][0]).toEqual({ title: "Flash Sale" });
  });
  it("disables save when title empty", () => {
    const w = mountQC();
    expect(w.find("[data-test='qc-save']").attributes("disabled")).toBeDefined();
  });

  // The third anchored popover in the scheduler. It already moved focus to its
  // input, but announced itself as an unnamed div like the quick-info one did
  // (VCST-5802).
  it("exposes the quick-create panel as a named dialog", () => {
    const panel = mountQC().find('[role="dialog"]');

    expect(panel.exists()).toBe(true);
    expect(panel.attributes("aria-label")).toBe("VC_SCHEDULER.NEW_EVENT");
  });
});
