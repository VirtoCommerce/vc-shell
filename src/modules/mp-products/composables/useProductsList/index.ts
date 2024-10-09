import { ListComposableArgs, useBladeNavigation, TOpenBladeArgs, UseList } from "@vc-shell/framework";
import { useProductsList, ProductListScope } from "../../../products/composables/useProductsList";
import { ISearchProductsQuery, SellerProduct } from "@vcmp-vendor-portal/api/marketplacevendor";
import * as _ from "lodash-es";
import { ICatalogListEntrySearchCriteria, ListEntryBase } from "@vcmp-vendor-portal/api/catalog";
import { Ref, ref } from "vue";

export interface ProductsListExtendedScope extends ProductListScope {
  openDetailsBlade: (args?: TOpenBladeArgs) => Promise<void>;
}

// export const useProductsListExtended = (
//   args: ListComposableArgs,
// ): UseList<
//   SellerProduct[] | ListEntryBase[],
//   (ISearchProductsQuery | ICatalogListEntrySearchCriteria) & { id?: string },
//   ProductsListExtendedScope
// > => {
//   const { items, load, loading, query, pagination, remove, scope } = useProductsList(args);
//   const { openBlade, resolveBladeByName } = useBladeNavigation();

//   const loadWrap = async (loadQuery?: ISearchProductsQuery) => {
//     query.value = Object.assign(query.value, loadQuery, { isPublished: true, searchFromAllSellers: true });

//     await load(query.value);
//   };

//   async function openDetailsBlade(args?: TOpenBladeArgs) {
//     await openBlade({
//       blade: resolveBladeByName("MpProduct"),
//       ...args,
//     });
//   }

//   const extendedScope: ProductsListExtendedScope = _.merge(scope, {
//     openDetailsBlade,
//   });

//   return { items, load: loadWrap, loading, query, pagination, remove, scope: extendedScope };
// };

export const useProductsListExtended = (arg: {
  scope: Record<string, unknown>;
  load: (query: ISearchProductsQuery) => Promise<void>;
  query: Ref<ISearchProductsQuery>;
}) => {
  const { openBlade, resolveBladeByName } = useBladeNavigation();

  const query = ref<ISearchProductsQuery>({});

  const loadWrap = async (loadQuery?: ISearchProductsQuery) => {
    query.value = Object.assign(query.value, loadQuery, { isPublished: true, searchFromAllSellers: true });

    await arg.load(query.value);
  };

  async function openDetailsBlade(args?: TOpenBladeArgs) {
    await openBlade({
      blade: resolveBladeByName("MpProduct"),
      ...args,
    });
  }

  const scope = {
    openDetailsBlade,
  };

  return {
    scope: _.merge(arg.scope, scope),
    load: loadWrap,
    query: _.merge(arg.query, query),
  };
};
