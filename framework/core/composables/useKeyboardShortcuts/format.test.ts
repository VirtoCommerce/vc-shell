import { describe, it, expect } from "vitest";
import { formatShortcut } from "./format";

describe("formatShortcut", () => {
  it("mod+s on mac", () => {
    expect(formatShortcut({ key: "s", mod: true }, true)).toEqual({ parts: ["⌘", "S"], aria: "Meta+S" });
  });

  it("mod+s off mac", () => {
    expect(formatShortcut({ key: "s", mod: true }, false)).toEqual({ parts: ["Ctrl", "S"], aria: "Control+S" });
  });

  it("mod+shift+backslash off mac", () => {
    expect(formatShortcut({ key: "backslash", mod: true, shift: true }, false)).toEqual({
      parts: ["Ctrl", "Shift", "\\"],
      aria: "Control+Shift+\\",
    });
  });

  it("mod+shift+backslash on mac uses glyphs in apple order", () => {
    expect(formatShortcut({ key: "backslash", mod: true, shift: true }, true)).toEqual({
      parts: ["⇧", "⌘", "\\"],
      aria: "Meta+Shift+\\",
    });
  });

  it("named key", () => {
    expect(formatShortcut({ key: "escape" }, false)).toEqual({ parts: ["Esc"], aria: "Escape" });
  });
});
