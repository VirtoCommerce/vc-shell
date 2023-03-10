import { ComponentPublicInstance } from "vue";
import { VcPaginationEmits, VcPaginationProps } from "./vc-pagination-model";
import { ComponentConstructor } from "./../../../types/ts-helpers";
import Pagination from "./vc-pagination.vue";
export const VcPagination: ComponentConstructor<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ComponentPublicInstance<VcPaginationProps, any, any, any, any, VcPaginationEmits>
> = Pagination;
