const FOCUSABLE =
  "input:not([disabled]):not([type='hidden']), button:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

/** The keyboard-reachable controls inside `root`, in DOM order (an unchecked radio of a checked group is skipped) */
export function focusables(root: Element): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => {
    if (el.closest("[inert]") && !root.closest("[inert]")) return false;
    const radio = el as HTMLInputElement;
    if (radio.type === "radio" && !radio.checked && radio.name) {
      const group = root.querySelectorAll<HTMLInputElement>(`input[type='radio'][name='${CSS.escape(radio.name)}']`);
      return ![...group].some((r) => r.checked);
    }
    return true;
  });
}

/** Focuses the first match of `preferred`, else the first control in `root`; false when there is none */
export function focusFirst(root: Element | null | undefined, preferred?: string): boolean {
  if (!root) return false;
  const el = (preferred ? root.querySelector<HTMLElement>(preferred) : null) ?? focusables(root)[0];
  el?.focus({ preventScroll: true });
  return !!el;
}

/** Tab past the last control goes to the first one, Shift+Tab before the first to the last */
export function cycleTab(e: KeyboardEvent, root: Element): void {
  if (e.key !== "Tab") return;
  const list = focusables(root);
  if (!list.length) return;
  const first = list[0];
  const last = list[list.length - 1];
  const at = document.activeElement;
  if (e.shiftKey ? at === first || !root.contains(at) : at === last) {
    e.preventDefault();
    (e.shiftKey ? last : first).focus();
  }
}
