/* eslint-disable @typescript-eslint/no-explicit-any */
import { IBladeToolbar } from "../../../../core/types";
import * as _ from "lodash-es";
import { UnwrapNestedRefs, computed, ref, ComputedRef } from "vue";
import { SettingsBase } from "../types";
import { BaseBladeScope, DetailsBladeContext, ListBladeContext } from "../factories/types";

export const toolbarReducer = (args: {
  defaultToolbarSchema: SettingsBase["toolbar"];
  defaultToolbarBindings: BaseBladeScope["toolbarOverrides"];
  customToolbarConfig: BaseBladeScope["toolbarOverrides"];
  context: UnwrapNestedRefs<DetailsBladeContext> | UnwrapNestedRefs<ListBladeContext>;
}): UnwrapNestedRefs<ComputedRef<IBladeToolbar[]>> => {
  if (!args) return;
  const toolbarMethodsMerge = _.merge(ref({}), ref(args.defaultToolbarBindings), ref(args.customToolbarConfig));
  return computed(() =>
    args.defaultToolbarSchema.reduce((acc, curr) => {
      const toolbarItemCtx = toolbarMethodsMerge.value[
        curr.method as keyof typeof toolbarMethodsMerge.value
      ] as IBladeToolbar;
      if (toolbarItemCtx) {
        const context =
          typeof toolbarItemCtx === "function"
            ? {
                clickHandler: async () => await (toolbarItemCtx as (ctx: typeof args.context) => any)(args.context),
              }
            : {
                ...toolbarItemCtx,
                clickHandler() {
                  return toolbarItemCtx.clickHandler.call(null, args.context);
                },
              };

        acc.push({
          ...curr,
          ...context,
        });
      }

      return acc;
    }, [])
  );
};
