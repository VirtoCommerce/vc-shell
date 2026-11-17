export interface WidthTransition {
  /** How many pixels wider (positive) or narrower the element ends up. */
  delta: number;
  duration: number;
  easing: string;
}

function contentWidth(el: Element): number {
  const style = getComputedStyle(el);
  return el.clientWidth - (parseFloat(style.paddingLeft) || 0) - (parseFloat(style.paddingRight) || 0);
}

// Keyframes carry computed values: px, or a percentage of the containing block.
function toPx(value: unknown, base: number): number | undefined {
  if (typeof value !== "string") return undefined;
  const match = /^(-?\d*\.?\d+)(px|%)$/.exec(value.trim());
  if (!match) return undefined;
  const n = Number(match[1]);
  return match[2] === "px" ? n : (n / 100) * base;
}

/** Reads the running CSS width transition of `el`: where it ends and how it gets there. */
export function readWidthTransition(el: Element): WidthTransition | undefined {
  const transition = el
    .getAnimations?.()
    .find((animation) => (animation as CSSTransition).transitionProperty === "width");
  const effect = transition?.effect as KeyframeEffect | null | undefined;
  if (!effect || typeof effect.getKeyframes !== "function") return undefined;
  const frames = effect.getKeyframes();
  const base = el.parentElement ? contentWidth(el.parentElement) : 0;
  const from = toPx(frames[0]?.width, base);
  const to = toPx(frames[frames.length - 1]?.width, base);
  if (from === undefined || to === undefined) return undefined;
  const { duration, easing } = effect.getTiming();
  return { delta: to - from, duration: typeof duration === "number" ? duration : 0, easing: easing ?? "ease" };
}
