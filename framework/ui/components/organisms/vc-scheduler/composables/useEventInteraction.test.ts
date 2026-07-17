import { describe, it, expect, vi } from "vitest";
import { ref } from "vue";
import {
  useEventInteraction,
  useClickDiscriminator,
} from "@ui/components/organisms/vc-scheduler/composables/useEventInteraction";
import type { ISchedulerEvent } from "@ui/components/organisms/vc-scheduler/types";

const DAY = 86_400_000;
const base = new Date("2026-07-01T00:00:00Z").getTime();
// test grid: clientX encodes day offset (1px = 1 day), clientY ignored
const dayFromPoint = (x: number) => new Date(base + x * DAY);
const ev = (o: Partial<ISchedulerEvent> = {}): ISchedulerEvent => ({
  id: "a",
  title: "A",
  start: new Date(base + 2 * DAY),
  end: new Date(base + 4 * DAY),
  allDay: true,
  ...o,
});

const make = (over = {}) =>
  useEventInteraction({
    editable: ref(true),
    isEventEditable: () => true,
    dayFromPoint,
    onUpdate: vi.fn(),
    onCreate: vi.fn(),
    ...over,
  });

describe("useEventInteraction — move", () => {
  it("shifts both edges by the day delta", () => {
    const i = make();
    i.beginMove(ev(), 2, 0); // pointer on the event's start day
    i.updatePointer(5, 0); // +3 days
    expect(i.pending.value!.start.getTime()).toBe(base + 5 * DAY);
    expect(i.pending.value!.end.getTime()).toBe(base + 7 * DAY);
  });
});

describe("useEventInteraction — guards", () => {
  it("does not start a move when editable=false", () => {
    const i = make({ editable: ref(false) });
    i.beginMove(ev(), 2, 0);
    expect(i.pending.value).toBeNull();
  });
  it("does not start when isEventEditable returns false", () => {
    const i = make({ isEventEditable: () => false });
    i.beginMove(ev(), 2, 0);
    expect(i.pending.value).toBeNull();
  });
  it("commit is a no-op (no onUpdate) when nothing moved", () => {
    const onUpdate = vi.fn();
    const i = make({ onUpdate });
    i.beginMove(ev(), 2, 0);
    i.commit(); // never moved
    expect(onUpdate).not.toHaveBeenCalled();
    expect(i.pending.value).toBeNull();
  });
});

describe("useEventInteraction — create", () => {
  it("beginCreate + drag emits onCreate with the spanned range on commit", () => {
    const onCreate = vi.fn();
    const i = make({ onCreate });
    i.beginCreate(3, 0);
    i.updatePointer(6, 0);
    i.commit();
    expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ allDay: true }));
  });
});

describe("empty-cell click disambiguation", () => {
  it("a lone click resolves to a single intent after the delay", () => {
    vi.useFakeTimers();
    const onIntent = vi.fn();
    const d = useClickDiscriminator({ onIntent });

    d.click("A");
    expect(onIntent).not.toHaveBeenCalled();
    vi.advanceTimersByTime(220);

    expect(onIntent).toHaveBeenCalledTimes(1);
    expect(onIntent).toHaveBeenCalledWith("single", "A");
    vi.useRealTimers();
  });

  it("two quick clicks on the SAME key resolve to one double intent and no single", () => {
    vi.useFakeTimers();
    const onIntent = vi.fn();
    const d = useClickDiscriminator({ onIntent });

    d.click("A");
    vi.advanceTimersByTime(100); // well within the 220ms window
    d.click("A");

    expect(onIntent).toHaveBeenCalledTimes(1);
    expect(onIntent).toHaveBeenCalledWith("double", "A");

    // Confirm the pending single never fires afterwards.
    vi.advanceTimersByTime(1000);
    expect(onIntent).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("cancel() discards a pending single so it never fires (e.g. a drag started)", () => {
    vi.useFakeTimers();
    const onIntent = vi.fn();
    const d = useClickDiscriminator({ onIntent });

    d.click("A");
    d.cancel();
    vi.advanceTimersByTime(1000);

    expect(onIntent).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("a click after the delay elapsed starts a fresh single, not a double", () => {
    vi.useFakeTimers();
    const onIntent = vi.fn();
    const d = useClickDiscriminator({ onIntent });

    d.click("A");
    vi.advanceTimersByTime(220);
    expect(onIntent).toHaveBeenCalledTimes(1);
    expect(onIntent).toHaveBeenNthCalledWith(1, "single", "A");

    d.click("A");
    vi.advanceTimersByTime(220);
    expect(onIntent).toHaveBeenCalledTimes(2);
    expect(onIntent).toHaveBeenNthCalledWith(2, "single", "A");
    vi.useRealTimers();
  });

  it("two quick clicks on DIFFERENT keys resolve to two singles, never a double", () => {
    vi.useFakeTimers();
    const onIntent = vi.fn();
    const d = useClickDiscriminator({ onIntent });

    d.click("A");
    vi.advanceTimersByTime(100); // well within the 220ms window
    d.click("B"); // different target: flushes A's pending click as a single immediately

    expect(onIntent).toHaveBeenCalledTimes(1);
    expect(onIntent).toHaveBeenNthCalledWith(1, "single", "A");

    vi.advanceTimersByTime(220); // B's own timer elapses
    expect(onIntent).toHaveBeenCalledTimes(2);
    expect(onIntent).toHaveBeenNthCalledWith(2, "single", "B");
    expect(onIntent).not.toHaveBeenCalledWith("double", expect.anything());
    vi.useRealTimers();
  });
});
