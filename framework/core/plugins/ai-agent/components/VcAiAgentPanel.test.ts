import { afterEach, describe, expect, it, vi } from "vitest";
import { shallowMount, VueWrapper } from "@vue/test-utils";
import { computed, ref } from "vue";
import VcAiAgentPanel from "./VcAiAgentPanel.vue";
import { AiAgentServiceKey } from "@framework/injection-keys";

const mountedWrappers: VueWrapper[] = [];
const mountedElements: HTMLElement[] = [];

function appendBladeControl(): HTMLButtonElement {
  const blade = document.createElement("div");
  const control = document.createElement("button");
  blade.setAttribute("data-blade-id", "blade-a");
  blade.appendChild(control);
  document.body.appendChild(blade);
  mountedElements.push(blade);
  return control;
}

function cleanup() {
  while (mountedWrappers.length) mountedWrappers.pop()?.unmount();
  while (mountedElements.length) mountedElements.pop()?.remove();
}

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
    attachTo: document.body,
    global: {
      provide: {
        [AiAgentServiceKey as unknown as symbol]: mockService,
      },
      stubs: {
        VcAiAgentIframe: {
          template: '<iframe class="mock-ai-agent-iframe" />',
        },
      },
    },
  });
  mountedWrappers.push(wrapper);

  return { wrapper, closePanel, expandPanel, collapsePanel };
}

function dispatchModBackslash(target: EventTarget = document): KeyboardEvent {
  const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const event = new KeyboardEvent("keydown", {
    key: "\\",
    code: "Backslash",
    ctrlKey: !isMac,
    metaKey: isMac,
    cancelable: true,
    bubbles: true,
  });
  target.dispatchEvent(event);
  return event;
}

describe("VcAiAgentPanel - Escape key handling", () => {
  afterEach(cleanup);

  it.each(["inside", "outside"])("closes the panel and prevents default on Escape with focus %s", (focus) => {
    const { wrapper, closePanel } = mountPanel(true);
    let focusedElement: HTMLElement;
    if (focus === "inside") {
      focusedElement = wrapper.find("iframe").element as HTMLIFrameElement;
    } else {
      focusedElement = appendBladeControl();
    }
    focusedElement.focus();
    expect(document.activeElement).toBe(focusedElement);

    const event = new KeyboardEvent("keydown", { key: "Escape", cancelable: true, bubbles: true });
    focusedElement.dispatchEvent(event);

    expect(closePanel).toHaveBeenCalledOnce();
    expect(event.defaultPrevented).toBe(true);
  });

  it("applies inert to the rendered panel when requested", () => {
    const { wrapper } = mountPanel(true, false, { inert: true });

    expect(wrapper.find(".vc-ai-agent-panel").attributes()).toHaveProperty("inert");
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
  afterEach(cleanup);

  it("expands the panel and prevents default on mod+\\ when the iframe has focus", () => {
    const { wrapper, expandPanel, collapsePanel } = mountPanel(true, false);
    const iframe = wrapper.find("iframe").element as HTMLIFrameElement;
    iframe.focus();
    expect(document.activeElement).toBe(iframe);

    const event = dispatchModBackslash(iframe);

    expect(expandPanel).toHaveBeenCalledOnce();
    expect(collapsePanel).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
  });

  it("collapses the panel and prevents default on mod+\\ when an inner control has focus", () => {
    const { wrapper, expandPanel, collapsePanel } = mountPanel(true, true);
    const control = document.createElement("button");
    wrapper.find(".vc-ai-agent-panel").element.appendChild(control);
    control.focus();
    expect(document.activeElement).toBe(control);

    const event = dispatchModBackslash(control);

    expect(collapsePanel).toHaveBeenCalledOnce();
    expect(expandPanel).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
  });

  it("leaves mod+\\ unclaimed when focus is outside the panel", () => {
    const { expandPanel, collapsePanel } = mountPanel(true, false);
    const bladeControl = appendBladeControl();
    bladeControl.focus();
    expect(document.activeElement).toBe(bladeControl);

    const event = dispatchModBackslash(bladeControl);

    expect(expandPanel).not.toHaveBeenCalled();
    expect(collapsePanel).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
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
