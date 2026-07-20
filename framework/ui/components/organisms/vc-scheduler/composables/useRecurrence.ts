import { endOfDay } from "date-fns";
import { RRule, rrulestr, type Weekday } from "rrule";
import type { IRecurrenceRule, ISchedulerEvent } from "../types";

const FREQ_MAP = {
  daily: RRule.DAILY,
  weekly: RRule.WEEKLY,
  monthly: RRule.MONTHLY,
  yearly: RRule.YEARLY,
} as const;
const FREQ_BACK: Record<number, IRecurrenceRule["freq"]> = {
  [RRule.DAILY]: "daily",
  [RRule.WEEKLY]: "weekly",
  [RRule.MONTHLY]: "monthly",
  [RRule.YEARLY]: "yearly",
};
// rrule weekday order is MO(0)..SU(6); JS getDay() is SU(0)..SA(6).
const RRULE_WEEKDAYS = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA, RRule.SU];
const jsToRruleWd = (js: number): Weekday => RRULE_WEEKDAYS[(js + 6) % 7];
const rruleToJsWd = (rr: number): number => (rr + 1) % 7;

export function toRRule(rule: IRecurrenceRule): string {
  const opts: Partial<import("rrule").Options> = {
    freq: FREQ_MAP[rule.freq],
    interval: Math.max(1, rule.interval),
  };
  if (rule.freq === "weekly" && rule.byWeekday?.length) {
    opts.byweekday = rule.byWeekday.map(jsToRruleWd);
  }
  if (rule.end.type === "count") opts.count = rule.end.count;
  // VcDatePicker type="date" yields the "until" Date at local midnight of the picked day.
  // Normalize to end-of-day so an "until <date>" boundary is inclusive of the whole day —
  // otherwise a timed occurrence later that day (e.g. 10:00) falls after UNTIL and is dropped.
  else if (rule.end.type === "until") opts.until = endOfDay(rule.end.until);
  // RRule.toString() prepends "RRULE:"; strip it so we store the bare rule text.
  return new RRule(opts).toString().replace(/^RRULE:/, "");
}

export function parseRRule(rrule: string, dtstart: Date): IRecurrenceRule {
  const rule = rrulestr(rrule.startsWith("RRULE:") ? rrule : `RRULE:${rrule}`, { dtstart });
  const o = (rule as RRule).origOptions;
  const freq = FREQ_BACK[o.freq as number] ?? "daily";
  const byWeekday =
    freq === "weekly" && o.byweekday
      ? ([] as Weekday[])
          .concat(o.byweekday as Weekday[])
          .map((w) => rruleToJsWd(typeof w === "number" ? w : (w as Weekday).weekday))
      : undefined;
  let end: IRecurrenceRule["end"] = { type: "never" };
  if (o.count != null) end = { type: "count", count: o.count };
  else if (o.until != null) end = { type: "until", until: o.until as Date };
  return { freq, interval: (o.interval as number) ?? 1, byWeekday, end };
}

const isoKey = (d: Date) => d.toISOString();

/**
 * Human-readable one-line summary of an RRULE, e.g. "every week on Monday, Wednesday for
 * 8 times". Uses rrule's own toText(); returns "" if the rule can't be described. English
 * phrasing (rrule's default) — localization of the phrase is a follow-up.
 */
export function describeRRule(rrule: string): string {
  try {
    const rule = rrulestr(rrule.startsWith("RRULE:") ? rrule : `RRULE:${rrule}`) as RRule;
    const text = rule.toText();
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
  } catch {
    return "";
  }
}

// rrule.js expands entirely in UTC: it reads a date's UTC calendar fields, applies the rule,
// and returns occurrences whose UTC fields hold the "naive" recurrence wall-time. Feeding a
// local date directly means, in any non-UTC zone, the UTC day/weekday can differ from the local
// one -- a local-midnight start in a UTC+ zone lands on the previous UTC day, so BYDAY matching
// picks the wrong weekday and every occurrence shifts. Convert local -> UTC-naive before
// expansion and back afterwards so the rule sees (and returns) the intended wall-clock fields.
const toUtcNaive = (d: Date): Date =>
  new Date(
    Date.UTC(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
      d.getSeconds(),
      d.getMilliseconds(),
    ),
  );
const fromUtcNaive = (d: Date): Date =>
  new Date(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    d.getUTCHours(),
    d.getUTCMinutes(),
    d.getUTCSeconds(),
    d.getUTCMilliseconds(),
  );

/**
 * Expands recurring master events into concrete occurrences within `window`, skipping
 * `exceptionDates` and substituting any override event (matched by recurrenceId +
 * originalStart) in place of the synthesized occurrence. Plain (non-recurring,
 * non-override) events pass through unchanged. Never mutates the input events.
 */
export function expandEvents(events: ISchedulerEvent[], window: { start: Date; end: Date }): ISchedulerEvent[] {
  const masters = events.filter((e) => e.recurrence && !e.recurrenceId);
  const overrides = events.filter((e) => e.recurrenceId);
  const plain = events.filter((e) => !e.recurrence && !e.recurrenceId);

  // Index overrides by master id -> (occurrence-start ISO -> override event).
  const overrideMap = new Map<string, Map<string, ISchedulerEvent>>();
  for (const o of overrides) {
    if (!o.recurrenceId || !o.originalStart) continue;
    if (!overrideMap.has(o.recurrenceId)) overrideMap.set(o.recurrenceId, new Map());
    overrideMap.get(o.recurrenceId)!.set(isoKey(o.originalStart), o);
  }

  const out: ISchedulerEvent[] = [...plain];
  // Tracks override ids already emitted via the master loop, so the after-loop pass below
  // does not double-emit them.
  const emittedOverrideIds = new Set<string>();

  for (const m of masters) {
    const parsed = rrulestr(m.recurrence!.startsWith("RRULE:") ? m.recurrence! : `RRULE:${m.recurrence}`, {
      dtstart: toUtcNaive(m.start),
    }) as RRule;
    // UNTIL is stored as a real UTC instant (serialized from a local wall-time boundary), so it
    // must be re-expressed in the same UTC-naive frame as dtstart, or the boundary comparison is
    // off by the zone offset and the last occurrence can be wrongly dropped or kept.
    const parsedUntil = parsed.origOptions.until as Date | undefined;
    const rule = parsedUntil ? new RRule({ ...parsed.origOptions, until: toUtcNaive(parsedUntil) }) : parsed;
    const durationMs = m.end.getTime() - m.start.getTime();
    const exSet = new Set((m.exceptionDates ?? []).map(isoKey));
    const ovForMaster = overrideMap.get(m.id);

    // Search slightly before window.start so an occurrence that began earlier but overlaps
    // into the window (long duration) is still found; the occEnd guard below drops anything
    // that in fact ended before the window starts. Bounds are UTC-naive to match the rule's frame.
    const searchStart = toUtcNaive(new Date(window.start.getTime() - durationMs));
    for (const rawOcc of rule.between(searchStart, toUtcNaive(window.end), true)) {
      const occStart = fromUtcNaive(rawOcc);
      const key = isoKey(occStart);
      if (exSet.has(key)) continue;

      const ov = ovForMaster?.get(key);
      if (ov) {
        out.push({ ...ov });
        emittedOverrideIds.add(ov.id);
        continue;
      }

      const occEnd = new Date(occStart.getTime() + durationMs);
      if (occEnd <= window.start) continue;

      out.push({
        ...m,
        id: `${m.id}::${key}`,
        start: new Date(occStart),
        end: occEnd,
        recurrence: undefined,
        exceptionDates: undefined,
        recurrenceId: m.id,
        originalStart: new Date(occStart),
        // __rrule carries the master's rule so quick-info can show a human-readable summary;
        // internal only (occurrences are never emitted to the host).
        meta: { ...(m.meta ?? {}), __recurring: true, __rrule: m.recurrence },
      });
    }
  }

  // Masters with no occurrence in the window (bounded/ended series, or an override moved into
  // a window the master's own dates don't reach) still contribute their overrides whose own
  // displayed time falls in-window. Skip any override already emitted above to avoid duplicates.
  const mastersById = new Map(masters.map((m) => [m.id, m]));
  for (const ov of overrides) {
    if (emittedOverrideIds.has(ov.id)) continue;
    if (ov.end.getTime() > window.start.getTime() && ov.start.getTime() < window.end.getTime()) {
      // Guard against a non-atomic delete-this: if the owning master already lists this
      // occurrence's originalStart as an exception, the override represents a deleted
      // occurrence and must not resurrect here.
      const owningMaster = ov.recurrenceId ? mastersById.get(ov.recurrenceId) : undefined;
      if (owningMaster && ov.originalStart) {
        const ownerExSet = new Set((owningMaster.exceptionDates ?? []).map(isoKey));
        if (ownerExSet.has(isoKey(ov.originalStart))) continue;
      }
      out.push({ ...ov, meta: ov.meta ? { ...ov.meta } : ov.meta });
    }
  }

  return out;
}
