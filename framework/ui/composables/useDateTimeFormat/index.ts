import { inject } from "vue";
import { DateTimeFormatKey } from "@framework/injection-keys";
import type { DateTimeFormatter } from "@core/utilities/date/dateTimeFormatter";

type DateValue = Date | string | number | null | undefined;

const DATE: Intl.DateTimeFormatOptions = { dateStyle: "medium" };
const TIME: Intl.DateTimeFormatOptions = { timeStyle: "short" };
const DATE_TIME: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" };
const FULL: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "medium" };

function toDate(value: DateValue): Date | undefined {
  if (value == null || value === "") return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

const browserFormatter: DateTimeFormatter = {
  formatDateTime: (value, options) => {
    const date = toDate(value);
    return date ? new Intl.DateTimeFormat(undefined, options).format(date) : "";
  },
};

/**
 * Date-and-time formatters in the user's regional format and time zone when the host provides them
 * (FrameworkInstallArgs.dateTimeFormat), else the browser's. Each returns "" for no value or an invalid date.
 */
export function useDateTimeFormat() {
  const { formatDateTime } = inject(DateTimeFormatKey, browserFormatter);
  return {
    /** "Nov 19, 2026" */
    date: (value: DateValue) => formatDateTime(value, DATE),
    /** "10:18 AM" */
    time: (value: DateValue) => formatDateTime(value, TIME),
    /** "Nov 19, 2026, 10:18 AM" */
    dateTime: (value: DateValue) => formatDateTime(value, DATE_TIME),
    /** "Nov 19, 2026, 10:18:42 AM", for a tooltip */
    full: (value: DateValue) => formatDateTime(value, FULL),
  };
}
