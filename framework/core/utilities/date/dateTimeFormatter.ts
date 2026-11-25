/**
 * Formats a date and time in the user's regional format and time zone. A host app passes one as
 * `dateTimeFormat` to `app.use(VirtoShellFramework, ...)`; without it, vc-shell uses the browser's.
 *
 * Returns "" for no value or an invalid date.
 */
export interface DateTimeFormatter {
  formatDateTime: (value: Date | string | number | null | undefined, options?: Intl.DateTimeFormatOptions) => string;
}
