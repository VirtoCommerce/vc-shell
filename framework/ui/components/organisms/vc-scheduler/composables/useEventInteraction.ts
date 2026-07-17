import { ref, type Ref } from "vue";
import { startOfDay, addDays } from "date-fns";
import type { ISchedulerEvent } from "../types";

const DAY = 86_400_000;
type Mode = { kind: "move" } | { kind: "resize"; edge: "start" | "end" } | { kind: "create" };

/** Resolved disambiguation outcome for an empty-cell/slot click gesture. */
export type CreateIntentKind = "single" | "double" | "drag";

/** Upward intent emitted by the views instead of creating an event immediately. */
export interface ICreateIntent {
  start: Date;
  end: Date;
  allDay: boolean;
  anchorRect: DOMRect | null;
  kind: CreateIntentKind;
}

const DEFAULT_CLICK_DELAY = 220;

export interface ClickDiscriminatorOptions {
  /** Window (ms) to wait for a second click before resolving to "single". Default 220. */
  delay?: number;
  onIntent: (kind: "single" | "double", key: string) => void;
}

export interface ClickDiscriminator {
  /**
   * Register one resolved click on the given target key (e.g. a cell date or slot start time).
   * A second call on the SAME key before the delay elapses cancels the timer and resolves
   * "double" for that key. A second call on a DIFFERENT key immediately flushes the pending
   * click as "single" (for the original key) and starts a fresh single-click timer for the
   * new key — two clicks on different targets are always two independent singles, never a
   * double.
   */
  click: (key: string) => void;
  /** Discard a pending single-click timer (e.g. the gesture turned into a drag). */
  cancel: () => void;
}

/**
 * Single/double click disambiguator: a lone click resolves to "single" only after `delay` ms;
 * a second click within that window on the SAME target key cancels the pending timer and
 * resolves "double" instead. A second click on a DIFFERENT key never forms a double — the
 * pending click is flushed as its own "single" immediately, then a fresh timer starts for the
 * new key. Callers decide what "the same target" means (the key) and are responsible for
 * calling `cancel()` when a drag starts instead of a click.
 */
export function useClickDiscriminator(opts: ClickDiscriminatorOptions): ClickDiscriminator {
  const delay = opts.delay ?? DEFAULT_CLICK_DELAY;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pendingKey: string | null = null;

  function flushPendingAsSingle() {
    if (timer === null || pendingKey === null) return;
    clearTimeout(timer);
    timer = null;
    const key = pendingKey;
    pendingKey = null;
    opts.onIntent("single", key);
  }

  function click(key: string) {
    if (timer !== null) {
      if (pendingKey === key) {
        clearTimeout(timer);
        timer = null;
        pendingKey = null;
        opts.onIntent("double", key);
        return;
      }
      // Different target: the pending click can never become a double now — resolve it
      // immediately as its own single, then start a fresh timer for the new key.
      flushPendingAsSingle();
    }
    pendingKey = key;
    timer = setTimeout(() => {
      timer = null;
      const resolvedKey = pendingKey;
      pendingKey = null;
      if (resolvedKey !== null) opts.onIntent("single", resolvedKey);
    }, delay);
  }

  function cancel() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    pendingKey = null;
  }

  return { click, cancel };
}

export interface UseEventInteractionOptions {
  editable: Ref<boolean>;
  isEventEditable: (e: ISchedulerEvent) => boolean;
  dayFromPoint: (clientX: number, clientY: number) => Date | null;
  onUpdate: (u: { id: string; start: Date; end: Date }) => void;
  onCreate: (c: { start: Date; end: Date; allDay: boolean }) => void;
}

export function useEventInteraction(opts: UseEventInteractionOptions) {
  const pending = ref<{ id: string; start: Date; end: Date } | null>(null);
  let mode: Mode | null = null;
  let origin: { day: number; start: number; end: number } | null = null;
  let createAnchor: number | null = null;

  const dayIndex = (x: number, y: number) => {
    const d = opts.dayFromPoint(x, y);
    return d ? Math.floor(d.getTime() / DAY) : null;
  };

  const beginMove = (e: ISchedulerEvent, x: number, y: number) => begin(e, { kind: "move" }, x, y);
  const beginResize = (e: ISchedulerEvent, edge: "start" | "end", x: number, y: number) =>
    begin(e, { kind: "resize", edge }, x, y);

  function begin(e: ISchedulerEvent, m: Mode, x: number, y: number) {
    if (!opts.editable.value || !opts.isEventEditable(e)) return;
    const d = dayIndex(x, y);
    if (d === null) return;
    mode = m;
    origin = { day: d, start: e.start.getTime(), end: e.end.getTime() };
    pending.value = { id: e.id, start: new Date(e.start), end: new Date(e.end) };
  }

  // Anchor create on the EXACT clicked cell's date (passed by the day cell itself),
  // not on coordinates — coordinate→row mapping is unreliable with variable row
  // heights and was creating events on the wrong day/row.
  function beginCreate(date: Date) {
    if (!opts.editable.value) return;
    const dayStart = startOfDay(date);
    mode = { kind: "create" };
    createAnchor = dayStart.getTime();
    pending.value = { id: "__new__", start: dayStart, end: addDays(dayStart, 1) };
  }

  function updatePointer(x: number, y: number) {
    if (!mode || !pending.value) return;
    const d = opts.dayFromPoint(x, y);
    if (!d) return;
    if (mode.kind === "create") {
      const cur = startOfDay(d).getTime();
      const lo = Math.min(createAnchor!, cur);
      const hi = addDays(new Date(Math.max(createAnchor!, cur)), 1);
      pending.value = { id: "__new__", start: new Date(lo), end: hi };
      return;
    }
    if (!origin) return;
    const deltaDays = Math.floor(d.getTime() / DAY) - origin.day;
    const shift = deltaDays * DAY;
    if (mode.kind === "move") {
      pending.value = {
        id: pending.value.id,
        start: new Date(origin.start + shift),
        end: new Date(origin.end + shift),
      };
    } else if (mode.edge === "start") {
      const start = Math.min(origin.start + shift, origin.end - DAY);
      pending.value = { id: pending.value.id, start: new Date(start), end: new Date(origin.end) };
    } else {
      const end = Math.max(origin.end + shift, origin.start + DAY);
      pending.value = { id: pending.value.id, start: new Date(origin.start), end: new Date(end) };
    }
  }

  function commit() {
    const p = pending.value;
    const m = mode;
    if (p && m) {
      if (m.kind === "create") {
        opts.onCreate({ start: p.start, end: p.end, allDay: true });
      } else if (origin && (p.start.getTime() !== origin.start || p.end.getTime() !== origin.end)) {
        opts.onUpdate({ id: p.id, start: p.start, end: p.end });
      }
    }
    cancel();
  }

  function cancel() {
    pending.value = null;
    mode = null;
    origin = null;
    createAnchor = null;
  }

  const effectiveEvent = (e: ISchedulerEvent): ISchedulerEvent =>
    pending.value && pending.value.id === e.id ? { ...e, start: pending.value.start, end: pending.value.end } : e;

  return { pending, effectiveEvent, beginMove, beginResize, beginCreate, updatePointer, commit, cancel };
}
