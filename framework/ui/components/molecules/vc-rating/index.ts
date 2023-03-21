import { VNode } from "vue";
import Rating from "./vc-rating.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";

export type VcRatingSlots = {
  details?: () => VNode[];
};

export const VcRating: GlobalComponentConstructor<InstanceType<typeof Rating>, VcRatingSlots> = Rating;
