import { ComponentPublicInstance } from "vue";
import { VcRatingProps } from "./vc-rating-model";
import { ComponentConstructor } from "@/ui/types/ts-helpers";
import Rating from "./vc-rating.vue";
export const VcRating: ComponentConstructor<
    ComponentPublicInstance<VcRatingProps>
> = Rating;
