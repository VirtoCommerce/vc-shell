import _ from "lodash";
import { default as moment, Duration, RelativeTimeKey } from "moment";

type momentUnit = Extract<
  moment.RelativeTimeKey,
  "s" | "m" | "h" | "d" | "w" | "M" | "y"
>;

const momentUnits: momentUnit[] = ["s", "m", "h", "d", "w", "M", "y"];

const intlUnits = ["second", "minute", "hour", "day", "week", "month", "year"];

const intlNumberFormats = intlUnits.map((intlUnit) =>
  Intl?.NumberFormat(moment.locale(), {
    style: "unit",
    unit: intlUnit,
    unitDisplay: "long",
  })
);

const getIntlNumberFormat = (unit: momentUnit) => {
  return intlNumberFormats[momentUnits.indexOf(unit)];
};

// Workaround because of lacking precise (1 hour 42 minutes 35 seconds)
// duration formatting in moment and Intl
export function humanize(this: Duration & number, withSuffix: boolean): string {
  const localeData = moment.localeData();

  const units = _.clone(momentUnits);
  const lastUnit = units.pop();

  // format string as "value unit" (e.g. "35", "ss" => "35 seconds", "1", "dd" => "1 day")
  const humanize = (unit: momentUnit, value: number) => {
    // Use Intl if available to get proper formatting and pluralization:
    // Intl:   1 day, 2 days
    // moment: a day, 2 days
    return Intl
      ? getIntlNumberFormat(unit).format(value)
      : localeData.relativeTime(
          value,
          true,
          value === 1 ? unit : ((unit + unit) as RelativeTimeKey), // pluralize
          this > 0
        );
  };

  // convert duration to the map
  // "1:42:35" => [{ key: "ss", value: 35 }, { key: "mm", value: 42 }, { key: "hh", value: 1 }]
  let map = units.map((unit) => ({
    unit,
    value: this.get(unit),
  }));
  // add value of last unit as double-precision float, if it's greater than 0
  map.push({
    unit: lastUnit,
    value: this.get(lastUnit) > 0 ? this.as(lastUnit) : 0,
  });

  // drop zero values from the beginning and the end of the array
  // [{ y: 0 }, { m: 0 }, { d: 0 }, { h: 1 }, { m: 42 }, { s: 0 }] => [{ h: 1 }, { m: 42 }]
  const isZeroValue = (item: { value: number }) => item.value === 0;
  map = _.chain(map).dropWhile(isZeroValue).dropRightWhile(isZeroValue).value();

  // convert map to array of formatted strings
  // [{ key: "mm", value: 42 }, { key: "hh", value: 1 }] => ["42 minutes", "1 hour"]
  const values = map.map((entry) => humanize(entry.unit, entry.value));

  // ["42 minutes", "1 hour"] => "1 hour 42 minutes"
  let result = values.reverse().join(" ");

  if (withSuffix) {
    result = localeData.pastFuture(this, result);
  }

  return result;
}
