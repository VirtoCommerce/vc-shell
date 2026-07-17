import { computed, type ComputedRef, type Ref } from "vue";
import type { ISchedulerBar, IPackedBar } from "../types";

/** Greedy interval-graph coloring: each bar takes the lowest lane whose last end <= its start. */
function packLanes(bars: ISchedulerBar[]): IPackedBar[] {
  const sorted = [...bars].sort((a, b) => a.start.getTime() - b.start.getTime());
  const laneEnds: number[] = []; // laneEnds[i] = last end time on lane i
  return sorted.map((b) => {
    let lane = laneEnds.findIndex((end) => end <= b.start.getTime());
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(b.end.getTime());
    } else {
      laneEnds[lane] = b.end.getTime();
    }
    return { ...b, lane };
  });
}

export function useLanePacking(bars: Ref<ISchedulerBar[]>) {
  const packedByResource: ComputedRef<Map<string, IPackedBar[]>> = computed(() => {
    const byResource = new Map<string, ISchedulerBar[]>();
    for (const b of bars.value) {
      const list = byResource.get(b.resourceId) ?? [];
      list.push(b);
      byResource.set(b.resourceId, list);
    }
    const result = new Map<string, IPackedBar[]>();
    for (const [resourceId, list] of byResource) result.set(resourceId, packLanes(list));
    return result;
  });

  const laneCount = (resourceId: string) => {
    const packed = packedByResource.value.get(resourceId);
    if (!packed || packed.length === 0) return 1;
    return Math.max(...packed.map((p) => p.lane)) + 1;
  };

  return { packedByResource, laneCount };
}
