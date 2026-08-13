/** Set on the root of every rendered blade so a focused node can be traced back to it. */
export const BLADE_ID_ATTRIBUTE = "data-blade-id";

interface BladeLike {
  id: string;
  visible?: boolean;
}

/**
 * Picks the blade a keyboard shortcut should act on: the one holding focus,
 * falling back to the stack's active (topmost visible) blade.
 *
 * The fallback is not an edge case — focus sits on `<body>` after sign-in,
 * Maximize and Save (VCST-5670), and there the topmost blade is the only
 * sensible target.
 *
 * Kept separate from `useBladeStack.activeBlade`, which also decides the parent
 * of a newly opened blade; making that focus-dependent would re-parent blades.
 */
export function resolveShortcutTargetBlade<T extends BladeLike>(
  blades: readonly T[],
  fallback: T | undefined,
  activeElement: Element | null,
): T | undefined {
  const host = activeElement?.closest?.(`[${BLADE_ID_ATTRIBUTE}]`);
  const focusedId = host?.getAttribute(BLADE_ID_ATTRIBUTE);
  if (!focusedId) return fallback;

  // The DOM can outlive the descriptor while a blade is being torn down.
  const match = blades.find((blade) => blade.id === focusedId);
  if (!match || match.visible === false) return fallback;

  return match;
}
