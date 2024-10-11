import { toReactive, createUnrefFn } from "@vueuse/core";
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  h,
  ref,
  computed,
  MaybeRef,
  unref,
  Component,
  RendererElement,
  RendererNode,
  VNode,
  ComputedRef,
  readonly,
  toValue,
  Ref,
  watchPostEffect,
} from "vue";
import * as _ from "lodash-es";
import { Checkbox, InputField, Switch, SelectField, RadioButton } from "../../components/factories";
import { AsyncAction } from "../../../../../core/composables";
import { VcButton, VcCol, VcContainer, VcLabel, VcRow } from "../../../../../ui/components";
import { useI18n } from "vue-i18n";
import { FilterBase, FilterCheckbox, FilterDateInput, FilterRadio, FilterSelect, FilterSwitch } from "../../types";

interface Control {
  title: string;
  fields: Record<
    string,
    {
      fields: Record<
        string,
        | ReturnType<typeof Checkbox>
        | ReturnType<typeof InputField>
        | ReturnType<typeof Switch>
        | ReturnType<typeof SelectField>
        | ReturnType<typeof RadioButton>
      >;
      label?: string | ComputedRef<string> | undefined;
      tooltip?: string | ComputedRef<string> | undefined;
    }
  >;
}

export interface UseFilterBuilder {
  filterComponent: (slotMethods: { close: () => void }) =>
    | VNode<
        RendererNode,
        RendererElement,
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          [key: string]: any;
        }
      >
    | undefined;
  activeFilterCount: ComputedRef<number>;
  isFilterVisible: ComputedRef<boolean>;
  reset: () => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly filter: Record<string, any>;
}

export default <Query>(args: {
  data: FilterBase | undefined;
  query: MaybeRef<Query>;
  load: AsyncAction<Query>;
  scope: Record<string, any> | undefined;
}): UseFilterBuilder => {
  const _search = args.load;
  const _data = args.data;

  const isFilterVisible = ref(true);
  const filter: Ref<Record<string, unknown>> = ref({});
  const { t } = useI18n({ useScope: "global" });

  const controls = ref<Control[]>([]);

  const appliedFilter = ref({});
  const activeFilterCount = computed(() => Object.values(appliedFilter.value).filter((item) => !!item).length);

  const isDisabled = createUnrefFn((filterObj: Record<string, unknown>) => {
    const filterKeys = Object.keys(filterObj);
    return filterKeys.length === 0 || filterKeys.every((key) => !filterObj[key]);
  });

  watchPostEffect(() => {
    createFilterControls();
  });

  function isItemSelected(value: string, field: string) {
    const item = filter.value[field];
    if (Array.isArray(item) && typeof item !== "string") {
      return item.some((x) => x === value);
    } else {
      return item === value;
    }
  }

  function selectFilterItem(e: boolean, value: string, field: string, multiple = true) {
    if (multiple) {
      filter.value[field] = e
        ? [...((filter.value[field] as string[]) || []), value]
        : ((filter.value[field] as string[]) || []).filter((x) => x !== value);

      if (!(filter.value[field] as string[]).length) filter.value[field] = undefined;
    } else {
      filter.value[field] = e ? value : undefined;
    }
  }

  function createFilterControls() {
    if (!_data?.columns) {
      isFilterVisible.value = false;
      return;
    }
    controls.value = _data.columns.map((item): Control => {
      const ctr = item.controls.reduce(
        (obj, control) => {
          if (control.component === "vc-checkbox") {
            const filterData = control.data;
            const filterDataFromScope = unref(args.scope)?.[filterData] ?? [];
            const fields = createCheckboxFromData(filterDataFromScope, control);

            if (fields) {
              obj[control.field] = {
                fields,
                label: computed(() => t(control.label ?? "")),
                tooltip: computed(() => t(control.tooltip ?? "")),
              };
            }
          }

          if (control.component === "vc-input") {
            obj[control.field] = {
              fields: {
                [control.field]: createInput(control),
              },
            };
          }

          if (control.component === "vc-switch") {
            const filterData = control.data;
            const filterDataFromScope = unref(args.scope)?.[filterData] ?? [];
            const fields = createSwitchFromData(filterDataFromScope, control);

            if (fields) {
              obj[control.field] = {
                fields,
              };
            }
          }

          if (control.component === "vc-select") {
            const filterData = control.data;
            const filterDataFromScope = unref(args.scope)?.[filterData] ?? [];
            const fields = createSelectFromData(filterDataFromScope, control);

            if (fields) {
              obj[control.field] = {
                fields,
              };
            }
          }

          if (control.component === "vc-radio-button-group") {
            const filterData = control.data;
            const filterDataFromScope = unref(args.scope)?.[filterData] ?? [];
            const fields = createRadioButtonGroupFromData(filterDataFromScope, control);

            if (fields) {
              obj[control.field] = {
                fields,
                label: computed(() => t(control.label ?? "")),
                tooltip: computed(() => t(control.tooltip ?? "")),
              };
            }
          }

          return obj;
        },
        {} as Record<
          string,
          {
            fields: Record<
              string,
              | ReturnType<typeof Checkbox>
              | ReturnType<typeof InputField>
              | ReturnType<typeof Switch>
              | ReturnType<typeof SelectField>
              | ReturnType<typeof RadioButton>
            >;
            label?: string | ComputedRef<string>;
            tooltip?: string | ComputedRef<string>;
          }
        >,
      );

      return {
        title: item.title ?? "",
        fields: ctr,
      };
    });
  }

  function createRadioButtonGroupFromData(data: MaybeRef<Record<string, string>[]>, control: FilterRadio) {
    if (!(toValue(data) && toValue(data).length)) return;
    return toValue(data).reduce(
      (obj, currC) => {
        obj[currC[control.optionValue]] = {
          ...RadioButton({
            props: {
              class: "tw-mb-2",
              value: currC[control.optionValue],
              label: currC[control.optionLabel],
              modelValue: computed(() => filter.value[control.field]),
              "onUpdate:modelValue": (e: string) => {
                filter.value[control.field] = e;
              },
            },
          }),
        };

        return obj;
      },
      {} as Record<string, ReturnType<typeof RadioButton>>,
    );
  }

  function createSelectFromData(data: MaybeRef<Record<string, string>[]>, control: FilterSelect) {
    if (!(toValue(data) && toValue(data).length)) return;

    return {
      [control.field]: SelectField({
        props: {
          class: "tw-mb-2",
          label: computed(() => t(control.label ?? "")) as unknown as string,
          tooltip: computed(() => t(control.tooltip ?? "")) as unknown as string,
          options: toValue(data),
          multiple: control.multiple,
          optionLabel: control.optionLabel,
          optionValue: control.optionValue,
          clearable: false,
          modelValue: computed(() => filter.value[control.field]),
          "onUpdate:modelValue": (e: string | string[]) => {
            if (Array.isArray(e) && e.length === 0) {
              filter.value[control.field] = undefined;
              return;
            }
            filter.value[control.field] = e;
          },
        },
      }),
    };
  }

  function createSwitchFromData(data: MaybeRef<Record<string, string>[]>, control: FilterSwitch) {
    if (!(toValue(data) && toValue(data).length)) return;
    return toValue(data).reduce(
      (obj, currC) => {
        obj[currC[control.optionValue]] = Switch({
          props: {
            class: "tw-mb-2",
            label: toValue(currC[control.optionLabel]),
            tooltip: computed(() => t(control.tooltip ?? "")) as unknown as string,
            modelValue: computed(() => isItemSelected(currC[control.optionValue], control.field)),
            "onUpdate:modelValue": (e: boolean) =>
              selectFilterItem(e, currC[control.optionValue], control.field, control.multiple),
          },
        });

        return obj;
      },
      {} as Record<string, ReturnType<typeof Switch>>,
    );
  }

  function createCheckboxFromData(data: MaybeRef<Record<string, string>[]>, control: FilterCheckbox) {
    if (!(toValue(data) && toValue(data).length)) return;
    return toValue(data).reduce(
      (obj, currC) => {
        obj[currC[control.optionValue]] = {
          ...Checkbox({
            props: {
              class: "tw-mb-2",
              modelValue: computed(() => isItemSelected(currC[control.optionValue], control.field)),
              "onUpdate:modelValue": (e: boolean) =>
                selectFilterItem(e, currC[control.optionValue], control.field, control.multiple),
            },
            slots: {
              default: () => toValue(currC[control.optionLabel]),
            },
          }),
        };

        return obj;
      },
      {} as Record<string, ReturnType<typeof Checkbox>>,
    );
  }

  function createInput(control: FilterDateInput) {
    return InputField({
      props: {
        type: "date",
        class: "tw-mb-3",
        label: toValue(computed(() => t(control.label ?? ""))),
        tooltip: toValue(computed(() => t(control.tooltip ?? ""))),
        modelValue: computed(() => filter.value[control.field]),
        "onUpdate:modelValue": (e: unknown) => (filter.value[control.field] = e),
      },
    });
  }

  async function applyFilters(filterHandlerFn: () => void) {
    appliedFilter.value = {
      ...filter.value,
    };
    filterHandlerFn();
    await _search({
      ...(_.omit(unref(args.query) as object, "skip") as Query),
      ...filter.value,
    });
  }

  async function resetFilters(filterHandlerFn: () => void) {
    filterHandlerFn();

    await reset();

    await _search({
      ...unref(args.query),
      ...filter.value,
    });
  }

  function render(slotMethods: { close: () => void }) {
    if (_.isEmpty(controls.value)) return;
    return h(
      VcContainer,
      {
        onVnodeBeforeMount: () => {
          filter.value = { ...appliedFilter.value };
        },
      },
      () => [
        h(VcRow, () =>
          Object.values(controls.value).map(({ title, fields }) => {
            return h(VcCol, { class: "tw-p-2" }, () => [
              title
                ? h(
                    "div",
                    { class: "tw-mb-4 tw-text-[color:var(--secondary-500)] tw-font-bold tw-text-[17px]" },
                    unref(computed(() => t(title))),
                  )
                : undefined,
              Object.values(fields)?.map((items) => {
                return items.label
                  ? h(
                      VcLabel,
                      {
                        class: "tw-mb-2",
                      },
                      {
                        default: () => items.label,
                        tooltip: items.tooltip ? () => items.tooltip : undefined,
                      },
                    )
                  : undefined;
              }),
              Object.values(fields)?.map((items) => {
                return Object.values(items.fields).map((item) => {
                  if ("component" in item && item.component) {
                    return [
                      h(
                        item.component as Component,
                        { ...item.props, class: item.props.class },
                        "slots" in item && item.slots ? { ...item.slots } : {},
                      ),
                    ];
                  } else {
                    return item;
                  }
                });
              }),
            ]);
          }),
        ),
        h(VcRow, () =>
          h(VcCol, { class: "tw-p-2 !tw-flex-auto" }, () =>
            h("div", { class: "tw-flex tw-justify-end" }, [
              h(
                VcButton,
                {
                  outline: true,
                  class: "tw-mr-4",
                  disabled: isDisabled(appliedFilter),
                  onClick: () => resetFilters(slotMethods.close),
                },
                () => t("COMPONENTS.FILTERS.RESET"),
              ),
              h(
                VcButton,
                {
                  disabled: isDisabled(filter),
                  onClick: () => applyFilters(slotMethods.close),
                },
                () => t("COMPONENTS.FILTERS.APPLY"),
              ),
            ]),
          ),
        ),
      ],
    );
  }

  async function reset() {
    Object.keys(filter.value).forEach((key: string) => (filter.value[key] = undefined));

    appliedFilter.value = {};
  }

  return {
    filterComponent: render,
    activeFilterCount,
    filter: readonly(toReactive(filter)),
    isFilterVisible: computed(() => isFilterVisible.value),
    reset,
  };
};
