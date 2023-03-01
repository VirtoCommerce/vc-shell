import { ComponentPublicInstance } from "vue";
import { VcPaginationProps } from "./vc-pagination-model";
import { ComponentConstructor } from "@/ui/types/ts-helpers";
import Pagination from "./vc-pagination.vue";
export const VcPagination: ComponentConstructor<
  ComponentPublicInstance<VcPaginationProps>
> = Pagination;
