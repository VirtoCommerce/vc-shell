import {
  useApiClient,
  useBladeNavigation,
  useLoading,
  UseList,
  ListComposableArgs,
  useListFactory,
  ListBaseBladeScope,
  IBladeToolbar,
  TOpenBladeArgs,
} from "@vc-shell/framework";
import {
  VcmpSellerCatalogClient,
  ISearchVideosQuery,
  SearchVideosQuery,
  SellerProduct,
} from "@vcmp-vendor-portal/api/marketplacevendor";
import { Video } from "@vcmp-vendor-portal/api/catalog";
import { computed, ref, onBeforeMount } from "vue";

const { getApiClient } = useApiClient(VcmpSellerCatalogClient);

export interface VideosListScope extends ListBaseBladeScope {
  disabled?: boolean;
  toolbarOverrides: {
    openAddBlade: IBladeToolbar;
    removeItems: IBladeToolbar;
  };
}

export const useVideosList = (
  args: ListComposableArgs<{
    options: { catalogProduct: SellerProduct; disabled?: boolean };
  }>,
): UseList<Video[], ISearchVideosQuery, VideosListScope> => {
  const listFactory = useListFactory<Video[], ISearchVideosQuery>({
    load: async (query) => {
      query.sort = "sortOrder:ASC";
      return (await getApiClient()).searchVideos(new SearchVideosQuery(query));
    },
    remove: async (query, customQuery) => {
      const videoIds = customQuery.ids;
      if (videoIds) {
        markProductDirty();
        return (await getApiClient()).delete(videoIds);
      }
    },
  });

  const { load, remove, items, query, loading, pagination } = listFactory();
  const { openBlade, resolveBladeByName } = useBladeNavigation();

  const isExporting = ref(false);

  async function openDetailsBlade(args?: TOpenBladeArgs) {
    await openBlade({
      blade: resolveBladeByName("Video"),
      options: { productId: query.value.ownerIds?.find(() => true) },
      ...args,
    });
  }

  async function markProductDirty() {
    args.emit("parent:call", {
      method: "markProductDirty",
    });
  }

  const scope: VideosListScope = {
    openDetailsBlade,
    markProductDirty,
    disabled: args.props.options.disabled,
    toolbarOverrides: {
      openAddBlade: {
        async clickHandler() {
          await openDetailsBlade();
        },
        isVisible: computed(() => !args.props.options.disabled),
      },
      removeItems: {
        isVisible: computed(() => !args.props.options.disabled),
      },
    },
  };

  onBeforeMount(async () => {
    if (
      args &&
      args.props &&
      "options" in args.props &&
      args.props.options &&
      typeof args.props.options === "object" &&
      "catalogProduct" in args.props.options &&
      args.props.options?.catalogProduct
    ) {
      if (args.props.options.catalogProduct["stagedProductDataId"]) {
        query.value.ownerIds = [args.props.options.catalogProduct["stagedProductDataId"]];
      }
    }
  });

  return {
    loading: useLoading(loading, isExporting),
    items,
    query,
    pagination,
    load,
    remove,
    scope,
  };
};
