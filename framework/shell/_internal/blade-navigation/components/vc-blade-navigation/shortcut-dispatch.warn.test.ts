import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { warnShortcutIssues } from "./shortcut-dispatch";

let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => (warn = vi.spyOn(console, "warn").mockImplementation(() => {})));
afterEach(() => warn.mockRestore());

describe("warnShortcutIssues", () => {
  it("warns on an unknown key", () => {
    warnShortcutIssues("b1", [{ id: "x", shortcut: { key: "enterr", mod: true } } as any], false);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("unknown key"));
  });

  it("warns on a duplicate combo", () => {
    warnShortcutIssues(
      "b1",
      [
        { id: "a", shortcut: { key: "s", mod: true } },
        { id: "b", shortcut: { key: "s", mod: true } },
      ] as any,
      false,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("conflict"));
  });

  it("warns when a toolbar item overrides a built-in", () => {
    warnShortcutIssues("b1", [{ id: "a", shortcut: { key: "escape" } } as any], false);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("built-in"));
  });

  it("stays silent for a clean, unique, non-builtin combo", () => {
    warnShortcutIssues("b1", [{ id: "a", shortcut: { key: "s", mod: true } } as any], false);
    expect(warn).not.toHaveBeenCalled();
  });
});
