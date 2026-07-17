import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { useMonthLayout } from "@ui/components/organisms/vc-scheduler/composables/useMonthLayout";
import type { IWeekEventSegment } from "@ui/components/organisms/vc-scheduler/types";

const seg = (id: string, startCol: number, endCol: number): IWeekEventSegment => ({
  event: { id, title: id, start: new Date(), end: new Date(), allDay: true },
  startCol,
  endCol,
  continuesLeft: false,
  continuesRight: false,
});

describe("useMonthLayout", () => {
  it("assigns overlapping segments to distinct lanes", () => {
    const weekSegments = ref<IWeekEventSegment[][]>([[seg("a", 0, 3), seg("b", 2, 5)], [], [], [], [], []]);
    const { laidOut } = useMonthLayout({ weekSegments });
    const lanes = laidOut.value[0].map((x) => x.lane).sort();
    expect(lanes).toEqual([0, 1]);
  });

  it("hides segments beyond maxLanes and counts overflow per covered day", () => {
    const weekSegments = ref<IWeekEventSegment[][]>([
      [seg("a", 0, 0), seg("b", 0, 0), seg("c", 0, 0), seg("d", 0, 0)],
      [],
      [],
      [],
      [],
      [],
    ]);
    const { laidOut, overflowByDay } = useMonthLayout({ weekSegments, maxLanes: ref(3) });
    expect(laidOut.value[0].length).toBe(3); // only 3 shown
    expect(overflowByDay.value[0][0]).toBe(1); // 1 hidden on col 0
  });
});
