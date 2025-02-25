/* eslint-disable @typescript-eslint/no-explicit-any */
import { IBladeToolbar } from "../../../../../core/types";
import * as _ from "lodash-es";
import { SettingsSchema, ToolbarSchema } from "../../types";
import { BaseBladeScope, DetailsBladeContext, ListBladeContext } from "../../factories/types";
import { useI18n } from "vue-i18n";
import { toValue } from "@vueuse/core";
import { UnwrapNestedRefs, computed, ref, ComputedRef, unref } from "vue";

export const useToolbarReducer = (args: {
  defaultToolbarSchema: SettingsSchema["toolbar"];
  defaultToolbarBindings: BaseBladeScope["toolbarOverrides"];
  customToolbarConfig: BaseBladeScope["toolbarOverrides"];
  context: UnwrapNestedRefs<DetailsBladeContext> | UnwrapNestedRefs<ListBladeContext>;
}): UnwrapNestedRefs<ComputedRef<(IBladeToolbar & ToolbarSchema)[] | IBladeToolbar[] | undefined>> | undefined => {
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
        const toolbarItemCtx = toolbarMethodsMerge.value[curr.method as keyof typeof toolbarMethodsMerge.value] as
          | IBladeToolbar
          | IBladeToolbar[];
        if (toolbarItemCtx && Array.isArray(toolbarItemCtx)) {
          return acc.concat(
            toolbarItemCtx.map((item) => {
              return {
                ...curr,
                ...item,
                title: t(curr.title || unref<string>(item.title ?? "")) as string,
              };
            }),
          );
        }
        if (toolbarItemCtx && typeof toolbarItemCtx === "object") {
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
            icon: curr.icon || toolbarItemCtx.icon,
            title: t(curr.title || unref<string>(toolbarItemCtx.title ?? "")) as string,
          });
        }

        return acc;
      }, [] as IBladeToolbar[]);
    }

    return [];
  });
};
