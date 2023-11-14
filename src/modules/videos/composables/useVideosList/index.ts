import {
  useApiClient,
  useBladeNavigation,
  useLoading,
  UseList,
  DynamicBladeList,
  useListFactory,
  ListBaseBladeScope,
  IBladeToolbar,
} from "@vc-shell/framework";
import {
  VcmpSellerCatalogClient,
  ISearchVideosQuery,
  SearchVideosQuery,
} from "@vcmp-vendor-portal/api/marketplacevendor";
import { Video } from "@vcmp-vendor-portal/api/catalog";
import { computed, ref, Ref, onMounted, watch } from "vue";

const { getApiClient } = useApiClient(VcmpSellerCatalogClient);

export interface VideosListScope extends ListBaseBladeScope {
  toolbarOverrides: {
    save: IBladeToolbar;
    openAddBlade: IBladeToolbar;
  };
}

export const useVideosList = (args: {
  props: InstanceType<typeof DynamicBladeList>["$props"];
  emit: InstanceType<typeof DynamicBladeList>["$emit"];
  mounted: Ref<boolean>;
}): UseList<Video[], ISearchVideosQuery, VideosListScope> => {
  const listFactory = useListFactory<Video[], ISearchVideosQuery>({
    load: async (query) => {
      query.sort = "sortOrder:ASC";
      return (await getApiClient()).searchVideos(new SearchVideosQuery(query));
    },
    remove: async (query, customQuery) => {
      const videoIds = customQuery.ids;
      (await getApiClient()).delete(videoIds);
      await markProductDirty();
    },
  });

  const { load, remove, items, query, loading, pagination } = listFactory();
  const { openBlade, resolveBladeByName } = useBladeNavigation();

  const isExporting = ref(false);

  function openDetailsBlade(args?: Omit<Parameters<typeof openBlade>["0"], "blade">) {
    openBlade({
      blade: resolveBladeByName("Video"),
      options: { productId: query.value.ownerIds?.find(() => true) },
      ...args,
    });
  }

  async function openAddBlade() {
    openBlade({
      blade: resolveBladeByName("Video"),
      options: { productId: query.value.ownerIds?.find(() => true) },
    });
  }

  async function markProductDirty() {
    args.emit("parent:call", {
      method: "markProductDirty",
    });
  }

  const scope = ref<VideosListScope>({
    openDetailsBlade,
    markProductDirty,
    toolbarOverrides: {
      save: {
        async clickHandler(args) {
          await (await getApiClient()).update(args.items);
          await markProductDirty();
          await load(query.value);
        },
      },
      openAddBlade: {
        async clickHandler() {
          await openAddBlade();
        },
      },
    },
  });

  watch(
    () => args?.mounted.value,
    async () => {
      if (
        args &&
        args.props &&
        "options" in args.props &&
        args.props.options &&
        typeof args.props.options === "object" &&
        "catalogProduct" in args.props.options &&
        args.props.options?.catalogProduct
      )
        query.value.ownerIds = [args.props.options?.catalogProduct["stagedProductDataId"]];
    }
  );

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
