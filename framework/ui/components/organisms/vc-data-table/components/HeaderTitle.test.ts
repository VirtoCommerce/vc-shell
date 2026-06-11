import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";

// Capture the ResizeObserver callback so we can drive truncation manually.
let resizeCallback: (() => void) | undefined;
vi.mock("@vueuse/core", () => ({
  useResizeObserver: (_target: unknown, cb: () => void) => {
    resizeCallback = cb;
  },
}));

import HeaderTitle from "./HeaderTitle.vue";

const VcTooltipStub = {
  name: "VcTooltip",
  props: ["disabled", "placement"],
  template: `
    <div class="vc-tooltip-stub">
      <div class="vc-tooltip__trigger"><slot /></div>
      <div class="vc-tooltip-stub__tip"><slot name="tooltip" /></div>
    </div>
  `,
};

function factory(props: Record<string, unknown> = {}) {
  return mount(HeaderTitle, {
    props: { title: "Some Column", ...props },
    global: { stubs: { VcTooltip: VcTooltipStub } },
  });
}

function setTextSize(wrapper: ReturnType<typeof factory>, scrollWidth: number, clientWidth: number) {
  const el = wrapper.find(".vc-data-table__header-title-text").element as HTMLElement;
  Object.defineProperty(el, "scrollWidth", { configurable: true, value: scrollWidth });
  Object.defineProperty(el, "clientWidth", { configurable: true, value: clientWidth });
}

describe("HeaderTitle", () => {
  beforeEach(() => {
    resizeCallback = undefined;
  });

  it("renders the column title", () => {
    const w = factory({ title: "Created Date" });
    expect(w.text()).toContain("Created Date");
  });

  it("keeps the tooltip disabled while the text is NOT truncated", () => {
    const w = factory();
    // jsdom defaults scrollWidth/clientWidth to 0 → not truncated.
    expect(w.findComponent(VcTooltipStub).props("disabled")).toBe(true);
  });

  it("enables the tooltip when the text is truncated", async () => {
    const w = factory();
    setTextSize(w, 200, 100); // content wider than the box
    resizeCallback?.();
    await nextTick();
    expect(w.findComponent(VcTooltipStub).props("disabled")).toBe(false);
  });

  it("disables the tooltip again when the column is wide enough", async () => {
    const w = factory();
    setTextSize(w, 200, 100);
    resizeCallback?.();
    await nextTick();
    expect(w.findComponent(VcTooltipStub).props("disabled")).toBe(false);

    setTextSize(w, 100, 100); // no overflow after resize
    resizeCallback?.();
    await nextTick();
    expect(w.findComponent(VcTooltipStub).props("disabled")).toBe(true);
  });

  it("shows the required marker only while editing", () => {
    const editing = factory({ required: true, isEditing: true });
    expect(editing.find(".tw-text-danger-500").exists()).toBe(true);

    const notEditing = factory({ required: true, isEditing: false });
    expect(notEditing.find(".tw-text-danger-500").exists()).toBe(false);
  });
});
