import type { ComputedRef, InjectionKey, Ref } from "vue";
import type { Severity } from "@core/types/severity";

/** Per-widget render state, provided by WidgetItem and read by VcWidget. Internal: not exported. */
export interface IWidgetRenderState {
  alertSeverity: ComputedRef<Severity | undefined>;
  /** Screen-reader text for the widget's alerts, e.g. "2 need attention"; undefined without alerts */
  alertsDescription: ComputedRef<string | undefined>;
  /** Whether the alerts popup is open */
  alertsOpen: Ref<boolean>;
  editing: Ref<boolean>;
}

export const WidgetRenderStateKey: InjectionKey<IWidgetRenderState> = Symbol("WidgetRenderState");
