/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  h,
  ref,
  computed,
  MaybeRef,
  unref,
  Component,
  onMounted,
  RendererElement,
  RendererNode,
  VNode,
  ComputedRef,
  readonly,
  toValue,
  Ref,
} from "vue";
import * as _ from "lodash-es";
import { Checkbox, InputField } from "../../components/factories";
import { AsyncAction } from "../../../../../core/composables";
import { VcButton, VcCol, VcContainer, VcRow } from "../../../../../ui/components";
import { createUnrefFn } from "@vueuse/core";
import { useI18n } from "vue-i18n";
import { FilterBase, FilterCheckbox, FilterDateInput } from "../../types";

interface Control {
  title: string;
  fields: {
    [x: string]: ReturnType<typeof Checkbox> | ReturnType<typeof InputField>;
  };
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
  scope: ComputedRef<Record<string, any>> | undefined;
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

  onMounted(() => createFilterControls());

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
              obj = fields;
            }
          }
          if (control.component === "vc-input") {
            obj[control.field] = createInput(control);
          }

          return obj;
        },
        {} as Record<string, ReturnType<typeof Checkbox> | ReturnType<typeof InputField>>,
      );

      return {
        title: item.title,
        fields: ctr,
      };
    });
  }

  // TODO add to documentation support of dynamic data for filter
  function createCheckboxFromData(data: MaybeRef<Record<string, string>[]>, control: FilterCheckbox) {
    if (!(toValue(data) && toValue(data).length)) return;
    return toValue(data).reduce(
      (obj, currC) => {
        obj[currC[control.optionValue]] = Checkbox({
          props: {
            class: "tw-mb-2",
            modelValue: computed(() => isItemSelected(currC[control.optionValue], control.field)),
            "onUpdate:modelValue": (e: boolean) =>
              selectFilterItem(e, currC[control.optionValue], control.field, control.multiple),
          },
          slots: {
            default: () => toValue(currC[control.optionLabel]),
          },
        });

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
        modelValue: computed(() => filter.value[control.field]),
        "onUpdate:modelValue": (e: unknown) => (filter.value[control.field] = e),
      },
    });
  }

  async function applyFilters(filterHandlerFn: () => void) {
    filterHandlerFn();
    await _search({
      ...unref(args.query),
      ...filter.value,
    });
    appliedFilter.value = {
      ...filter.value,
    };
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
          if (Object.keys(appliedFilter.value).length) {
            filter.value = _.cloneDeep(appliedFilter.value);
          }
        },
      },
      () => [
        h(VcRow, () =>
          Object.values(controls.value).map(({ title, fields }) =>
            h(VcCol, { class: "tw-p-2" }, () => [
              h(
                "div",
                { class: "tw-mb-4 tw-text-[#a1c0d4] tw-font-bold tw-text-[17px]" },
                unref(computed(() => t(title))),
              ),
              Object.values(fields).map((item) => {
                if ("component" in item && item.component) {
                  return h(
                    item.component as Component,
                    { ...item.props, class: item.props.class },
                    "slots" in item && item.slots ? { ...item.slots } : {},
                  );
                }
              }),
            ]),
          ),
        ),
        h(VcRow, () =>
          h(VcCol, { class: "tw-p-2" }, () =>
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
    filter: readonly(filter.value),
    isFilterVisible: computed(() => isFilterVisible.value),
    reset,
  };
};
