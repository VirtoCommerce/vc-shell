import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { useSchedulerViewport } from "@ui/components/organisms/vc-scheduler/composables/useSchedulerViewport";

describe("useSchedulerViewport", () => {
  it("computes a visible x-range padded by tolerance*unitWidth", () => {
    const { visibleXRange } = useSchedulerViewport({
      zoom: ref("day"),
      unitWidth: ref(48),
      totalWidth: ref(4800),
      scrollLeft: ref(480),
      viewportWidth: ref(960),
      tolerance: 2,
    });
    expect(visibleXRange.value.startX).toBe(480 - 2 * 48);
    expect(visibleXRange.value.endX).toBe(480 + 960 + 2 * 48);
  });

  it("clamps startX at 0 and endX at totalWidth", () => {
    const { visibleXRange } = useSchedulerViewport({
      zoom: ref("day"),
      unitWidth: ref(48),
      totalWidth: ref(500),
      scrollLeft: ref(0),
      viewportWidth: ref(960),
      tolerance: 2,
    });
    expect(visibleXRange.value.startX).toBe(0);
    expect(visibleXRange.value.endX).toBe(500);
  });

  it("zoomIn/zoomOut step through SCHEDULER_ZOOM_LEVELS and clamp at ends", () => {
    const zoom = ref<"hour" | "day" | "week" | "month" | "quarter" | "year">("day");
    const vp = useSchedulerViewport({
      zoom,
      unitWidth: ref(48),
      totalWidth: ref(100),
      scrollLeft: ref(0),
      viewportWidth: ref(100),
    });
    vp.zoomIn();
    expect(zoom.value).toBe("hour");
    expect(vp.canZoomIn.value).toBe(false);
    vp.zoomIn();
    expect(zoom.value).toBe("hour"); // clamped
    vp.zoomOut();
    expect(zoom.value).toBe("day");
  });
});
