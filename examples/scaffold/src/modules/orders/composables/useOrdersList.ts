import { computed, ref } from "vue";
import { useAsync, useDataTablePagination } from "@vc-shell/framework";

export interface OrderListItem {
  id: string;
  number: string;
  status: string;
}

const MOCK_ORDERS: OrderListItem[] = [
  { id: "order-1", number: "ORD-001", status: "New" },
  { id: "order-2", number: "ORD-002", status: "Processing" },
];

export function useOrdersList() {
  const items = ref<OrderListItem[]>([]);

  const { action: load, loading } = useAsync(async () => {
    items.value = MOCK_ORDERS;
  });

  const pagination = useDataTablePagination({
    pageSize: 20,
    totalCount: computed(() => items.value.length),
    onPageChange: () => {
      void load();
    },
  });

  return { items, pagination, loading, load };
}
