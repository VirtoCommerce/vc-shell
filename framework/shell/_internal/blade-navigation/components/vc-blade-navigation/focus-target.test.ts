import { describe, it, expect, afterEach } from "vitest";
import { BLADE_ID_ATTRIBUTE, resolveShortcutTargetBlade } from "./focus-target";

type TestBlade = { id: string; visible: boolean };

const stack: TestBlade[] = [
  { id: "workspace", visible: true },
  { id: "details", visible: true },
  { id: "price-tags", visible: true },
];

/** Topmost visible blade — what the stack calls "active", and the fallback here. */
const topmost = stack[2];

function renderStack(): void {
  document.body.innerHTML = stack
    .map((blade) => `<div ${BLADE_ID_ATTRIBUTE}="${blade.id}"><input id="field-${blade.id}" /></div>`)
    .join("");
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("resolveShortcutTargetBlade", () => {
  it("targets the blade whose subtree holds the focused element", () => {
    renderStack();
    const caret = document.getElementById("field-details");

    // The caret sits in the middle blade while "price-tags" is topmost. Before
    // this resolver every shortcut went to the topmost blade regardless.
    expect(resolveShortcutTargetBlade(stack, topmost, caret)).toBe(stack[1]);
  });

  it("falls back to the topmost blade when focus is outside every blade", () => {
    renderStack();
    // VCST-5670: focus lands on <body> after sign-in, Maximize and Save, so this
    // path is common until that one is fixed.
    expect(resolveShortcutTargetBlade(stack, topmost, document.body)).toBe(topmost);
  });

  it("falls back when the focused element belongs to a blade that has left the stack", () => {
    document.body.innerHTML = `<div ${BLADE_ID_ATTRIBUTE}="closed-blade"><input id="stale" /></div>`;
    const stale = document.getElementById("stale");

    // The DOM can outlive the descriptor for a tick during teardown.
    expect(resolveShortcutTargetBlade(stack, topmost, stale)).toBe(topmost);
  });

  it("falls back when nothing is focused", () => {
    renderStack();
    expect(resolveShortcutTargetBlade(stack, topmost, null)).toBe(topmost);
  });

  it("ignores a blade that is in the stack but not visible", () => {
    const hidden: TestBlade[] = [stack[0], { id: "details", visible: false }, stack[2]];
    document.body.innerHTML = `<div ${BLADE_ID_ATTRIBUTE}="details"><input id="hidden-field" /></div>`;

    expect(resolveShortcutTargetBlade(hidden, topmost, document.getElementById("hidden-field"))).toBe(topmost);
  });
});
