import { ref, type Ref } from "vue";
import type { ISchedulerBar, IBarUpdate } from "../types";

type Mode = { kind: "move" } | { kind: "resize"; edge: "start" | "end" };

export interface UseBarInteractionOptions {
  bars: Ref<ISchedulerBar[]>;
  snapDate: (d: Date) => Date;
  xToDate: (x: number) => Date;
  isBarEditable: (bar: ISchedulerBar) => boolean;
  onCommit: (update: IBarUpdate) => void;
}

const MIN_MS = 60_000; // a bar may never collapse below 1 minute

export function useBarInteraction(opts: UseBarInteractionOptions) {
  const pending = ref<{ id: string; start: Date; end: Date } | null>(null);
  let mode: Mode | null = null;
  let origin: { pointerX: number; start: number; end: number } | null = null;

  const begin = (bar: ISchedulerBar, m: Mode, pointerX: number) => {
    if (!opts.isBarEditable(bar)) return;
    mode = m;
    origin = { pointerX, start: bar.start.getTime(), end: bar.end.getTime() };
    pending.value = { id: bar.id, start: new Date(bar.start), end: new Date(bar.end) };
  };
  const beginMove = (bar: ISchedulerBar, pointerX: number) => begin(bar, { kind: "move" }, pointerX);
  const beginResize = (bar: ISchedulerBar, edge: "start" | "end", pointerX: number) =>
    begin(bar, { kind: "resize", edge }, pointerX);

  const updatePointer = (pointerX: number) => {
    if (!mode || !origin || !pending.value) return;
    const deltaMs = opts.xToDate(pointerX).getTime() - opts.xToDate(origin.pointerX).getTime();

    if (mode.kind === "move") {
      const start = opts.snapDate(new Date(origin.start + deltaMs));
      const shift = start.getTime() - origin.start;
      pending.value = { id: pending.value.id, start, end: new Date(origin.end + shift) };
      return;
    }
    if (mode.edge === "start") {
      let start = opts.snapDate(new Date(origin.start + deltaMs)).getTime();
      start = Math.min(start, origin.end - MIN_MS);
      pending.value = { id: pending.value.id, start: new Date(start), end: new Date(origin.end) };
    } else {
      let end = opts.snapDate(new Date(origin.end + deltaMs)).getTime();
      end = Math.max(end, origin.start + MIN_MS);
      pending.value = { id: pending.value.id, start: new Date(origin.start), end: new Date(end) };
    }
  };

  const commit = () => {
    if (pending.value && origin) {
      const changed = pending.value.start.getTime() !== origin.start || pending.value.end.getTime() !== origin.end;
      if (changed) opts.onCommit({ ...pending.value });
    }
    cancel();
  };
  const cancel = () => {
    pending.value = null;
    mode = null;
    origin = null;
  };

  const effectiveBar = (bar: ISchedulerBar): ISchedulerBar =>
    pending.value && pending.value.id === bar.id ? { ...bar, start: pending.value.start, end: pending.value.end } : bar;

  return { pending, effectiveBar, beginMove, beginResize, updatePointer, commit, cancel };
}
