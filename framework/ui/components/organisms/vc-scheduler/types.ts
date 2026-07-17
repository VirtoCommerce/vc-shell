export type SchedulerZoom = "hour" | "day" | "week" | "month" | "quarter" | "year";

/** Ordered coarse→fine is NOT implied; this is display/zoom order fine→coarse. */
export const SCHEDULER_ZOOM_LEVELS: SchedulerZoom[] = ["hour", "day", "week", "month", "quarter", "year"];

export interface ISchedulerResource {
  id: string;
  label: string;
  meta?: Record<string, unknown>;
}

export interface ISchedulerBar {
  id: string;
  resourceId: string;
  start: Date;
  end: Date;
  label?: string;
  /** CSS color or CSS var reference; defaults to var(--primary-500). */
  color?: string;
  /** Per-bar override of global editable. */
  editable?: boolean;
}

/** Snap step in milliseconds, or "auto" to derive from current zoom. */
export type SchedulerSnap = number | "auto";

export interface IBarUpdate {
  id: string;
  start: Date;
  end: Date;
}

export interface IBarCreate {
  resourceId: string;
  start: Date;
  end: Date;
}

/** A bar after lane assignment. */
export interface IPackedBar extends ISchedulerBar {
  lane: number;
}

// --- Calendar (SP1+) ---

export type SchedulerView = "month" | "timeline-day" | "timeline-week";

export interface ISchedulerEvent {
  id: string;
  start: Date;
  end: Date;
  title: string;
  allDay?: boolean;
  color?: string;
  editable?: boolean;
  meta?: Record<string, unknown>;
  /** RRULE string on a master event, e.g. "FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,TU;COUNT=10". */
  recurrence?: string;
  /** Occurrence start dates removed from the master series. */
  exceptionDates?: Date[];
  /** On an override event: id of the master series it belongs to. */
  recurrenceId?: string;
  /** On an override event: the original occurrence start it replaces. */
  originalStart?: Date;
}

/** A recurrence rule in the shape the scheduler UI edits; bridged to/from an RRULE string. */
export interface IRecurrenceRule {
  freq: "daily" | "weekly" | "monthly" | "yearly";
  interval: number;
  /** Weekly only: weekdays, JS getDay() convention 0(Sun)..6(Sat). */
  byWeekday?: number[];
  end: { type: "never" } | { type: "count"; count: number } | { type: "until"; until: Date };
}

/** An event clipped to a single week row, with its column span for the month grid. */
export interface IWeekEventSegment {
  event: ISchedulerEvent;
  /** 0-6 within the week row (inclusive). */
  startCol: number;
  endCol: number;
  continuesLeft: boolean;
  continuesRight: boolean;
}

// --- Built-in editing UX (Sprint A) ---

/** Working copy edited by the quick-create popover and the editor modal. */
export interface IEventDraft {
  id?: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  color?: string;
  recurrence?: IRecurrenceRule | null;
}
