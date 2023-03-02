import { ComponentPublicInstance } from "vue";
import { VcBadgeProps } from "./vc-badge-model";
import { ComponentConstructor } from "./../../../types/ts-helpers";
import Badge from "./vc-badge.vue";
export const VcBadge: ComponentConstructor<
  ComponentPublicInstance<VcBadgeProps>
> = Badge;
