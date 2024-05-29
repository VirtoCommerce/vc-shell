import { ListComposableArgs, useBladeNavigation, TOpenBladeArgs, UseList } from "@vc-shell/framework";
import { useProductsList, ProductListScope } from "../../../products/composables/useProductsList";
import { ISearchProductsQuery, SellerProduct } from "@vcmp-vendor-portal/api/marketplacevendor";
import * as _ from "lodash-es";

export interface ProductsListExtendedScope extends ProductListScope {
  openDetailsBlade: (args?: TOpenBladeArgs) => Promise<void>;
}

export const useProductsListExtended = (
  args: ListComposableArgs,
): UseList<SellerProduct[], ISearchProductsQuery, ProductsListExtendedScope> => {
  const { items, load, loading, query, pagination, remove, scope } = useProductsList(args);
  const { openBlade, resolveBladeByName } = useBladeNavigation();

  const loadWrap = async (loadQuery?: ISearchProductsQuery) => {
    query.value = Object.assign(query.value, loadQuery, { isPublished: true, searchFromAllSellers: true });

    await load(query.value);
  };

  async function openDetailsBlade(args?: TOpenBladeArgs) {
    await openBlade({
      blade: resolveBladeByName("MpProduct"),
      ...args,
    });
  }

  const extendedScope: ProductsListExtendedScope = _.merge(scope, {
    openDetailsBlade,
  });

  return { items, load: loadWrap, loading, query, pagination, remove, scope: extendedScope };
};
