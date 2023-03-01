import { VNode } from "vue";

export interface VcRatingProps {
  label?: string;
  placeholder?: string;
  tooltip?: string;
  rating: number | undefined;
  max?: number;
  variant?: "stars" | "star-and-text" | "text";
}

export interface VcRatingSlots {
  details: () => VNode[];
}
