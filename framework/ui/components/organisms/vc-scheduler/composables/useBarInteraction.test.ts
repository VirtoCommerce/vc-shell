import { describe, it, expect, vi } from "vitest";
import { ref } from "vue";
import { useBarInteraction } from "@ui/components/organisms/vc-scheduler/composables/useBarInteraction";
import type { ISchedulerBar } from "@ui/components/organisms/vc-scheduler/types";

const DAY = 86_400_000;
const bar = (over: Partial<ISchedulerBar> = {}): ISchedulerBar => ({
  id: "a",
  resourceId: "r1",
  start: new Date("2026-01-05T00:00:00Z"),
  end: new Date("2026-01-08T00:00:00Z"),
  ...over,
});

// Test scale: 1px = 1ms so pointer math is trivial; snap to whole days.
const makeOpts = (over = {}) => ({
  bars: ref<ISchedulerBar[]>([bar()]),
  snapDate: (d: Date) => new Date(Math.round(d.getTime() / DAY) * DAY),
  xToDate: (x: number) => new Date(x),
  isBarEditable: () => true,
  onCommit: vi.fn(),
  ...over,
});

describe("useBarInteraction — move", () => {
  it("shifts both edges by the snapped pointer delta", () => {
    const opts = makeOpts();
    const { beginMove, updatePointer, pending } = useBarInteraction(opts);
    const b = bar();
    beginMove(b, b.start.getTime()); // pointer starts at bar start
    updatePointer(b.start.getTime() + 2 * DAY); // drag +2 days
    expect(pending.value!.start.getTime()).toBe(b.start.getTime() + 2 * DAY);
    expect(pending.value!.end.getTime()).toBe(b.end.getTime() + 2 * DAY);
  });

  it("commit calls onCommit with the pending range and clears pending", () => {
    const opts = makeOpts();
    const { beginMove, updatePointer, commit, pending } = useBarInteraction(opts);
    const b = bar();
    beginMove(b, b.start.getTime());
    updatePointer(b.start.getTime() + 1 * DAY);
    commit();
    expect(opts.onCommit).toHaveBeenCalledWith({
      id: "a",
      start: new Date(b.start.getTime() + DAY),
      end: new Date(b.end.getTime() + DAY),
    });
    expect(pending.value).toBeNull();
  });
});

describe("useBarInteraction — resize", () => {
  it("resize 'end' moves only the end edge and keeps end > start", () => {
    const opts = makeOpts();
    const { beginResize, updatePointer, pending } = useBarInteraction(opts);
    const b = bar();
    beginResize(b, "end", b.end.getTime());
    updatePointer(b.start.getTime() - DAY); // drag end before start
    expect(pending.value!.end.getTime()).toBeGreaterThan(pending.value!.start.getTime());
  });
});

describe("useBarInteraction — guards", () => {
  it("does not start when the bar is not editable", () => {
    const opts = makeOpts({ isBarEditable: () => false });
    const { beginMove, pending } = useBarInteraction(opts);
    beginMove(bar(), 0);
    expect(pending.value).toBeNull();
  });
});

describe("useBarInteraction — no-op commit", () => {
  it("does not call onCommit when the pointer never moved (plain click)", () => {
    const opts = makeOpts();
    const { beginMove, commit, pending } = useBarInteraction(opts);
    const b = bar();
    beginMove(b, b.start.getTime()); // pointerdown, no movement
    commit(); // pointerup right away
    expect(opts.onCommit).not.toHaveBeenCalled();
    expect(pending.value).toBeNull();
  });

  it("does not call onCommit when the pointer moved but snapped back to the original range", () => {
    const opts = makeOpts();
    const { beginMove, updatePointer, commit } = useBarInteraction(opts);
    const b = bar();
    beginMove(b, b.start.getTime());
    updatePointer(b.start.getTime() + 2 * DAY);
    updatePointer(b.start.getTime()); // drag back to the origin before releasing
    commit();
    expect(opts.onCommit).not.toHaveBeenCalled();
  });

  it("calls onCommit when the range actually changed", () => {
    const opts = makeOpts();
    const { beginMove, updatePointer, commit } = useBarInteraction(opts);
    const b = bar();
    beginMove(b, b.start.getTime());
    updatePointer(b.start.getTime() + 1 * DAY);
    commit();
    expect(opts.onCommit).toHaveBeenCalledTimes(1);
  });
});
