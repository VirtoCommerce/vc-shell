import { toValue } from "vue";
import { useI18n } from "vue-i18n";
import { IWidget } from "@core/services/widget-service";
import { useWidgets } from "@core/composables/useWidgets";

export function useHeadlessWidgetHelpers() {
  const { t } = useI18n({ useScope: "global" });
  const widgetService = useWidgets();

  function resolveBadge(widget: IWidget): string | number | undefined {
    const badge = widget.headless?.badge;
    if (badge === undefined) return undefined;
    return toValue(badge);
  }

  function resolveLoading(widget: IWidget): boolean {
    const loading = widget.headless?.loading;
    if (loading === undefined) return false;
    return toValue(loading);
  }

  function resolveTitle(widget: IWidget): string {
    const title = widget.title ?? "";
    return widget.kind === "headless" ? t(title) : title;
  }

  function handleHeadlessClick(widget: IWidget) {
    widgetService.setActiveWidget({ widgetId: widget.id });
    widget.headless?.onClick?.();
  }

  return { resolveBadge, resolveLoading, resolveTitle, handleHeadlessClick };
}
