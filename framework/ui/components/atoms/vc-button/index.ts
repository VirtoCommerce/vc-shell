import { ComponentPublicInstance } from "vue";
import { VcButtonEmits, VcButtonProps } from "./vc-button-model";
import { ComponentConstructor } from "./../../../types/ts-helpers";
import Button from "./vc-button.vue";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VcButton: ComponentConstructor<ComponentPublicInstance<VcButtonProps, any, any, any, any, VcButtonEmits>> =
  Button;
