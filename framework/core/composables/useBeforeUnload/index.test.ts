import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { computed } from "vue";
import { mountWithSetup } from "@framework/test-helpers";
import { useBeforeUnload } from "./index";

describe("useBeforeUnload", () => {
  let addSpy: ReturnType<typeof vi.spyOn>;
  let removeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    addSpy = vi.spyOn(window, "addEventListener");
    removeSpy = vi.spyOn(window, "removeEventListener");
  });

  afterEach(() => {
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it("returns the modified ref", () => {
    const modified = computed(() => false);
    const { result } = mountWithSetup(() => useBeforeUnload(modified));
    expect(result.modified.value).toBe(false);
  });

  it("adds beforeunload listener on mount", () => {
    const modified = computed(() => false);
    mountWithSetup(() => useBeforeUnload(modified));
    expect(addSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));
  });

  it("removes beforeunload listener on unmount", () => {
    const modified = computed(() => false);
    const { wrapper } = mountWithSetup(() => useBeforeUnload(modified));
    wrapper.unmount();
    expect(removeSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));
  });

  it("calls event.preventDefault when modified is true", () => {
    const modified = computed(() => true);
    mountWithSetup(() => useBeforeUnload(modified));

    // Get the handler that was registered
    const handler = addSpy.mock.calls.find((call) => call[0] === "beforeunload")?.[1] as EventListener;
    expect(handler).toBeDefined();

    const event = new Event("beforeunload");
    const preventSpy = vi.spyOn(event, "preventDefault");
    handler(event);
    expect(preventSpy).toHaveBeenCalled();
  });

  it("does not call event.preventDefault when modified is false", () => {
    const modified = computed(() => false);
    mountWithSetup(() => useBeforeUnload(modified));

    const handler = addSpy.mock.calls.find((call) => call[0] === "beforeunload")?.[1] as EventListener;
    expect(handler).toBeDefined();

    const event = new Event("beforeunload");
    const preventSpy = vi.spyOn(event, "preventDefault");
    handler(event);
    expect(preventSpy).not.toHaveBeenCalled();
  });
});
