import { formatDistanceToNow, format } from "date-fns";
import { convertMomentFormat } from "./convertMomentFormat";
import { resolveLocaleSync } from "./resolveLocale";

type DateInput = string | number | Date | null | undefined;

function toDate(value: DateInput): Date | null {
  if (value == null || value === "") return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

export function formatDateRelative(value: DateInput, localeCode?: string): string {
  const date = toDate(value);
  if (!date) return "";
  const locale = localeCode ? resolveLocaleSync(localeCode) : undefined;
  return formatDistanceToNow(date, { addSuffix: true, locale });
}

export function formatDateWithPattern(
  value: DateInput,
  momentFormatStr: string,
  localeCode?: string,
): string {
  const date = toDate(value);
  if (!date) return "";
  const dateFnsFormat = convertMomentFormat(momentFormatStr);
  const locale = localeCode ? resolveLocaleSync(localeCode) : undefined;
  return format(date, dateFnsFormat, { locale });
}
