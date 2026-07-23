import type { ShortcutDefinition } from "@core/types";

export type Modifier = "mod" | "ctrl" | "meta" | "alt" | "shift";

export type Key =
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z"
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "enter"
  | "escape"
  | "tab"
  | "space"
  | "delete"
  | "backspace"
  | "arrowup"
  | "arrowdown"
  | "arrowleft"
  | "arrowright"
  | "f1"
  | "f2"
  | "f3"
  | "f4"
  | "f5"
  | "f6"
  | "f7"
  | "f8"
  | "f9"
  | "f10"
  | "f11"
  | "f12"
  | "backslash"
  | "period"
  | "comma"
  | "slash";

const MODIFIERS: ReadonlySet<string> = new Set(["mod", "ctrl", "meta", "alt", "shift"]);

export type HotkeyBuilder = { [M in Modifier]: HotkeyBuilder } & { [K in Key]: ShortcutDefinition };

function makeBuilder(mods: Partial<Record<Modifier, boolean>>): HotkeyBuilder {
  return new Proxy(
    {},
    {
      get(_target, prop: string) {
        if (MODIFIERS.has(prop)) {
          return makeBuilder({ ...mods, [prop as Modifier]: true });
        }
        // Terminal: a key. Assemble the definition.
        return { key: prop, ...mods } as ShortcutDefinition;
      },
    },
  ) as HotkeyBuilder;
}

/**
 * Fluent shortcut builder: `hotkey.mod.s` → `{ key: "s", mod: true }`.
 * Modifier and key names are finite unions, so typos are compile errors.
 */
export const hotkey: HotkeyBuilder = makeBuilder({});
