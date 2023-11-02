import {
  useApiClient,
  useBladeNavigation,
  useLoading,
  useUser,
  UseList,
  DynamicBladeList,
  useListFactory,
  ListBaseBladeScope,
} from "@vc-shell/framework";
import {
  VcmpSellerCatalogClient,
  ISearchVideosQuery,
  SearchVideosQuery,
} from "vcmp-vendor-portal-api/marketplacevendor";
import { IVideo, Video, VideoSearchResult } from "vcmp-vendor-portal-api/catalog";

import { computed, ref, onMounted } from "vue";

const { getApiClient } = useApiClient(VcmpSellerCatalogClient);

export interface VideosListScope extends ListBaseBladeScope {
  toolbarOverrides: {
    openAddBlade: {
      clickHandler: () => Promise<void>;
    };
  };
}

export const useVideosList = (args: {
  props: InstanceType<typeof DynamicBladeList>["$props"];
  emit: InstanceType<typeof DynamicBladeList>["$emit"];
}): UseList<Video[], ISearchVideosQuery, VideosListScope> => {
  const listFactory = useListFactory<Video[], ISearchVideosQuery>({
    load: async (query) => (await getApiClient()).searchVideos(new SearchVideosQuery(query)),
    remove: async (query, customQuery) => {
      const videoIds = customQuery.ids;
      return (await getApiClient()).delete(videoIds);
    },
  });

  const { load, remove, items, query, loading, pagination } = listFactory();
  const { openBlade, resolveBladeByName } = useBladeNavigation();

  const isExporting = ref(false);

  function openDetailsBlade(args?: Omit<Parameters<typeof openBlade>["0"], "blade">) {
    openBlade({
      blade: resolveBladeByName("Video"),
      ...args,
    });
  }

  const scope = ref<VideosListScope>({
    openDetailsBlade,
    toolbarOverrides: {
      openAddBlade: {
        async clickHandler() {
          openBlade({
            blade: resolveBladeByName("Video"),
            options: { productId: query.value.ownerIds?.find((o) => true) },
          });
        },
      },
    },
  });

  onMounted(() => {
    if (
      args &&
      args.props &&
      "options" in args.props &&
      args.props.options &&
      "catalogProduct" in args.props.options &&
      args.props.options?.catalogProduct
    )
      query.value.ownerIds = [args.props.options?.catalogProduct["stagedProductDataId"]];
  });

  return {
    loading: useLoading(loading, isExporting),
    items,
    query,
    pagination,
    load,
    remove,
    scope: computed(() => scope.value),
  };
};
