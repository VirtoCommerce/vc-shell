import { useProductsListExtended } from "./composables/useProductsList";
import { createDynamicAppModule } from "@vc-shell/framework";
import * as mpLocales from "./locales";
import overrides from "./schemaOverride";

export default createDynamicAppModule({
  overrides,
  mixin: {
    MpProducts: [useProductsListExtended],
  },
  locales: mpLocales,
});

export type { ProductsListExtendedScope } from "./composables/useProductsList";
