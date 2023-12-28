/* eslint-disable import/no-unresolved */
import { Ref, computed, ref } from "vue";
import img1 from "/assets/1.jpeg";
import img2 from "/assets/2.jpg";
import img3 from "/assets/3.jpg";
import { useAsync, useLoading } from "@vc-shell/framework";

export default () => {
  const data = ref([]) as Ref<
    {
      imgSrc: string;
      name: string;
      createdDate: Date;
      id: string;
    }[]
  >;

  // Example mocked method for 'fetching' list data
  const { loading: itemLoading, action: getItems } = useAsync(async (payload) => {
    data.value = await new Promise((resolve) => {
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
        1000,
      );
    });
  });

  const loading = useLoading(itemLoading);

  return {
    data: computed(() => data.value),
    loading: computed(() => loading.value),
    totalCount: computed(() => data.value.length),
    pages: computed(() => Math.ceil(data.value.length / 20)),
    currentPage: 0 / Math.max(1, 20) + 1,
    getItems,
  };
};
