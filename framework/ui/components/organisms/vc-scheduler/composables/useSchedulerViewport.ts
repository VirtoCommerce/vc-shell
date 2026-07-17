import { computed, type Ref } from "vue";
import { SCHEDULER_ZOOM_LEVELS, type SchedulerZoom } from "../types";

export interface UseSchedulerViewportOptions {
  zoom: Ref<SchedulerZoom>;
  unitWidth: Ref<number>;
  totalWidth: Ref<number>;
  scrollLeft: Ref<number>;
  viewportWidth: Ref<number>;
  tolerance?: number;
}

export function useSchedulerViewport(opts: UseSchedulerViewportOptions) {
  const tolerance = opts.tolerance ?? 2;

  const visibleXRange = computed(() => {
    const pad = tolerance * opts.unitWidth.value;
    const startX = Math.max(0, opts.scrollLeft.value - pad);
    const endX = Math.min(opts.totalWidth.value, opts.scrollLeft.value + opts.viewportWidth.value + pad);
    return { startX, endX };
  });

  // SCHEDULER_ZOOM_LEVELS is fine→coarse; zoomIn moves toward index 0.
  const zoomIndex = computed(() => SCHEDULER_ZOOM_LEVELS.indexOf(opts.zoom.value));
  const canZoomIn = computed(() => zoomIndex.value > 0);
  const canZoomOut = computed(() => zoomIndex.value < SCHEDULER_ZOOM_LEVELS.length - 1);
  const zoomIn = () => {
    if (canZoomIn.value) opts.zoom.value = SCHEDULER_ZOOM_LEVELS[zoomIndex.value - 1];
  };
  const zoomOut = () => {
    if (canZoomOut.value) opts.zoom.value = SCHEDULER_ZOOM_LEVELS[zoomIndex.value + 1];
  };

  return { visibleXRange, zoomIn, zoomOut, canZoomIn, canZoomOut };
}
