import { unref } from "vue";
import type { IWidget, IWidgetAlert } from "@core/services/widget-service";
import { SEVERITY_DOT_VARIANT, type Severity } from "@core/types/severity";

const SEVERITY_RANK: Record<Severity, number> = { info: 0, warning: 1, error: 2, critical: 3 };

export function resolveAlerts(widget: IWidget): IWidgetAlert[] {
  const source = widget.headless?.alerts ?? widget.trigger?.alerts;
  return (source && unref(source)) || [];
}

export function highestSeverity(alerts: IWidgetAlert[]): Severity | undefined {
  let top: Severity | undefined;
  for (const { severity } of alerts) {
    if (!top || SEVERITY_RANK[severity] > SEVERITY_RANK[top]) top = severity;
  }
  return top;
}

/** Dot colour for the most severe of the alerts */
export function alertDotVariant(alerts: IWidgetAlert[]) {
  const severity = highestSeverity(alerts);
  return severity ? SEVERITY_DOT_VARIANT[severity] : undefined;
}

/** Stable: widgets with alerts first, relative order kept */
export function sortAlertsFirst(widgets: IWidget[]): IWidget[] {
  const withAlerts: IWidget[] = [];
  const rest: IWidget[] = [];
  for (const w of widgets) (resolveAlerts(w).length ? withAlerts : rest).push(w);
  return [...withAlerts, ...rest];
}
