import { computed, ref as vref, type ComputedRef, type Ref } from "vue";
import type { IWeekEventSegment } from "../types";

export interface UseMonthLayoutOptions {
  weekSegments: Ref<IWeekEventSegment[][]>;
  maxLanes?: Ref<number>;
}

function packRow(segs: IWeekEventSegment[]): { segment: IWeekEventSegment; lane: number }[] {
  const sorted = [...segs].sort((a, b) => a.startCol - b.startCol || b.endCol - a.endCol);
  const laneEnds: number[] = []; // laneEnds[i] = last endCol occupied on lane i
  return sorted.map((segment) => {
    let lane = laneEnds.findIndex((end) => end < segment.startCol);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(segment.endCol);
    } else laneEnds[lane] = segment.endCol;
    return { segment, lane };
  });
}

export function useMonthLayout(opts: UseMonthLayoutOptions) {
  const maxLanes = opts.maxLanes ?? vref(3);

  const packed = computed(() => opts.weekSegments.value.map(packRow));

  const laidOut: ComputedRef<{ segment: IWeekEventSegment; lane: number }[][]> = computed(() =>
    packed.value.map((row) => row.filter((x) => x.lane < maxLanes.value)),
  );

  const overflowByDay: ComputedRef<number[][]> = computed(() =>
    packed.value.map((row) => {
      const counts = new Array(7).fill(0);
      for (const { segment, lane } of row) {
        if (lane < maxLanes.value) continue;
        for (let c = segment.startCol; c <= segment.endCol; c++) counts[c]++;
      }
      return counts;
    }),
  );

  return { laidOut, overflowByDay };
}
