import { PropType, VNode } from "vue";
import { ExtractTypes } from "./../../../types/ts-helpers";

export const breadcrumbsProps = {
  items: {
    type: Array as PropType<
      {
        current: boolean;
        icon: string;
        title: string;
        clickHandler: () => void;
        id: string;
      }[]
    >,
    default: () => [],
  },
};

export type VcBreadcrumbsProps = ExtractTypes<typeof breadcrumbsProps>;

export interface VcBreadcrumbsSlots {
  default: () => VNode[];
}
