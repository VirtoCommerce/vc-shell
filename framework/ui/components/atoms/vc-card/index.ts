import { ComponentPublicInstance } from "vue";
import { VcCardProps } from "./vc-card-model";
import { ComponentConstructor } from "./../../../types/ts-helpers";
import Card from "./vc-card.vue";
export const VcCard: ComponentConstructor<
  ComponentPublicInstance<VcCardProps>
> = Card;
