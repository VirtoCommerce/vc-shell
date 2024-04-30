import { computed, ref, Ref } from "vue";
import { DetailsBaseBladeScope, DynamicBladeForm, UseDetails, useDetailsFactory } from "@vc-shell/framework";
import { addNewMockItem, loadMockItem, removeMockItem, updateMockItem } from "../../sample-data/methods";
import { currencyOptions, MockedItem } from "../../sample-data";
import { useI18n } from "vue-i18n";

export interface DynamicItemScope extends DetailsBaseBladeScope {
  currencyOptions: typeof currencyOptions;
}

export default (args: {
  props: InstanceType<typeof DynamicBladeForm>["$props"];
  emit: InstanceType<typeof DynamicBladeForm>["$emit"];
  mounted: Ref<boolean>;
}): UseDetails<MockedItem, DynamicItemScope> => {
  const factory = useDetailsFactory<MockedItem>({
    load: loadMockItem,
    saveChanges: (details) => {
      return details.id ? updateMockItem(details) : addNewMockItem(details);
    },
    remove: removeMockItem,
  });

  const { load, saveChanges, remove, loading, item, validationState } = factory();

  const scope = ref<DynamicItemScope>({
    currencyOptions,
  });
  const { t } = useI18n({ useScope: "global" });

  const bladeTitle = computed(() => {
    return args.props.param
      ? item.value?.name
        ? item.value?.name + t("SAMPLE_APP.PAGES.DETAILS.TITLE.DETAILS")
        : t("SAMPLE_APP.PAGES.DETAILS.TITLE.LOADING")
      : "Test App" + t("SAMPLE_APP.PAGES.DETAILS.TITLE.DETAILS");
  });

  return {
    load,
    saveChanges,
    remove,
    loading,
    item,
    validationState,
    bladeTitle,
    scope: computed(() => scope.value),
  };
};
