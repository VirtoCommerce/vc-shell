import { afterEach, describe, expect, it, vi } from "vitest";
import { shallowMount, VueWrapper } from "@vue/test-utils";
import { computed, ref } from "vue";
import VcAiAgentPanel from "./VcAiAgentPanel.vue";
import { AiAgentServiceKey } from "@framework/injection-keys";

const mountedWrappers: VueWrapper[] = [];

function mountPanel(isOpenValue: boolean) {
  const isOpen = ref(isOpenValue);
  const closePanel = vi.fn();
  const mockService = {
    config: ref({ url: "", title: "AI Assistant", width: 362, expandedWidth: 500 }),
    isOpen: computed(() => isOpen.value),
    isExpanded: computed(() => false),
    totalItemsCount: computed(() => 0),
    closePanel,
    expandPanel: vi.fn(),
    collapsePanel: vi.fn(),
    _setIframeRef: vi.fn(),
  };

  const wrapper = shallowMount(VcAiAgentPanel as any, {
    global: {
      provide: {
        [AiAgentServiceKey as unknown as symbol]: mockService,
      },
    },
  });
  mountedWrappers.push(wrapper);

  return { closePanel };
}

describe("VcAiAgentPanel - Escape key handling", () => {
  afterEach(() => {
    while (mountedWrappers.length) {
      mountedWrappers.pop()?.unmount();
    }
  });

  it("closes the panel and prevents default on Escape when open", () => {
    const { closePanel } = mountPanel(true);

    const event = new KeyboardEvent("keydown", { key: "Escape", cancelable: true });
    window.dispatchEvent(event);

    expect(closePanel).toHaveBeenCalledOnce();
    expect(event.defaultPrevented).toBe(true);
  });

  it("does not close the panel or prevent default on Escape when closed", () => {
    const { closePanel } = mountPanel(false);

    const event = new KeyboardEvent("keydown", { key: "Escape", cancelable: true });
    window.dispatchEvent(event);

    expect(closePanel).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it("does not close the panel on a non-Escape key while open", () => {
    const { closePanel } = mountPanel(true);

    const event = new KeyboardEvent("keydown", { key: "s", cancelable: true });
    window.dispatchEvent(event);

    expect(closePanel).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });
});
