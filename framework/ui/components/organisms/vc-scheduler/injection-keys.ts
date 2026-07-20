import type { InjectionKey, Ref } from "vue";
import type { SchedulerZoom, SchedulerView, ISchedulerEvent } from "./types";

export interface ISchedulerContext {
  zoom: Ref<SchedulerZoom>;
  editable: Ref<boolean>;
  dateToX: (date: Date) => number;
  xToDate: (x: number) => Date;
}

export const SchedulerContextKey: InjectionKey<ISchedulerContext> = Symbol("VcSchedulerContext");

// --- Calendar (SP1+) ---

export interface ISchedulerCalendarContext {
  focusedDate: Ref<Date>;
  view: Ref<SchedulerView>;
  editable: Ref<boolean>;
  firstDayOfWeek: Ref<number>;
  isEventEditable: (e: ISchedulerEvent) => boolean;
}

export const SchedulerCalendarContextKey: InjectionKey<ISchedulerCalendarContext> =
  Symbol("VcSchedulerCalendarContext");
