import { PropType, VNode } from "vue";
import { ExtractTypes } from "./../../../types/ts-helpers";

export const ratingProps = {
  label: String,
  placeholder: String,
  tooltip: String,
  rating: Number,
  max: {
    type: Number,
    default: 5,
  },
  variant: {
    type: String as PropType<"stars" | "star-and-text" | "text">,
    default: "stars",
  },
};

export type VcRatingProps = ExtractTypes<typeof ratingProps>;

export interface VcRatingSlots {
  details: () => VNode[];
}
