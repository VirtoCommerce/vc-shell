/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTableTemplates } from "./../../composables";
import { Component, ExtractPropTypes, computed, h, inject, toValue, unref } from "vue";
import { Table } from "../factories";
import componentProps from "./props";
import { TableSchema } from "../../types";
import { useI18n } from "vue-i18n";
import { unrefNested } from "../../helpers/unrefNested";
import { setModel } from "../../helpers/setters";
import { IActionBuilderResult, ITableColumns } from "../../../../../core/types";

type TableItemData<T> = {
  name: string;
  item: T;
  cell: ITableColumns;
  index: number;
};

export default {
  name: "TableEl",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: TableSchema }) {
    const { tableTemplates } = useTableTemplates(props.element);
    const { t } = useI18n({ useScope: "global" });
    const enableEdit = inject("isBladeEditable", false);
    const enableEditComputed = computed(() => unref(enableEdit));
    const items = (unrefNested(props.baseProps).modelValue ?? []) as any[];

    function disabledActionHandler(disabled: { method?: string } | boolean, item: (typeof items)[number]): boolean {
      if (!disabled) return false;
      if (typeof disabled === "boolean") return disabled;
      else if (disabled.method && typeof toValue(props.bladeContext.scope)?.[disabled.method] === "function")
        return toValue(props.bladeContext.scope)?.[disabled.method]({ item });
      else if (disabled.method && toValue(props.bladeContext.scope)?.[disabled.method])
        return toValue(props.bladeContext.scope)?.[disabled.method];
      return false;
    }

    function actionBuilder(item: (typeof items)[number]): IActionBuilderResult[] | undefined {
      const result = props.element?.actions?.reduce((arr, action) => {
        const isDisabled = disabledActionHandler(action?.disabled ?? false, item);

        if (!toValue(isDisabled)) {
          arr.push({
            icon: action.icon,
            title: computed(() => t(action.title)),
            type: action.type,
            position: action.position,
            clickHandler: async (itemVal: (typeof items)[number], index: number) => {
              try {
                await toValue(props.bladeContext.scope)?.[action.method]?.(itemVal, index);
              } catch (error) {
                throw new Error(`Method ${action.method} is not defined in scope or toolbarOverrides`);
              }
            },
          });
        }
        return arr;
      }, [] as IActionBuilderResult[]);

      return result;
    }

    return () => {
      const field = Table({
        props: Object.assign(
          {},
          {
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
            enableItemActions: !!props.element.actions,
            itemActionBuilder: actionBuilder,
            get selectedItemId() {
              if (
                props.element.selectedItemId?.method &&
                props.bladeContext.scope?.[props.element.selectedItemId?.method]
              ) {
                if (typeof props.bladeContext.scope?.[props.element.selectedItemId?.method] === "function") {
                  return props.bladeContext.scope?.[props.element.selectedItemId?.method]?.();
                } else {
                  return props.bladeContext.scope?.[props.element.selectedItemId?.method];
                }
              }
            },
            get selectedItems() {
              if (
                props.element.selectedIds?.method &&
                props.bladeContext.scope?.[props.element.selectedIds?.method] &&
                typeof props.bladeContext.scope?.[props.element.selectedIds?.method] === "function"
              ) {
                return props.bladeContext.scope?.[props.element.selectedIds?.method]?.();
              }
              return [];
            },
            onItemClick: (item: (typeof items)[number]) => {
              if (
                props.element.onItemClick?.method &&
                props.bladeContext.scope?.[props.element.onItemClick?.method] &&
                typeof props.bladeContext.scope?.[props.element.onItemClick?.method] === "function"
              ) {
                props.bladeContext.scope?.[props.element.onItemClick?.method](item);
              }
            },
            onOnEditComplete: (data: { event: { field: string; value: any }; index: number }) => {
              if (props.fieldContext) {
                setModel({
                  context: props.fieldContext,
                  property: `${props.element.property}.${data.index}.${data.event.field}`,
                  value: data.event.value,
                });
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
            onOnCellBlur: async (data: { row: number | undefined; field: string }) => {
              if (props.element.columns) {
                const column = props.element.columns.find((col) => col.id === data.field);
                if (column && column.onCellBlur && column.onCellBlur.method) {
                  if (
                    props.bladeContext.scope?.[column.onCellBlur.method] &&
                    typeof props.bladeContext.scope[column.onCellBlur.method] === "function"
                  ) {
                    await props.bladeContext.scope[column.onCellBlur.method](data);
                  }
                }
              }
            },
          },
          unrefNested(props.baseProps),
        ),
        slots: {
          ...Object.entries(tableTemplates.templateOverrideComponents).reduce(
            (obj, [key, value], index) => {
              obj[`item_${key}`] = (itemData: TableItemData<(typeof items)[number]>) => {
                return h(unref(value), {
                  index: itemData.index,
                  context: itemData,
                  key: `template_override_${props.element.id}_${index}`,
                  bladeContext: props.bladeContext,
                  onEditComplete: (data: any) => {
                    if (props.fieldContext) {
                      setModel({
                        context: props.fieldContext,
                        property: `${props.element.property}.${itemData.index}.${key}`,
                        value: data,
                      });
                    }
                  },
                });
              };

              return obj;
            },
            {} as Record<`item_${string}`, any>,
          ),
          notfound: tableTemplates?.notFound
            ? () => h(tableTemplates.notFound as Component, { context: props.bladeContext })
            : undefined,
          "mobile-item": tableTemplates?.mobileView
            ? (itemData: (typeof items)[number]) =>
                h(tableTemplates.mobileView as Component, { context: itemData, bladeContext: props.bladeContext })
            : undefined,
          empty: tableTemplates?.empty
            ? () => h(tableTemplates.empty as Component, { context: props.bladeContext })
            : undefined,
          footer: tableTemplates?.footer
            ? () => h(tableTemplates.footer as Component, { context: props.bladeContext })
            : undefined,
        },
      });

      return h(field.component as Component, field.props, field.slots);
    };
  },
};
