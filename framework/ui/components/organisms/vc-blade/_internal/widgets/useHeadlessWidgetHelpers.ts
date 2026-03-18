import { toValue } from "vue";
import { useI18n } from "vue-i18n";
import { IWidget } from "@core/services/widget-service";

export function useHeadlessWidgetHelpers() {
  const { t } = useI18n({ useScope: "global" });

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

  function resolveDisabled(widget: IWidget): boolean {
    const disabled = widget.headless?.disabled;
    if (disabled === undefined) return false;
    return typeof disabled === "boolean" ? disabled : toValue(disabled);
  }

  function resolveTitle(widget: IWidget): string {
    const title = widget.title ?? "";
    return widget.headless ? t(title) : title;
  }

  function handleHeadlessClick(widget: IWidget) {
    widget.headless?.onClick?.();
  }

  return { resolveBadge, resolveLoading, resolveDisabled, resolveTitle, handleHeadlessClick };
}
