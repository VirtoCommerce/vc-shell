import { computed, ref, Ref } from "vue";
import { DetailsBaseBladeScope, IBladeToolbar, useDetailsFactory, DetailsComposableArgs } from "@vc-shell/framework";

export interface DynamicItemScope extends DetailsBaseBladeScope {
  toolbarOverrides: {
    refresh: IBladeToolbar;
  };
}

export default (args: DetailsComposableArgs) => {
  const factory = useDetailsFactory({
    load: async () => {
      return {};
    },
    saveChanges: () => {
      throw new Error("Function not implemented.");
    },
    remove: () => {
      throw new Error("Function not implemented.");
    },
  });

  const { load, saveChanges, remove, loading, item, validationState } = factory();

  const scope = ref<DynamicItemScope>();

  const bladeTitle = computed(() => {
    return "{{ModuleNameSentenceCase}} details";
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
