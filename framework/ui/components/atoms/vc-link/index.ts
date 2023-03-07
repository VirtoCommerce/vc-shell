import { ComponentPublicInstance } from "vue";
import { VcLinkEmits, VcLinkProps } from "./vc-link-model";
import { ComponentConstructor } from "./../../../types/ts-helpers";
import Link from "./vc-link.vue";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VcLink: ComponentConstructor<ComponentPublicInstance<VcLinkProps, any, any, any, any, VcLinkEmits>> = Link;
