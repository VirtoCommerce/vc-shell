import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import TableSelectAllBar from "./TableSelectAllBar.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string, ..._args: unknown[]) => k }),
}));

const stubs = {
  VcButton: {
    template: '<button class="vc-button-stub" @click="$emit(\'click\', $event)"><slot /></button>',
    props: ["variant", "size"],
  },
};

function factory(props: Record<string, unknown> = {}) {
  return mount(TableSelectAllBar, {
    props: {
      selectionCount: 10,
      totalCount: 100,
      ...props,
    },
    global: { stubs },
  });
}

describe("TableSelectAllBar", () => {
  it("is hidden when neither allSelected nor showSelectAllPrompt", () => {
    const w = factory({ allSelected: false, showSelectAllPrompt: false });
    expect(w.find(".vc-table-select-all-bar").exists()).toBe(false);
  });

  it("is visible when allSelected=true", () => {
    const w = factory({ allSelected: true });
    expect(w.find(".vc-table-select-all-bar").exists()).toBe(true);
  });

  it("is visible when showSelectAllPrompt=true", () => {
    const w = factory({ showSelectAllPrompt: true });
    expect(w.find(".vc-table-select-all-bar").exists()).toBe(true);
  });

  it("emits cancel on clear button click", async () => {
    const w = factory({ allSelected: true });
    const buttons = w.findAll(".vc-button-stub");
    const cancelBtn = buttons[buttons.length - 1];
    await cancelBtn.trigger("click");
    expect(w.emitted("cancel")).toBeTruthy();
  });

  it("emits selectAll on select all link click", async () => {
    const w = factory({ showSelectAllPrompt: true });
    const buttons = w.findAll(".vc-button-stub");
    // First button is the select-all link
    await buttons[0].trigger("click");
    expect(w.emitted("selectAll")).toBeTruthy();
  });
});
