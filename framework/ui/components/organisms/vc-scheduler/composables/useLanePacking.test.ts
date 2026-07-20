import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { useLanePacking } from "@ui/components/organisms/vc-scheduler/composables/useLanePacking";
import type { ISchedulerBar } from "@ui/components/organisms/vc-scheduler/types";

const bar = (id: string, resourceId: string, s: string, e: string): ISchedulerBar => ({
  id,
  resourceId,
  start: new Date(s),
  end: new Date(e),
});

describe("useLanePacking", () => {
  it("puts non-overlapping bars on the same lane", () => {
    const bars = ref([bar("a", "r1", "2026-01-01", "2026-01-03"), bar("b", "r1", "2026-01-05", "2026-01-07")]);
    const { packedByResource, laneCount } = useLanePacking(bars);
    const packed = packedByResource.value.get("r1")!;
    expect(packed.every((p) => p.lane === 0)).toBe(true);
    expect(laneCount("r1")).toBe(1);
  });

  it("stacks overlapping bars onto separate lanes", () => {
    const bars = ref([bar("a", "r1", "2026-01-01", "2026-01-05"), bar("b", "r1", "2026-01-03", "2026-01-08")]);
    const { packedByResource, laneCount } = useLanePacking(bars);
    const lanes = packedByResource.value
      .get("r1")!
      .map((p) => p.lane)
      .sort();
    expect(lanes).toEqual([0, 1]);
    expect(laneCount("r1")).toBe(2);
  });

  it("treats touching edges (end === next start) as non-overlapping", () => {
    const bars = ref([bar("a", "r1", "2026-01-01", "2026-01-03"), bar("b", "r1", "2026-01-03", "2026-01-05")]);
    const { laneCount } = useLanePacking(bars);
    expect(laneCount("r1")).toBe(1);
  });

  it("isolates packing per resource", () => {
    const bars = ref([bar("a", "r1", "2026-01-01", "2026-01-09"), bar("b", "r2", "2026-01-01", "2026-01-09")]);
    const { laneCount } = useLanePacking(bars);
    expect(laneCount("r1")).toBe(1);
    expect(laneCount("r2")).toBe(1);
  });
});
