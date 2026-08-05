import { nextTick } from "vue";

/**
 * Focuses `getTarget()` — but only if nothing meaningful holds focus by then.
 *
 * Use it where the shell changes context (a route change, a panel opening, a control
 * being replaced) and focus would otherwise be left on `<body>`, making the next Tab
 * restart from the top of the document (WCAG 2.4.3 Focus Order).
 *
 * Two details make this a shared helper rather than an inline `focus()` call:
 *
 * - **The check must happen after the DOM is patched.** At call time the node the
 *   user interacted with is usually still focused *and still connected*, and only
 *   becomes detached during the patch that follows. Testing "was focus lost?" any
 *   earlier answers "no", so the call is skipped — and focus drops to `<body>` a tick
 *   later.
 * - **It must decline when focus is held.** A view that autofocuses a field keeps it,
 *   and a user who has already moved on is not interrupted. This repairs lost focus;
 *   it does not dictate focus.
 *
 * For deliberately taking focus (opening a menu, entering an editor) call `focus()`
 * directly — this helper will refuse.
 *
 * `getTarget` is a callback because the target often does not exist yet at call time.
 */
export function focusIfLoose(getTarget: () => HTMLElement | null | undefined): void {
  nextTick(() => {
    const active = document.activeElement;
    const focusIsLoose = !active || active === document.body || active === document.documentElement;
    if (!focusIsLoose) return;

    const target = getTarget();
    if (!target?.isConnected || typeof target.focus !== "function") return;

    target.focus();
  });
}
