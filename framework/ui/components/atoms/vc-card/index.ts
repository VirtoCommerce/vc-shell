import { ComponentPublicInstance } from "vue";
import { VcCardEmits, VcCardProps } from "./vc-card-model";
import { ComponentConstructor } from "./../../../types/ts-helpers";
import Card from "./vc-card.vue";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VcCard: ComponentConstructor<ComponentPublicInstance<VcCardProps, any, any, any, any, VcCardEmits>> = Card;
