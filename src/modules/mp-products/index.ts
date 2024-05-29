import { useProductsListExtended } from "./composables/useProductsList";
import { createDynamicAppModule } from "@vc-shell/framework";
import { schema, composables, locales } from "./../products";
import * as mpLocales from "./locales";
import overrides from "./schemaOverride";

export default createDynamicAppModule({
  schema,
  composables: {
    useProductDetails: composables.useProductDetails,
    useProductsList: useProductsListExtended,
  },
  overrides,
  locales: {
    ...locales,
    ...mpLocales,
  },
});

export type { ProductsListExtendedScope } from "./composables/useProductsList";
