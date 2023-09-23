import { h, ref, computed, MaybeRef, unref, Component, onMounted, reactive } from "vue";
import * as _ from "lodash-es";
import { Checkbox, InputField } from "../../components/factories";
import { AsyncAction } from "../../../../../core/composables";
import { VcButton, VcCol, VcContainer, VcRow } from "../../../../../ui/components";

interface RawControl {
  field: string;
  type: string;
  label?: string;
  data?: { value: string; displayName: string }[];
}

interface Control {
  title: string;
  fields: {
    [x: string]: ReturnType<typeof Checkbox> | ReturnType<typeof InputField>;
  };
}

interface Data {
  columns: {
    title: string;
    controls: RawControl[];
  }[];
}

export default <Query>(args: { data: Data; query: MaybeRef<Query>; load: AsyncAction<Query> }) => {
  const _search = args.load;
  const _data = args.data;

  const isFilterVisible = ref(true);
  const filter = reactive({});

  const controls = ref<Control[]>([]);

  const appliedFilter = ref({});
  const activeFilterCount = computed(() => Object.values(appliedFilter.value).filter((item) => !!item).length);

  const disable = computed(() => !Object.keys(filter).length || _.some(filter, _.isEmpty));

  const reset = computed(() => !Object.keys(appliedFilter.value).length || _.some(appliedFilter.value, _.isEmpty));

  onMounted(() => createFilterControls());

  function isItemSelected(value: string, field: string) {
    return filter[field]?.some((x) => x === value);
  }

  function selectFilterItem(e: boolean, value: string, field: string) {
    const isSelected = filter[field]?.includes(value);

    if (!Array.isArray(filter[field])) {
      filter[field] = [];
    }

    if (e && !isSelected) {
      filter[field]?.push(value);
    } else if (!e && isSelected) {
      filter[field] = filter[field].filter((x) => x !== value);
    }
  }

  function createFilterControls() {
    if (!_data?.columns) {
      isFilterVisible.value = false;
      return;
    }
    controls.value = _data.columns.map((item): Control => {
      const ctr = item.controls.reduce((obj, control) => {
        if (control.type === "checkbox") {
          const filterData = control.data;
          const fields = createCheckboxFromData(filterData, control);

          obj = fields;
        }
        if (control.type === "input") {
          obj[control.field] = createInput(control);
        }

        return obj;
      }, {});

      return {
        title: item.title,
        fields: ctr,
      };
    });
  }

  function createCheckboxFromData(data: RawControl["data"], control: RawControl) {
    if (!(data && data.length)) return;
    return data.reduce((obj, currC) => {
      obj[currC.value] = Checkbox({
        props: {
          classNames: "tw-mb-2",
          modelValue: computed(() => isItemSelected(currC.value, control.field)),
          "onUpdate:modelValue": (e) => selectFilterItem(e, currC.value, control.field),
        },
        slots: {
          default: () => currC.displayName,
        },
        options: {
          visibility: true,
        },
      });

      return obj;
    }, {});
  }

  function createInput(control: RawControl) {
    return InputField({
      props: {
        type: "date",
        classNames: "tw-mb-3",
        label: control.label,
        modelValue: computed(() => filter[control.field]),
        "onUpdate:modelValue": (e) => (filter[control.field] = e),
      },
      options: {
        visibility: true,
      },
    });
  }

  async function applyFilters(filterHandlerFn: () => void) {
    filterHandlerFn();
    await _search({
      ...unref(args.query),
      ...filter,
    });
    appliedFilter.value = {
      ...filter,
    };
  }

  async function resetFilters(filterHandlerFn: () => void) {
    filterHandlerFn();
    Object.keys(filter).forEach((key: string) => (filter[key] = undefined));
    await _search({
      ...unref(args.query),
      ...filter,
    });
    appliedFilter.value = {};
  }

  function render(slotMethods: { close: () => void }) {
    if (_.isEmpty(controls.value)) return;
    return h(VcContainer, () => [
      h(VcRow, () =>
        Object.values(controls.value).map(({ title, fields }) =>
          h(VcCol, { class: "tw-p-2" }, () => [
            h("div", { class: "tw-mb-4 tw-text-[#a1c0d4] tw-font-bold tw-text-[17px]" }, title),
            Object.values(fields).map((item) => {
              if ("component" in item && item.component) {
                return h(
                  item.component as Component,
                  { ...item.props, class: item.props.classNames },
                  "slots" in item && item.slots ? { ...item.slots } : {}
                );
              }
            }),
          ])
        )
      ),
      h(VcRow, () =>
        h(VcCol, { class: "tw-p-2" }, () =>
          h("div", { class: "tw-flex tw-justify-end" }, [
            h(
              VcButton,
              {
                outline: true,
                class: "tw-mr-4",
                disabled: reset.value,
                onClick: () => resetFilters(slotMethods.close),
              },
              () => "Reset"
            ),
            h(
              VcButton,
              { disabled: disable.value, onClick: () => applyFilters(slotMethods.close) },
              () => "Apply filters"
            ),
          ])
        )
      ),
    ]);
  }

  return {
    filterComponent: render,
    activeFilterCount,
    isFilterVisible: computed(() => isFilterVisible.value),
  };
};
