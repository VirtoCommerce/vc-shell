/**
 * Shared registry for opened dropdown panels and their anchor elements.
 * Must be module-scoped so nested panel instances can see each other.
 */
export const panelAnchorRegistry = new WeakMap<Element, HTMLElement | null>();
