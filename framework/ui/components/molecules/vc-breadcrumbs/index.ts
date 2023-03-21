import { VNode } from "vue";
import Breadcrumbs from "./vc-breadcrumbs.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";

export type VcBreadcrumbsSlots = {
  default?: () => VNode[];
};

export const VcBreadcrumbs: GlobalComponentConstructor<InstanceType<typeof Breadcrumbs>, VcBreadcrumbsSlots> = Breadcrumbs;
