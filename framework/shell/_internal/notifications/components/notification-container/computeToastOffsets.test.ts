import { describe, it, expect } from "vitest";
import { GAP, VISIBLE_TOASTS, computeToastOffsets } from "./computeToastOffsets";

describe("computeToastOffsets", () => {
  it("handles an empty stack", () => {
    const layout = computeToastOffsets([], new Map(), true);
    expect(layout.toasts).toEqual([]);
    expect(layout.frontHeight).toBe(0);
    // count=0 hits the collapsed branch: 0 + Math.min(-1, VISIBLE_TOASTS-1)*GAP
    // = -GAP. Preserved verbatim from the original component (an empty <ol> is
    // never actually rendered with children, so this only affects the style).
    expect(layout.groupHeight).toBe(-GAP);
  });

  it("single toast: front height is its own, offset 0, z-index 1", () => {
    const heights = new Map<string | number, number>([["a", 50]]);
    const layout = computeToastOffsets(["a"], heights, true);

    expect(layout.frontHeight).toBe(50);
    expect(layout.toasts).toHaveLength(1);
    expect(layout.toasts[0]).toEqual({
      sonnerIndex: 0,
      zIndex: 1,
      offset: 0,
      initialHeight: 50,
    });
    // count <= 1 → collapsed branch: frontHeight + 0 gaps
    expect(layout.groupHeight).toBe(50);
  });

  it("sonnerIndex: 0 = newest (last), increasing toward oldest (first)", () => {
    // ids are oldest → newest
    const layout = computeToastOffsets(["old", "mid", "new"], new Map(), true);
    expect(layout.toasts.map((t) => t.sonnerIndex)).toEqual([2, 1, 0]);
  });

  it("z-index: front (newest) is highest", () => {
    const layout = computeToastOffsets(["old", "mid", "new"], new Map(), true);
    // zIndex = count - sonnerIndex
    expect(layout.toasts.map((t) => t.zIndex)).toEqual([1, 2, 3]);
  });

  it("expanded offset = sum of newer heights + gap * sonnerIndex", () => {
    const heights = new Map<string | number, number>([
      ["old", 30],
      ["mid", 40],
      ["new", 50],
    ]);
    const layout = computeToastOffsets(["old", "mid", "new"], heights, true);

    // new (sonner 0): offset 0
    expect(layout.toasts[2].offset).toBe(0);
    // mid (sonner 1): newer heights = new(50); + GAP*1
    expect(layout.toasts[1].offset).toBe(50 + GAP);
    // old (sonner 2): newer heights = mid(40)+new(50); + GAP*2
    expect(layout.toasts[0].offset).toBe(40 + 50 + GAP * 2);
  });

  it("frontHeight is the last (newest) toast's height", () => {
    const heights = new Map<string | number, number>([
      ["old", 30],
      ["new", 60],
    ]);
    const layout = computeToastOffsets(["old", "new"], heights, true);
    expect(layout.frontHeight).toBe(60);
  });

  it("missing heights default to 0", () => {
    const layout = computeToastOffsets(["a", "b"], new Map(), true);
    expect(layout.toasts[0].initialHeight).toBe(0);
    expect(layout.toasts[1].initialHeight).toBe(0);
    expect(layout.frontHeight).toBe(0);
  });

  it("expanded groupHeight = oldest offset + oldest height", () => {
    const heights = new Map<string | number, number>([
      ["old", 30],
      ["mid", 40],
      ["new", 50],
    ]);
    const layout = computeToastOffsets(["old", "mid", "new"], heights, true);

    // oldestOffset = (count-1)*GAP + sum of ids[1..] heights = 2*GAP + (40+50)
    // + oldest height (ids[0]=30)
    const expected = 2 * GAP + (40 + 50) + 30;
    expect(layout.groupHeight).toBe(expected);
  });

  it("collapsed groupHeight = front height + capped visible-back gaps", () => {
    const heights = new Map<string | number, number>([
      ["a", 20],
      ["b", 20],
      ["c", 20],
      ["d", 70], // newest = front
    ]);
    const layout = computeToastOffsets(["a", "b", "c", "d"], heights, false);

    // count-1 = 3 back toasts, capped at VISIBLE_TOASTS-1 = 2
    const expected = 70 + Math.min(3, VISIBLE_TOASTS - 1) * GAP;
    expect(layout.groupHeight).toBe(expected);
    expect(Math.min(3, VISIBLE_TOASTS - 1)).toBe(2);
  });

  it("is deterministic for identical input", () => {
    const heights = new Map<string | number, number>([
      ["a", 33],
      ["b", 44],
    ]);
    const a = computeToastOffsets(["a", "b"], heights, true);
    const b = computeToastOffsets(["a", "b"], heights, true);
    expect(a).toEqual(b);
  });
});
