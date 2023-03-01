import { ComponentPublicInstance } from "vue";
import { VcBreadcrumbsProps } from "./vc-breadcrumbs-model";
import { ComponentConstructor } from "@/ui/types/ts-helpers";
import Breadcrumbs from "./vc-breadcrumbs.vue";
export const VcBreadcrumbs: ComponentConstructor<
  ComponentPublicInstance<VcBreadcrumbsProps>
> = Breadcrumbs;