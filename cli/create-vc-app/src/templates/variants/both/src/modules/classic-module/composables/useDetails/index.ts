/* eslint-disable import/no-unresolved */
import { computed, ref } from "vue";
import img1 from "/assets/1.jpeg";
import img2 from "/assets/2.jpg";
import img3 from "/assets/3.jpg";
import { useAsync, useLoading } from "@vc-shell/framework";

export default () => {
  const item = ref({
    imgSrc: undefined,
    name: undefined,
    createdDate: undefined,
    id: undefined,
  });

  // Example mocked method for 'fetching' list data
  const { loading: itemLoading, action: getItem } = useAsync<{ id: string }>(async (payload) => {
    item.value = await new Promise((resolve) => {
      setTimeout(() => {
        const findMockedItem = [
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
        ].find((x) => x.id === payload.id);
        resolve(findMockedItem);
      }, 1000);
    });
  });

  const loading = useLoading(itemLoading);

  return {
    item: computed(() => item.value),
    loading: computed(() => loading.value),
    getItem,
  };
};
