const running = new WeakMap<Element, Animation>();

function reducedMotion(): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * FLIP: measures the elements, runs `change`, then animates each one from where it was to where it is now.
 * Rects include a running animation's transform, so an interrupted move continues from what is on screen.
 */
export async function flip(
  elements: HTMLElement[],
  change: () => unknown,
  { duration = 250, easing = "cubic-bezier(0.22, 1, 0.36, 1)" } = {},
): Promise<void> {
  if (reducedMotion()) {
    await change();
    return;
  }
  const before = new Map(elements.map((el) => [el, el.getBoundingClientRect()]));
  elements.forEach((el) => running.get(el)?.cancel());
  await change();
  for (const [el, from] of before) {
    if (!el.isConnected || typeof el.animate !== "function") continue;
    const to = el.getBoundingClientRect();
    const dx = from.left - to.left;
    const dy = from.top - to.top;
    const sx = to.width ? from.width / to.width : 1;
    const sy = to.height ? from.height / to.height : 1;
    if (!dx && !dy && sx === 1 && sy === 1) continue;
    running.set(
      el,
      el.animate(
        [
          { transformOrigin: "0 0", transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
          { transformOrigin: "0 0", transform: "none" },
        ],
        { duration, easing },
      ),
    );
  }
}
