import { inject, toValue } from "vue";
import { useI18n } from "vue-i18n";
import { IWidget } from "@core/services/widget-service";
import { BladeContextKey } from "@framework/injection-keys";
import { BladeDescriptorKey } from "@core/blade-navigation/types";
import type { BladeContext } from "@core/types";

export function useHeadlessWidgetHelpers() {
  const { t } = useI18n({ useScope: "global" });
  // Widgets registered by blade name from another module have no component to inject it from
  const bladeContext = inject(BladeContextKey, undefined);
  const context = (): BladeContext => bladeContext?.value ?? {};
  const descriptor = inject(BladeDescriptorKey, undefined);

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
    if (typeof disabled === "function") return Boolean(disabled(context(), descriptor?.value));
    return typeof disabled === "boolean" ? disabled : toValue(disabled);
  }

  function resolveTitle(widget: IWidget): string {
    const title = widget.title ?? "";
    return widget.headless ? t(title) : title;
  }

  function handleHeadlessClick(widget: IWidget) {
    widget.headless?.onClick?.(context(), descriptor?.value);
  }

  return { resolveBadge, resolveLoading, resolveDisabled, resolveTitle, handleHeadlessClick };
}
