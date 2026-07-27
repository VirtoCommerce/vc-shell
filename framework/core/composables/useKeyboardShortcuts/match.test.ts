import { describe, it, expect, afterEach } from "vitest";
import { matchesEvent, isTextInputFocused } from "./match";

function ev(init: Partial<KeyboardEvent> & { code?: string; key?: string }): KeyboardEvent {
  return {
    code: "",
    key: "",
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: false,
    ...init,
  } as KeyboardEvent;
}

describe("matchesEvent", () => {
  it("mod+s matches metaKey on mac", () => {
    expect(matchesEvent({ key: "s", mod: true }, ev({ code: "KeyS", metaKey: true }), true)).toBe(true);
  });

  it("mod+s matches ctrlKey off mac", () => {
    expect(matchesEvent({ key: "s", mod: true }, ev({ code: "KeyS", ctrlKey: true }), false)).toBe(true);
  });

  it("mod+s does NOT match ctrlKey on mac (exact)", () => {
    expect(matchesEvent({ key: "s", mod: true }, ev({ code: "KeyS", ctrlKey: true }), true)).toBe(false);
  });

  it("mod+s does NOT match mod+shift+s (exact modifiers)", () => {
    expect(matchesEvent({ key: "s", mod: true }, ev({ code: "KeyS", ctrlKey: true, shiftKey: true }), false)).toBe(
      false,
    );
  });

  it("letter matches by code, ignoring layout-produced key", () => {
    // Cyrillic layout: physical S produces key "ы" but code stays "KeyS"
    expect(matchesEvent({ key: "s", mod: true }, ev({ code: "KeyS", key: "ы", ctrlKey: true }), false)).toBe(true);
  });

  it("punctuation matches by code", () => {
    expect(matchesEvent({ key: "backslash", mod: true }, ev({ code: "Backslash", ctrlKey: true }), false)).toBe(true);
  });

  it("named key matches by event.key", () => {
    expect(matchesEvent({ key: "escape" }, ev({ key: "Escape" }), false)).toBe(true);
  });

  it("bare key requires no modifiers", () => {
    expect(matchesEvent({ key: "e" }, ev({ code: "KeyE" }), false)).toBe(true);
    expect(matchesEvent({ key: "e" }, ev({ code: "KeyE", ctrlKey: true }), false)).toBe(false);
  });
});

describe("isTextInputFocused", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("true when an input is focused", () => {
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();
    expect(isTextInputFocused()).toBe(true);
  });

  it("false when body is focused", () => {
    (document.activeElement as HTMLElement | null)?.blur?.();
    expect(isTextInputFocused()).toBe(false);
  });

  it("true for contenteditable", () => {
    const div = document.createElement("div");
    div.setAttribute("contenteditable", "true");
    document.body.appendChild(div);
    div.focus();
    expect(isTextInputFocused()).toBe(true);
  });

  it("false for a checkbox input", () => {
    const input = document.createElement("input");
    input.type = "checkbox";
    document.body.appendChild(input);
    input.focus();
    expect(isTextInputFocused()).toBe(false);
  });

  it("true for a text input (explicit or default type)", () => {
    const input = document.createElement("input");
    input.type = "text";
    document.body.appendChild(input);
    input.focus();
    expect(isTextInputFocused()).toBe(true);
  });

  it("true for a textarea", () => {
    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
    textarea.focus();
    expect(isTextInputFocused()).toBe(true);
  });
});
