import type { ShortcutDefinition } from "@core/types";

/** Keys matched by physical position (event.code), layout-independent. */
const CODE_KEYS: Record<string, string> = {
  backslash: "Backslash",
  period: "Period",
  comma: "Comma",
  slash: "Slash",
};

/** Named keys matched by event.key (already layout-independent). */
const NAMED_KEYS: Record<string, string> = {
  enter: "Enter",
  escape: "Escape",
  tab: "Tab",
  space: " ",
  delete: "Delete",
  backspace: "Backspace",
  arrowup: "ArrowUp",
  arrowdown: "ArrowDown",
  arrowleft: "ArrowLeft",
  arrowright: "ArrowRight",
};

function isLetter(key: string): boolean {
  return key.length === 1 && key >= "a" && key <= "z";
}
function isDigit(key: string): boolean {
  return key.length === 1 && key >= "0" && key <= "9";
}
function isFunctionKey(key: string): boolean {
  return /^f([1-9]|1[0-2])$/.test(key);
}

/** Expected `event.code` for a code-matched key, or undefined if this key is name-matched. */
export function expectedCode(key: string): string | undefined {
  if (isLetter(key)) return `Key${key.toUpperCase()}`;
  if (isDigit(key)) return `Digit${key}`;
  if (key in CODE_KEYS) return CODE_KEYS[key];
  return undefined;
}

/** Expected `event.key` for a name-matched key, or undefined if code-matched. */
export function expectedEventKey(key: string): string | undefined {
  if (key in NAMED_KEYS) return NAMED_KEYS[key];
  if (isFunctionKey(key)) return key.toUpperCase(); // f2 -> "F2"
  return undefined;
}

function keyMatches(def: ShortcutDefinition, event: KeyboardEvent): boolean {
  const code = expectedCode(def.key);
  if (code !== undefined) return event.code === code;
  const evKey = expectedEventKey(def.key);
  if (evKey !== undefined) return event.key === evKey;
  return false;
}

/**
 * True when the event exactly matches the definition. Modifiers must match
 * exactly (so `mod+s` never fires on `mod+shift+s`). `mod` resolves to Cmd on
 * macOS, Ctrl elsewhere.
 */
export function matchesEvent(def: ShortcutDefinition, event: KeyboardEvent, isMac: boolean): boolean {
  const expectedCtrl = !!def.ctrl || (!!def.mod && !isMac);
  const expectedMeta = !!def.meta || (!!def.mod && isMac);
  const expectedAlt = !!def.alt;
  const expectedShift = !!def.shift;

  if (event.ctrlKey !== expectedCtrl) return false;
  if (event.metaKey !== expectedMeta) return false;
  if (event.altKey !== expectedAlt) return false;
  if (event.shiftKey !== expectedShift) return false;

  return keyMatches(def, event);
}

/** `<input>` types that do not accept typed text; focus on these must not suppress bare-key shortcuts. */
const NON_TEXT_INPUT_TYPES: ReadonlySet<string> = new Set([
  "button",
  "submit",
  "reset",
  "checkbox",
  "radio",
  "file",
  "image",
  "range",
  "color",
]);

/** True when focus is in a text-entry element, where bare-key shortcuts must not fire. */
export function isTextInputFocused(): boolean {
  const el = document.activeElement as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "INPUT") return !NON_TEXT_INPUT_TYPES.has((el as HTMLInputElement).type);
  if (tag === "TEXTAREA" || tag === "SELECT") return true;
  if (el.isContentEditable === true) return true;
  // jsdom does not implement `isContentEditable` (always undefined), so fall back
  // to the raw attribute for test environments; harmless in real browsers.
  const attr = el.getAttribute("contenteditable");
  return attr === "true" || attr === "";
}
