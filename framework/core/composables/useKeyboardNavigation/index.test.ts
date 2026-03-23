import { mountWithSetup } from "@framework/test-helpers";
import { useKeyboardNavigation } from "./index";

function createContainer(itemCount: number): HTMLElement {
  const container = document.createElement("div");
  container.setAttribute("role", "menu");
  for (let i = 0; i < itemCount; i++) {
    const item = document.createElement("div");
    item.setAttribute("tabindex", "0");
    item.textContent = `Item ${i}`;
    item.focus = vi.fn();
    item.click = vi.fn();
    container.appendChild(item);
  }
  return container;
}

function dispatchKeyDown(el: HTMLElement, key: string, extra: Partial<KeyboardEventInit> = {}) {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...extra });
  el.dispatchEvent(event);
}

describe("useKeyboardNavigation", () => {
  it("returns expected API shape", () => {
    const { result, wrapper } = mountWithSetup(() => useKeyboardNavigation({ containerSelector: "" }));
    expect(result.initKeyboardNavigation).toBeTypeOf("function");
    expect(result.cleanupKeyboardNavigation).toBeTypeOf("function");
    expect(result.focusNextElement).toBeTypeOf("function");
    expect(result.focusPreviousElement).toBeTypeOf("function");
    expect(result.focusFirstElement).toBeTypeOf("function");
    expect(result.focusLastElement).toBeTypeOf("function");
    expect(result.setFocusedIndex).toBeTypeOf("function");
    expect(result.getFocusedIndex).toBeTypeOf("function");
    wrapper.unmount();
  });

  it("initial focused index is -1", () => {
    const { result, wrapper } = mountWithSetup(() => useKeyboardNavigation({ containerSelector: "" }));
    expect(result.getFocusedIndex()).toBe(-1);
    wrapper.unmount();
  });

  describe("with initialized container", () => {
    function setup(options: Parameters<typeof useKeyboardNavigation>[0] = {}) {
      const container = createContainer(3);
      const { result, wrapper } = mountWithSetup(() => useKeyboardNavigation({ containerSelector: "", ...options }));
      result.initKeyboardNavigation(container);
      return { result, wrapper, container };
    }

    it("focusNextElement advances focus", () => {
      const { result, wrapper, container } = setup();
      // Initial index is -1; validateFocusedIndex resets to 0, then increments to 1
      result.focusNextElement();
      expect(result.getFocusedIndex()).toBe(1);

      result.focusNextElement();
      expect(result.getFocusedIndex()).toBe(2);

      const items = container.querySelectorAll('[tabindex="0"]');
      expect(items[2]!.focus).toHaveBeenCalled();
      wrapper.unmount();
    });

    it("focusPreviousElement goes backward", () => {
      const { result, wrapper } = setup();
      // Start at index 2
      result.setFocusedIndex(2);
      result.focusPreviousElement();
      expect(result.getFocusedIndex()).toBe(1);
      wrapper.unmount();
    });

    it("loops from last to first when loop=true (default)", () => {
      const { result, wrapper } = setup();
      result.setFocusedIndex(2);
      result.focusNextElement();
      expect(result.getFocusedIndex()).toBe(0);
      wrapper.unmount();
    });

    it("does not loop when loop=false", () => {
      const { result, wrapper } = setup({ loop: false });
      result.setFocusedIndex(2);
      result.focusNextElement();
      // Should stay at 2
      expect(result.getFocusedIndex()).toBe(2);
      wrapper.unmount();
    });

    it("loops backward from first to last", () => {
      const { result, wrapper } = setup();
      result.setFocusedIndex(0);
      result.focusPreviousElement();
      expect(result.getFocusedIndex()).toBe(2);
      wrapper.unmount();
    });

    it("focusFirstElement sets index to 0", () => {
      const { result, wrapper } = setup();
      result.setFocusedIndex(2);
      result.focusFirstElement();
      expect(result.getFocusedIndex()).toBe(0);
      wrapper.unmount();
    });

    it("focusLastElement sets index to last", () => {
      const { result, wrapper } = setup();
      result.focusLastElement();
      expect(result.getFocusedIndex()).toBe(2);
      wrapper.unmount();
    });

    it("ArrowDown key triggers focusNext", () => {
      const { result, wrapper, container } = setup();
      // Initial index -1 -> validateFocusedIndex resets to 0, then increments to 1
      dispatchKeyDown(container, "ArrowDown");
      expect(result.getFocusedIndex()).toBe(1);

      dispatchKeyDown(container, "ArrowDown");
      expect(result.getFocusedIndex()).toBe(2);
      wrapper.unmount();
    });

    it("ArrowUp key triggers focusPrevious", () => {
      const { result, wrapper, container } = setup();
      result.setFocusedIndex(2);
      dispatchKeyDown(container, "ArrowUp");
      expect(result.getFocusedIndex()).toBe(1);
      wrapper.unmount();
    });

    it("Enter key calls onEnter callback", () => {
      const onEnter = vi.fn();
      const { result, wrapper, container } = setup({ onEnter });
      result.setFocusedIndex(1);
      dispatchKeyDown(container, "Enter");
      expect(onEnter).toHaveBeenCalled();
      wrapper.unmount();
    });

    it("Enter key clicks element when no onEnter callback", () => {
      const { result, wrapper, container } = setup();
      result.setFocusedIndex(0);
      dispatchKeyDown(container, "Enter");
      const firstItem = container.querySelectorAll('[tabindex="0"]')[0] as HTMLElement;
      expect(firstItem.click).toHaveBeenCalled();
      wrapper.unmount();
    });

    it("Escape key calls onEscape callback", () => {
      const onEscape = vi.fn();
      const { wrapper, container } = setup({ onEscape });
      dispatchKeyDown(container, "Escape");
      expect(onEscape).toHaveBeenCalled();
      wrapper.unmount();
    });

    it("cleanupKeyboardNavigation removes event listener", () => {
      const { result, wrapper, container } = setup();
      result.cleanupKeyboardNavigation();
      dispatchKeyDown(container, "ArrowDown");
      // Index should remain -1 since listener was removed
      expect(result.getFocusedIndex()).toBe(-1);
      wrapper.unmount();
    });

    it("setFocusedIndex sets arbitrary index", () => {
      const { result, wrapper } = setup();
      result.setFocusedIndex(2);
      expect(result.getFocusedIndex()).toBe(2);
      wrapper.unmount();
    });

    it("setFocusedIndex ignores out-of-bounds index", () => {
      const { result, wrapper } = setup();
      result.setFocusedIndex(10);
      expect(result.getFocusedIndex()).toBe(-1);
      wrapper.unmount();
    });
  });
});
