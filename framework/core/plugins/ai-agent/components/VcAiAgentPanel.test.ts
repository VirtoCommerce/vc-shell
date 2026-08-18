import { afterEach, describe, expect, it, vi } from "vitest";
import { shallowMount, VueWrapper } from "@vue/test-utils";
import { computed, ref } from "vue";
import VcAiAgentPanel from "./VcAiAgentPanel.vue";
import { AiAgentServiceKey } from "@framework/injection-keys";

const mountedWrappers: VueWrapper[] = [];

function mountPanel(isOpenValue: boolean, isExpandedValue = false, props: { inert?: boolean } = {}) {
  const isOpen = ref(isOpenValue);
  const isExpanded = ref(isExpandedValue);
  const closePanel = vi.fn();
  const expandPanel = vi.fn();
  const collapsePanel = vi.fn();
  const mockService = {
    config: ref({ url: "", title: "AI Assistant", width: 362, expandedWidth: 500 }),
    isOpen: computed(() => isOpen.value),
    isExpanded: computed(() => isExpanded.value),
    totalItemsCount: computed(() => 0),
    closePanel,
    expandPanel,
    collapsePanel,
    _setIframeRef: vi.fn(),
  };

  const wrapper = shallowMount(VcAiAgentPanel as any, {
    props,
    global: {
      provide: {
        [AiAgentServiceKey as unknown as symbol]: mockService,
      },
    },
  });
  mountedWrappers.push(wrapper);

  return { wrapper, closePanel, expandPanel, collapsePanel };
}

function dispatchModBackslash(): KeyboardEvent {
  const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const event = new KeyboardEvent("keydown", {
    key: "\\",
    code: "Backslash",
    ctrlKey: !isMac,
    metaKey: isMac,
    cancelable: true,
  });
  document.dispatchEvent(event);
  return event;
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
    document.dispatchEvent(event);

    expect(closePanel).toHaveBeenCalledOnce();
    expect(event.defaultPrevented).toBe(true);
  });

  it("does not close the panel or prevent default on Escape when closed", () => {
    const { closePanel } = mountPanel(false);

    const event = new KeyboardEvent("keydown", { key: "Escape", cancelable: true });
    document.dispatchEvent(event);

    expect(closePanel).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it("does not close the panel on a non-Escape key while open", () => {
    const { closePanel } = mountPanel(true);

    const event = new KeyboardEvent("keydown", { key: "s", cancelable: true });
    document.dispatchEvent(event);

    expect(closePanel).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it("does not close the panel when a higher overlay already prevented default on Escape", () => {
    const { closePanel } = mountPanel(true);

    const event = new KeyboardEvent("keydown", { key: "Escape", cancelable: true });
    event.preventDefault();
    document.dispatchEvent(event);

    expect(closePanel).not.toHaveBeenCalled();
  });

  it("does not close the panel on Escape while an IME composition is in progress", () => {
    const { closePanel } = mountPanel(true);

    const event = new KeyboardEvent("keydown", { key: "Escape", cancelable: true, isComposing: true });
    if (!event.isComposing) {
      Object.defineProperty(event, "isComposing", { value: true });
    }
    document.dispatchEvent(event);

    expect(closePanel).not.toHaveBeenCalled();
  });
});

describe("VcAiAgentPanel - mod+\\ expand/collapse handling", () => {
  afterEach(() => {
    while (mountedWrappers.length) {
      mountedWrappers.pop()?.unmount();
    }
  });

  it("expands the panel and prevents default on mod+\\ when open and not expanded", () => {
    const { expandPanel, collapsePanel } = mountPanel(true, false);

    const event = dispatchModBackslash();

    expect(expandPanel).toHaveBeenCalledOnce();
    expect(collapsePanel).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
  });

  it("collapses the panel and prevents default on mod+\\ when open and expanded", () => {
    const { expandPanel, collapsePanel } = mountPanel(true, true);

    const event = dispatchModBackslash();

    expect(collapsePanel).toHaveBeenCalledOnce();
    expect(expandPanel).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
  });

  it("does not expand/collapse or prevent default on mod+\\ when closed", () => {
    const { expandPanel, collapsePanel } = mountPanel(false, false);

    const event = dispatchModBackslash();

    expect(expandPanel).not.toHaveBeenCalled();
    expect(collapsePanel).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it("applies inert to the rendered panel when requested", () => {
    const { wrapper } = mountPanel(true, false, { inert: true });

    expect(wrapper.find(".vc-ai-agent-panel").attributes()).toHaveProperty("inert");
  });
});
