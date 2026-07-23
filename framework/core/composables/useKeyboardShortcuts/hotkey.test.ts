import { describe, it, expect } from "vitest";
import { hotkey } from "./hotkey";

describe("hotkey builder", () => {
  it("single modifier + key", () => {
    expect(hotkey.mod.s).toEqual({ key: "s", mod: true });
  });

  it("two modifiers + key", () => {
    expect(hotkey.mod.shift.e).toEqual({ key: "e", mod: true, shift: true });
  });

  it("explicit ctrl", () => {
    expect(hotkey.ctrl.d).toEqual({ key: "d", ctrl: true });
  });

  it("bare key", () => {
    expect(hotkey.e).toEqual({ key: "e" });
  });

  it("punctuation token", () => {
    expect(hotkey.mod.backslash).toEqual({ key: "backslash", mod: true });
  });

  it("named key", () => {
    expect(hotkey.escape).toEqual({ key: "escape" });
  });

  it("each access is independent (no shared mutation)", () => {
    const a = hotkey.mod.s;
    const b = hotkey.shift.e;
    expect(a).toEqual({ key: "s", mod: true });
    expect(b).toEqual({ key: "e", shift: true });
  });
});
