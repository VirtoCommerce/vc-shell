import { describe, it, expect, vi } from "vitest";
import { ref } from "vue";
import { useSchedulerOrchestrator } from "@ui/components/organisms/vc-scheduler/composables/useSchedulerOrchestrator";
import type { ISchedulerBar, ISchedulerResource } from "@ui/components/organisms/vc-scheduler/types";

const resources: ISchedulerResource[] = [{ id: "r1", label: "Promo A" }];
const bars: ISchedulerBar[] = [
  { id: "a", resourceId: "r1", start: new Date("2026-01-01"), end: new Date("2026-01-05") },
  { id: "b", resourceId: "r1", start: new Date("2026-01-03"), end: new Date("2026-01-08") },
];

const make = () =>
  useSchedulerOrchestrator({
    resources: ref(resources),
    bars: ref(bars),
    zoom: ref("day"),
    range: ref({ start: new Date("2026-01-01"), end: new Date("2026-01-10") }),
    editable: ref(true),
    snap: ref("auto"),
    isBarEditable: () => true,
    scrollLeft: ref(0),
    viewportWidth: ref(800),
    onBarUpdate: vi.fn(),
  });

describe("useSchedulerOrchestrator", () => {
  it("exposes wired sub-composables", () => {
    const o = make();
    expect(o.scale.dateToX(new Date("2026-01-01"))).toBe(0);
    expect(o.packing.laneCount("r1")).toBe(2);
    expect(typeof o.viewport.zoomIn).toBe("function");
  });

  it("rowHeight grows with lane count", () => {
    const o = make();
    expect(o.rowHeight("r1")).toBeGreaterThan(o.rowHeight("missing"));
  });
});
