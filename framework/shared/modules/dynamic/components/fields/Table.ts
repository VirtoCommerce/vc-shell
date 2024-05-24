/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTableTemplates } from "./../../composables";
import { Component, ExtractPropTypes, computed, h, inject, unref } from "vue";
import { Table } from "../factories";
import componentProps from "./props";
import { TableSchema } from "../../types";
import { useI18n } from "vue-i18n";
import { unrefNested } from "../../helpers/unrefNested";
import { setModel } from "../../helpers/setters";
import { safeIn } from "../../helpers/safeIn";

type TableItemData = Record<string, any>;

export default {
  name: "TableEl",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: TableSchema }) {
    const { tableTemplates } = useTableTemplates(props.element);
    const { t } = useI18n({ useScope: "global" });
    const enableEdit = inject("isBladeEditable", false);
    const enableEditComputed = computed(() => unref(enableEdit));

    return () => {
      const field = Table({
        props: Object.assign(
          {},
          {
            removeRowButton: props.element.removeRowButton?.show,
            addNewRowButton: props.element.addNewRowButton
              ? {
                  title: computed(() => t(props.element.addNewRowButton?.title ?? "")),
                  show: props.element.addNewRowButton.show,
                }
              : undefined,
            header: !!props.element.header,
            footer: !!props.element.footer,
            multiselect: !!props.element.multiselect,
            columns: props.element.columns?.map((col) => ({ ...col, title: computed(() => t(col.title)) })),
            items: unrefNested(props.baseProps).modelValue ?? [],
            stateKey: props.element.id,
            class: `!tw-flex-auto ${unrefNested(props.baseProps).classNames ?? ""}`,
            editing: enableEditComputed.value,
            onOnEditComplete: (data: any) => {
              if (props.fieldContext) {
                setModel({
                  context: props.fieldContext,
                  property: `${props.element.property}.${data.index}.${data.event.field}`,
                  value: data.event.value,
                });
              }
            },
            onOnRowRemove: (data: { index: number }) => {
              if (
                props.element.removeRowButton?.method &&
                props.bladeContext.scope?.[props.element.removeRowButton?.method] &&
                typeof props.bladeContext.scope?.[props.element.removeRowButton?.method] === "function"
              ) {
                props.bladeContext.scope?.[props.element.removeRowButton?.method]?.(data.index);
              }
            },
            onOnAddNewRow: () => {
              if (
                props.element.addNewRowButton?.method &&
                props.bladeContext.scope?.[props.element.addNewRowButton?.method] &&
                typeof props.bladeContext.scope?.[props.element.addNewRowButton?.method] === "function"
              ) {
                props.bladeContext.scope?.[props.element.addNewRowButton?.method]?.();
              }
            },
          },
          unrefNested(props.baseProps),
        ),
        slots: {
          ...Object.entries(tableTemplates.templateOverrideComponents).reduce(
            (obj, [key, value], index) => {
              obj[`item_${key}`] = (itemData: TableItemData) => {
                return h(unref(value), {
                  index: itemData.index,
                  context: itemData,
                  key: `template_override_${props.element.id}_${index}`,
                  bladeContext: props.bladeContext,
                });
              };

              return obj;
            },
            {} as Record<`item_${string}`, any>,
          ),
          notfound: tableTemplates?.notFound
            ? (itemData: TableItemData) => h(tableTemplates.notFound as Component, { context: itemData })
            : undefined,
          "mobile-item": tableTemplates?.mobileView
            ? (itemData: TableItemData) => h(tableTemplates.mobileView as Component, { context: itemData })
            : undefined,
          empty: tableTemplates?.empty
            ? (itemData: TableItemData) => h(tableTemplates.empty as Component, { context: itemData })
            : undefined,
          footer: tableTemplates?.footer
            ? (itemData: TableItemData) => h(tableTemplates.footer as Component, { context: itemData })
            : undefined,
        },
      });

      return h(field.component as Component, field.props, field.slots);
    };
  },
};
