/* eslint-disable @typescript-eslint/no-explicit-any */
import { IBladeToolbar } from "../../../../../core/types";
import * as _ from "lodash-es";
import { SettingsSchema, ToolbarSchema } from "../../types";
import { BaseBladeScope, DetailsBladeContext, ListBladeContext } from "../../factories/types";
import { useI18n } from "vue-i18n";
import { toValue } from "@vueuse/core";
import { UnwrapNestedRefs, computed, ref, ComputedRef } from "vue";

export const useToolbarReducer = (args: {
  defaultToolbarSchema: SettingsSchema["toolbar"];
  defaultToolbarBindings: BaseBladeScope["toolbarOverrides"];
  customToolbarConfig: BaseBladeScope["toolbarOverrides"];
  context: UnwrapNestedRefs<DetailsBladeContext> | UnwrapNestedRefs<ListBladeContext>;
  scope: ComputedRef<BaseBladeScope> | undefined;
}): UnwrapNestedRefs<ComputedRef<(IBladeToolbar & ToolbarSchema)[]>> | undefined => {
  if (!args) return;

  const { t } = useI18n({ useScope: "global" });

  const toolbarMethodsMerge = _.merge(
    ref({}),
    ref(args.defaultToolbarBindings),
    ref(toValue(args.customToolbarConfig)),
  );

  return computed(() => {
    if (args.defaultToolbarSchema?.length !== 0) {
      return args.defaultToolbarSchema?.reduce((acc, curr) => {
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
                    return toolbarItemCtx.clickHandler?.call(null, args.context);
                  },
                };

          acc.push({
            ...curr,
            ...context,
            title: t(curr.title) as string,
          });
        }

        return acc;
      }, [] as IBladeToolbar[]);
    }

    if (args.scope && toValue(toValue(args.scope).toolbarOverrides)) {
      const toolbarOverrides: BaseBladeScope["toolbarOverrides"] = toValue(toValue(args.scope).toolbarOverrides);

      if (Array.isArray(toolbarOverrides)) {
        return toolbarOverrides;
      } else if (typeof toolbarOverrides === "function") {
        return toolbarOverrides(args.context);
      } else if (typeof toolbarOverrides === "object") {
        return Object.values(toolbarOverrides);
      }
    }

    return [];
  });
};
