import { nextTick } from "vue";

/**
 * Focuses `getTarget()`, but only if nothing meaningful holds focus by then. For context
 * changes that would otherwise leave focus on `<body>`, making the next Tab restart from
 * the top of the document (WCAG 2.4.3 Focus Order).
 *
 * The check runs after the DOM is patched — earlier, the node the user interacted with is
 * still connected, so the repair is skipped — and declines when focus is held. To take
 * focus deliberately call `focus()`; this helper will refuse.
 */
/**
 * Focus is loose when nothing meaningful holds it.
 *
 * An element inside an `inert` subtree counts: it still reads as `activeElement` until
 * the browser blurs it. Maximizing a blade inerts the sidebar, and a check that only
 * asked "is this `<body>`?" declined, then lost focus a moment later (VCST-5859).
 */
function focusIsLoose(active: Element | null): boolean {
  if (!active || active === document.body || active === document.documentElement) return true;
  return Boolean(active.closest("[inert]"));
}

export function focusIfLoose(getTarget: () => HTMLElement | null | undefined): void {
  nextTick(() => {
    if (!focusIsLoose(document.activeElement)) return;

    const target = getTarget();
    if (!target?.isConnected || typeof target.focus !== "function") return;

    target.focus();
  });
}

/**
 * The region focus falls back to — the shell workspace, which carries `tabindex="-1"`
 * for exactly this. A dialog opened while focus was already loose has no opener to
 * return it to, and `<body>` makes the next Tab restart at the top.
 *
 * Looked up by selector because this is `core/` and the element belongs to `ui/`.
 * Returns null outside the shell.
 */
export function focusFallbackTarget(): HTMLElement | null {
  return document.querySelector<HTMLElement>(".vc-app__workspace");
}
