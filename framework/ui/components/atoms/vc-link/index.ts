import { ComponentPublicInstance } from "vue";
import { VcLinkProps } from "./vc-link-model";
import { ComponentConstructor } from "@/ui/types/ts-helpers";
import Link from "./vc-link.vue";
export const VcLink: ComponentConstructor<
  ComponentPublicInstance<VcLinkProps>
> = Link;
