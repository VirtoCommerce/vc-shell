import { describe, it, expect, vi } from "vitest";
import { useKeyboardShortcuts, useIsMac, hotkey } from "./index";

describe("useKeyboardShortcuts", () => {
  it("exposes hotkey, isMac boolean, and bound formatShortcut", () => {
    const api = useKeyboardShortcuts();
    expect(api.hotkey).toBe(hotkey);
    expect(typeof api.isMac).toBe("boolean");
    const out = api.formatShortcut({ key: "s", mod: true });
    expect(out).toHaveProperty("parts");
    expect(out).toHaveProperty("aria");
  });
});

describe("useIsMac", () => {
  it("detects mac from userAgent", () => {
    const spy = vi
      .spyOn(navigator, "userAgent", "get")
      .mockReturnValue("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)");
    expect(useIsMac()).toBe(true);
    spy.mockReturnValue("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
    expect(useIsMac()).toBe(false);
    spy.mockRestore();
  });
});
