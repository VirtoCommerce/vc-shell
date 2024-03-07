import { computed, ref, Ref } from "vue";
import { DetailsBaseBladeScope, DynamicBladeForm, IBladeToolbar, useDetailsFactory } from "@vc-shell/framework";
import { loadMockItem, type MockedItem } from "../../../mocks";

export interface DynamicItemScope extends DetailsBaseBladeScope {
  toolbarOverrides: {
    refresh: IBladeToolbar;
  };
}

export default (args: {
  props: InstanceType<typeof DynamicBladeForm>["$props"];
  emit: InstanceType<typeof DynamicBladeForm>["$emit"];
  mounted: Ref<boolean>;
}) => {
  const factory = useDetailsFactory<MockedItem>({
    load: async (payload) => {
      return await loadMockItem(payload);
    },
    saveChanges: () => {
      throw new Error("Function not implemented.");
    },
    remove: () => {
      throw new Error("Function not implemented.");
    },
  });

  const { load, saveChanges, remove, loading, item, validationState } = factory();

  const scope = ref<DynamicItemScope>({
    toolbarOverrides: {
      refresh: {
        async clickHandler() {
          if (args.props.param) {
            await load({ id: args.props.param });
          }
        },
      },
    },
  });

  const bladeTitle = computed(() => {
    return args.props.param ? item.value?.name : "Dynamic item details";
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
