import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { effectScope, nextTick, ref, type EffectScope } from "vue";
import { useRowReveal, OPEN_DELAY, CLOSE_DELAY } from "./useRowReveal";

const scopes: EffectScope[] = [];

function setup(opts: { scrollWidth?: number; clientWidth?: number; enabled?: boolean } = {}) {
  const el = document.createElement("div");
  Object.defineProperty(el, "scrollWidth", { value: opts.scrollWidth ?? 500, configurable: true });
  Object.defineProperty(el, "clientWidth", { value: opts.clientWidth ?? 300, configurable: true });
  const pill = document.createElement("button");
  const search = document.createElement("input");
  el.append(pill, search);
  document.body.append(el);

  const enabled = ref(opts.enabled ?? true);
  const keepOpen = ref(false);
  const scope = effectScope();
  scopes.push(scope);
  const reveal = scope.run(() =>
    useRowReveal({
      row: ref(el),
      enabled: () => enabled.value,
      keepOpen: () => keepOpen.value,
      ignoreFocus: (t) => t === search,
    }),
  )!;
  return { el, pill, search, enabled, keepOpen, reveal };
}

const focusEvent = (target: Element, relatedTarget: Element | null = null) =>
  ({ target, relatedTarget }) as unknown as FocusEvent;

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: false })),
  );
});

afterEach(() => {
  scopes.splice(0).forEach((s) => s.stop());
  document.body.innerHTML = "";
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("useRowReveal", () => {
  it("does not unfold before 400ms of hover", () => {
    const { reveal } = setup();
    reveal.onPointerEnter();
    vi.advanceTimersByTime(OPEN_DELAY - 1);
    expect(reveal.unfolded.value).toBe(false);
    vi.advanceTimersByTime(1);
    expect(reveal.unfolded.value).toBe(true);
  });

  it("passing over (leave before 400ms) never unfolds", () => {
    const { reveal } = setup();
    reveal.onPointerEnter();
    vi.advanceTimersByTime(OPEN_DELAY - 100);
    reveal.onPointerLeave();
    vi.advanceTimersByTime(1000);
    expect(reveal.unfolded.value).toBe(false);
  });

  it("leaving folds after 150ms; coming back within it keeps it open", () => {
    const { reveal } = setup();
    reveal.onPointerEnter();
    vi.advanceTimersByTime(OPEN_DELAY);
    reveal.onPointerLeave();
    vi.advanceTimersByTime(CLOSE_DELAY - 1);
    reveal.onPointerEnter();
    vi.advanceTimersByTime(1000);
    expect(reveal.unfolded.value).toBe(true);

    reveal.onPointerLeave();
    vi.advanceTimersByTime(CLOSE_DELAY - 1);
    expect(reveal.unfolded.value).toBe(true);
    vi.advanceTimersByTime(1);
    expect(reveal.unfolded.value).toBe(false);
  });

  it("folds when the pointer moves outside without a pointerleave (the control under it was removed)", () => {
    const { reveal } = setup();
    reveal.onPointerEnter();
    vi.advanceTimersByTime(OPEN_DELAY);
    expect(reveal.unfolded.value).toBe(true);
    document.body.dispatchEvent(new Event("pointermove", { bubbles: true }));
    vi.advanceTimersByTime(CLOSE_DELAY);
    expect(reveal.unfolded.value).toBe(false);
  });

  it("focus on a pill unfolds at once; focus in the search does not", () => {
    const { reveal, pill, search } = setup();
    reveal.onFocusIn(focusEvent(search));
    expect(reveal.unfolded.value).toBe(false);
    reveal.onFocusIn(focusEvent(pill));
    expect(reveal.unfolded.value).toBe(true);
  });

  it("focus leaving the row folds, focus moving inside the row does not", () => {
    const { el, reveal, pill } = setup();
    const other = document.createElement("button");
    el.append(other);
    reveal.onFocusIn(focusEvent(pill));
    reveal.onFocusOut(focusEvent(pill, other));
    expect(reveal.unfolded.value).toBe(true);
    reveal.onFocusOut(focusEvent(pill, document.body));
    expect(reveal.unfolded.value).toBe(false);
  });

  it("focus moving from a pill into the search folds the row", () => {
    const { reveal, pill, search } = setup();
    reveal.onFocusIn(focusEvent(pill));
    expect(reveal.unfolded.value).toBe(true);
    reveal.onFocusOut(focusEvent(pill, search));
    reveal.onFocusIn(focusEvent(search, pill));
    expect(reveal.unfolded.value).toBe(false);
  });

  it("folds when the focused control is removed from the row", async () => {
    const { reveal, pill } = setup();
    pill.focus();
    reveal.onFocusIn(focusEvent(pill));
    expect(reveal.unfolded.value).toBe(true);
    pill.remove();
    await Promise.resolve();
    expect(reveal.unfolded.value).toBe(false);
  });

  it("re-measures when the row's content changes without a resize", async () => {
    const { el, reveal } = setup({ scrollWidth: 300, clientWidth: 300 });
    expect(reveal.clipped.value).toBe(false);
    Object.defineProperty(el, "scrollWidth", { value: 500, configurable: true });
    el.append(document.createElement("button"));
    await Promise.resolve();
    expect(reveal.clipped.value).toBe(true);
  });

  it("stays unfolded while keepOpen is true, folds when it turns false and pointer is away", async () => {
    const { reveal, keepOpen } = setup();
    reveal.onPointerEnter();
    vi.advanceTimersByTime(OPEN_DELAY);
    keepOpen.value = true;
    await nextTick();
    reveal.onPointerLeave();
    vi.advanceTimersByTime(1000);
    expect(reveal.unfolded.value).toBe(true);
    keepOpen.value = false;
    await nextTick();
    expect(reveal.unfolded.value).toBe(false);
  });

  it("does not fold on keepOpen false while the pointer is still over the row", async () => {
    const { reveal, keepOpen } = setup();
    keepOpen.value = true;
    reveal.onPointerEnter();
    vi.advanceTimersByTime(OPEN_DELAY);
    keepOpen.value = false;
    await nextTick();
    expect(reveal.unfolded.value).toBe(true);
  });

  it("does nothing when the row fits", () => {
    const { reveal, pill } = setup({ scrollWidth: 300, clientWidth: 300 });
    reveal.onPointerEnter();
    vi.advanceTimersByTime(OPEN_DELAY);
    reveal.onFocusIn(focusEvent(pill));
    expect(reveal.clipped.value).toBe(false);
    expect(reveal.unfolded.value).toBe(false);
  });

  it("does nothing when disabled", () => {
    const { reveal, pill } = setup({ enabled: false });
    reveal.onPointerEnter();
    vi.advanceTimersByTime(OPEN_DELAY);
    reveal.onFocusIn(focusEvent(pill));
    expect(reveal.unfolded.value).toBe(false);
  });

  it("animates the clip-path and folds only after the animation ends", async () => {
    const { el, reveal, pill } = setup();
    let finish!: () => void;
    const finished = new Promise<void>((r) => (finish = r));
    const animate = vi.fn(() => ({ finished, cancel: vi.fn() }));
    (el as unknown as { animate: unknown }).animate = animate;

    reveal.onFocusIn(focusEvent(pill));
    await nextTick();
    expect(animate).toHaveBeenCalledTimes(1);
    expect(reveal.unfolded.value).toBe(true);

    reveal.onFocusOut(focusEvent(pill, document.body));
    await nextTick();
    expect(animate).toHaveBeenCalledTimes(2);
    expect(reveal.unfolded.value).toBe(true);
    finish();
    await Promise.resolve();
    await Promise.resolve();
    await nextTick();
    expect(reveal.unfolded.value).toBe(false);
  });

  it("skips the animation under prefers-reduced-motion", async () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: true })),
    );
    const { el, reveal, pill } = setup();
    const animate = vi.fn();
    (el as unknown as { animate: unknown }).animate = animate;
    reveal.onFocusIn(focusEvent(pill));
    await nextTick();
    expect(animate).not.toHaveBeenCalled();
    expect(reveal.unfolded.value).toBe(true);
  });
});
