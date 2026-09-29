import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { h } from "vue";
import { mount } from "@vue/test-utils";
import ShortcutTooltip from "./ShortcutTooltip.vue";
import { hotkey } from "@core/composables/useKeyboardShortcuts";

describe("ShortcutTooltip", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const mountTooltip = (label?: string) =>
    mount(ShortcutTooltip, {
      props: { shortcut: hotkey.escape, label },
      slots: {
        default: ({ aria }: { aria: string }) => h("button", { "aria-keyshortcuts": aria }, "Close"),
      },
      global: { stubs: { teleport: true } },
    });

  it("passes the aria shortcut to the trigger", () => {
    const wrapper = mountTooltip();
    expect(wrapper.find("button").attributes("aria-keyshortcuts")).toBe("Escape");
  });

  it("shows label and key chips only after the hover delay", async () => {
    const wrapper = mountTooltip("Close");
    await wrapper.trigger("mouseenter");

    await vi.advanceTimersByTimeAsync(499);
    expect(wrapper.find('[role="tooltip"]').exists()).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    const tooltip = wrapper.find('[role="tooltip"]');
    expect(tooltip.text()).toContain("Close");
    expect(tooltip.find("kbd").exists()).toBe(true);
  });

  it("does not open when the cursor leaves before the delay", async () => {
    const wrapper = mountTooltip("Close");
    await wrapper.trigger("mouseenter");
    await vi.advanceTimersByTimeAsync(200);
    await wrapper.trigger("mouseleave");
    await vi.advanceTimersByTimeAsync(1000);
    expect(wrapper.find('[role="tooltip"]').exists()).toBe(false);
  });
});
