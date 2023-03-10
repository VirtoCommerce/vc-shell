import { ComponentPublicInstance } from "vue";
import { VcBadgeEmits, VcBadgeProps } from "./vc-badge-model";
import { ComponentConstructor } from "./../../../types/ts-helpers";
import Badge from "./vc-badge.vue";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VcBadge: ComponentConstructor<ComponentPublicInstance<VcBadgeProps, any, any, any, any, VcBadgeEmits>> =
  Badge;
