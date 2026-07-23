// Integration test for Escape handling that mounts the REAL @headlessui/vue Dialog
// (NOT the stub used in vc-popup.test.ts). This is required to reproduce the Task 10
// regression: Headless UI's own window-level Escape handler calls its close() ONLY when
// event.defaultPrevented is still false. vc-popup must consume Escape (preventDefault) so
// the nav-root blade shortcut does not fire through the open modal, while still owning its
// own close semantics rather than relying on Headless UI's now-suppressed close().
//
// NOTE: kept in a separate file on purpose — vc-popup.test.ts installs a hoisted
// vi.mock("@headlessui/vue"), which is file-scoped. Here we do NOT mock it.
import { beforeAll, describe, expect, it } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { nextTick, ref } from "vue";
import { IsMobileKey, IsDesktopKey } from "@framework/injection-keys";
import VcPopup from "./vc-popup.vue";

// jsdom has no ResizeObserver; Headless UI's Dialog uses one. Provide a no-op polyfill.
beforeAll(() => {
  if (!("ResizeObserver" in globalThis)) {
    (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    };
  }
});

async function mountRealPopup(props: Record<string, unknown> = {}) {
  const wrapper = mount(VcPopup, {
    attachTo: document.body,
    props: { modelValue: true, ...props },
    slots: { content: '<p class="test-content">Body</p>' },
    global: {
      provide: {
        [IsMobileKey as symbol]: ref(false),
        [IsDesktopKey as symbol]: ref(true),
      },
      stubs: {
        VcIcon: { name: "VcIcon", props: ["icon", "class"], template: '<i class="vc-icon-stub" />' },
        VcButton: { name: "VcButton", template: '<button class="vc-button-stub"><slot /></button>' },
      },
      mocks: {
        $t: (key: string) => key,
      },
    },
  });

  // Let onMounted + Headless UI transition/appear flush so the Dialog is fully rendered
  // and its window-level keydown listener is attached.
  await nextTick();
  await flushPromises();
  await nextTick();

  return wrapper;
}

function dispatchEscape(): KeyboardEvent {
  // Dispatch on the real Dialog root element so the event bubbles through vc-popup's
  // @keydown.esc listener AND up to Headless UI's window-level listener, exactly as a
  // real keypress would.
  const dialogEl = document.querySelector(".vc-popup") as HTMLElement | null;
  if (!dialogEl) {
    throw new Error("Dialog root (.vc-popup) not found — real Headless UI Dialog did not mount");
  }
  const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
  dialogEl.dispatchEvent(event);
  return event;
}

describe("VcPopup Escape handling (real @headlessui/vue Dialog)", () => {
  it("mounts the real Dialog (sanity: not the stub)", async () => {
    const wrapper = await mountRealPopup();
    // Real Dialog renders via Portal into document.body, not inside the wrapper subtree.
    expect(document.querySelector(".vc-popup")).not.toBeNull();
    wrapper.unmount();
  });

  it("default props (closable true, closeOnEscape unset): Escape closes with reason 'escape' and is consumed", async () => {
    const wrapper = await mountRealPopup();

    const event = dispatchEscape();
    await nextTick();

    expect(event.defaultPrevented).toBe(true);
    // exactly one close emit → no double-fire with Headless UI's suppressed close()
    expect(wrapper.emitted("close")).toHaveLength(1);
    expect(wrapper.emitted("close")?.[0]).toEqual(["escape"]);
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([false]);

    wrapper.unmount();
  });

  it("closeOnEscape=false: Escape is consumed (preventDefault) but does NOT close", async () => {
    const wrapper = await mountRealPopup({ closeOnEscape: false });

    const event = dispatchEscape();
    await nextTick();

    expect(event.defaultPrevented).toBe(true);
    expect(wrapper.emitted("close")).toBeUndefined();
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();

    wrapper.unmount();
  });

  it("closeOnEscape=false, closeOnOverlay=true: Escape does NOT wrongly close with reason 'overlay'", async () => {
    const wrapper = await mountRealPopup({ closeOnEscape: false, closeOnOverlay: true });

    const event = dispatchEscape();
    await nextTick();

    expect(event.defaultPrevented).toBe(true);
    // The pre-fix bug closed with reason "overlay"; must not close at all now.
    expect(wrapper.emitted("close")).toBeUndefined();

    wrapper.unmount();
  });
});
