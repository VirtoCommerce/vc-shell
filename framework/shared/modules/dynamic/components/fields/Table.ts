/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTableTemplates } from "./../../composables";
import { Component, ExtractPropTypes, computed, h, unref } from "vue";
import { Table } from "../factories";
import componentProps from "./props";
import { TableSchema } from "../../types";
import { useI18n } from "vue-i18n";
import { unrefNested } from "../../helpers/unrefNested";

type TableItemData = Record<string, any>;

export default {
  name: "TableEl",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: TableSchema }) {
    const { tableTemplates } = useTableTemplates(props.element);
    const { t } = useI18n({ useScope: "global" });

    return () => {
      const field = Table({
        props: Object.assign(
          {},
          {
            header: !!props.element.header,
            footer: !!props.element.footer,
            multiselect: !!props.element.multiselect,
            columns: props.element.columns?.map((col) => ({ ...col, title: computed(() => t(col.title)) })),
            items: unrefNested(props.baseProps).modelValue ?? [],
            stateKey: props.element.id,
            class: `!tw-flex-auto ${unrefNested(props.baseProps).classNames ?? ""}`,
          },
          unrefNested(props.baseProps),
        ),
        slots: {
          ...Object.entries(tableTemplates.templateOverrideComponents).reduce(
            (obj, [key, value], index) => {
              obj[`item_${key}`] = (itemData: TableItemData) => {
                return h(unref(value), { context: itemData, key: `template_override_${props.element.id}_${index}` });
              };

              return obj;
            },
            {} as Record<`item_${string}`, any>,
          ),
          notfound: tableTemplates?.notFound
            ? (itemData: TableItemData) => h(tableTemplates.notFound as Component, { context: itemData })
            : () => undefined,
          "mobile-item": tableTemplates?.mobileView
            ? (itemData: TableItemData) => h(tableTemplates.mobileView as Component, { context: itemData })
            : () => undefined,
          empty: tableTemplates?.empty
            ? (itemData: TableItemData) => h(tableTemplates.empty as Component, { context: itemData })
            : () => undefined,
        },
      });

      return h(field.component as Component, field.props, field.slots);
    };
  },
};
