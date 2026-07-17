import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { useTimeScale } from "@ui/components/organisms/vc-scheduler/composables/useTimeScale";

const range = () => ref({ start: new Date("2026-01-01T00:00:00Z"), end: new Date("2026-01-08T00:00:00Z") });

describe("useTimeScale — day zoom", () => {
  it("maps range start to x=0 and each day to a fixed unit width", () => {
    const { dateToX, unitWidth } = useTimeScale({ zoom: ref("day"), range: range() });
    expect(dateToX(new Date("2026-01-01T00:00:00Z"))).toBe(0);
    expect(dateToX(new Date("2026-01-02T00:00:00Z"))).toBeCloseTo(unitWidth.value, 5);
  });

  it("xToDate is the inverse of dateToX", () => {
    const { dateToX, xToDate } = useTimeScale({ zoom: ref("day"), range: range() });
    const d = new Date("2026-01-03T12:00:00Z");
    const back = xToDate(dateToX(d));
    expect(Math.abs(back.getTime() - d.getTime())).toBeLessThan(1000);
  });

  it("snapDate rounds to the day boundary when snap='auto'", () => {
    const { snapDate } = useTimeScale({ zoom: ref("day"), range: range(), snap: ref("auto") });
    const snapped = snapDate(new Date("2026-01-03T15:20:00Z"));
    expect(snapped.getUTCHours()).toBe(0);
    expect(snapped.getUTCDate()).toBe(4); // rounds to nearest day
  });

  it("generates one fine tick per day across the range", () => {
    const { fineTicks } = useTimeScale({ zoom: ref("day"), range: range() });
    expect(fineTicks.value.length).toBe(7);
    expect(fineTicks.value[0].x).toBe(0);
  });

  it("generates coarse (month) ticks with labels", () => {
    const { coarseTicks } = useTimeScale({ zoom: ref("day"), range: range() });
    expect(coarseTicks.value[0].label).toMatch(/Jan|январ/i);
  });
});
