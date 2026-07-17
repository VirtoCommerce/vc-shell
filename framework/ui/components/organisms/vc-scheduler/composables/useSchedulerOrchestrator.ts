import { computed, type ComputedRef, type Ref } from "vue";
import { useTimeScale } from "./useTimeScale";
import { useLanePacking } from "./useLanePacking";
import { useSchedulerViewport } from "./useSchedulerViewport";
import { useBarInteraction } from "./useBarInteraction";
import type { ISchedulerBar, ISchedulerResource, SchedulerZoom, SchedulerSnap, IBarUpdate } from "../types";

const LANE_HEIGHT = 28;
const LANE_GAP = 4;
const ROW_PADDING = 8;

export interface UseSchedulerOrchestratorOptions {
  resources: Ref<ISchedulerResource[]>;
  bars: Ref<ISchedulerBar[]>;
  zoom: Ref<SchedulerZoom>;
  range: Ref<{ start: Date; end: Date }>;
  editable: Ref<boolean>;
  snap: Ref<SchedulerSnap>;
  isBarEditable: (bar: ISchedulerBar) => boolean;
  scrollLeft: Ref<number>;
  viewportWidth: Ref<number>;
  onBarUpdate: (u: IBarUpdate) => void;
}

export function useSchedulerOrchestrator(opts: UseSchedulerOrchestratorOptions) {
  const autoRange: ComputedRef<{ start: Date; end: Date }> = computed(() => {
    if (opts.bars.value.length === 0) return opts.range.value;
    const starts = opts.bars.value.map((b) => b.start.getTime());
    const ends = opts.bars.value.map((b) => b.end.getTime());
    return { start: new Date(Math.min(...starts)), end: new Date(Math.max(...ends)) };
  });

  const scale = useTimeScale({ zoom: opts.zoom, range: opts.range, snap: opts.snap });
  const packing = useLanePacking(opts.bars);
  const viewport = useSchedulerViewport({
    zoom: opts.zoom,
    unitWidth: scale.unitWidth,
    totalWidth: scale.totalWidth,
    scrollLeft: opts.scrollLeft,
    viewportWidth: opts.viewportWidth,
  });
  const interaction = useBarInteraction({
    bars: opts.bars,
    snapDate: scale.snapDate,
    xToDate: scale.xToDate,
    isBarEditable: opts.isBarEditable,
    onCommit: opts.onBarUpdate,
  });

  const rowHeight = (resourceId: string) => {
    const lanes = packing.packedByResource.value.has(resourceId) ? packing.laneCount(resourceId) : 0;
    if (lanes === 0) return LANE_HEIGHT + ROW_PADDING; // empty row min height
    return lanes * LANE_HEIGHT + (lanes - 1) * LANE_GAP + ROW_PADDING;
  };

  return { scale, packing, viewport, interaction, rowHeight, autoRange };
}
