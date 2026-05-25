import { reactive } from "vue";
import { useAsync } from "@vc-shell/framework";

export function useOrderDetails() {
  const item = reactive({ id: "", number: "", status: "" });

  const { action: load, loading } = useAsync(async (id?: string) => {
    if (!id) return;
    item.id = id;
    item.number = id.toUpperCase();
    item.status = "New";
  });

  return { item, loading, load };
}
