/* eslint-disable import/no-unresolved */
import { computed, ref, Ref } from "vue";
import img1 from "/assets/1.jpeg";
import img2 from "/assets/2.jpg";
import img3 from "/assets/3.jpg";
import { DynamicBladeList, ListBaseBladeScope, useBladeNavigation, useListFactory } from "@vc-shell/framework";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DynamicItemsScope extends ListBaseBladeScope {}

export default (args: {
  props: InstanceType<typeof DynamicBladeList>["$props"];
  emit: InstanceType<typeof DynamicBladeList>["$emit"];
  mounted: Ref<boolean>;
}) => {
  const factory = useListFactory({
    load: async () => {
      return await new Promise((resolve) => {
        setTimeout(
          () =>
            resolve([
              {
                imgSrc: img1,
                name: "Item 1",
                createdDate: new Date(),
                id: "item-id-1",
              },
              {
                imgSrc: img2,
                name: "Item 2",
                createdDate: new Date(),
                id: "item-id-2",
              },
              {
                imgSrc: img3,
                name: "Item 3",
                createdDate: new Date(),
                id: "item-id-3",
              },
            ]),
          1000
        );
      }).then((res: any[]) => {
        return { results: res, totalCount: res.length };
      });
    },
  });

  const { load, items, pagination, loading, query } = factory();
  const { openBlade, resolveBladeByName } = useBladeNavigation();

  async function openDetailsBlade(data?: Omit<Parameters<typeof openBlade>["0"], "blade">) {
    await openBlade({
      blade: resolveBladeByName("DynamicItem"),
      ...data,
    });
  }

  const scope = ref<DynamicItemsScope>({
    openDetailsBlade,
  });

  return {
    items,
    load,
    loading,
    pagination,
    query,
    scope: computed(() => scope.value),
  };
};
