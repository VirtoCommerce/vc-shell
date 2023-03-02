import { ComponentPublicInstance } from "vue";
import { VcDynamicPropertyProps } from "./vc-dynamic-property-model";
import { ComponentConstructor } from "./../../../types/ts-helpers"
import DynamicProperty from "./vc-dynamic-property.vue";
export const VcDynamicProperty: ComponentConstructor<
  ComponentPublicInstance<VcDynamicPropertyProps>
> = DynamicProperty;
