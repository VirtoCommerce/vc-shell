import Pagination from "./vc-pagination.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";
import { VNode } from "vue";

export type VcPaginationSlots = {
  default?: () => VNode[];
};

export const VcPagination: GlobalComponentConstructor<InstanceType<typeof Pagination>, VcPaginationSlots> = Pagination;
