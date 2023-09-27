import module from "vc-sample-modules";
import { DynamicBladeForm } from "@vc-shell/framework";

export const useTeamDetailsExtended = (args: {
  props: InstanceType<typeof DynamicBladeForm>["$props"];
  emit: InstanceType<typeof DynamicBladeForm>["$emit"];
}) => {
  const { load, saveChanges, remove, loading, item, validationState, scope, bladeTitle } =
    module.SampleModule.composables.useTeamDetails(args);

  function customMethod() {
    alert("Toolbar button clicked!");
  }

  return {
    load,
    saveChanges,
    remove,
    loading,
    item,
    validationState,
    scope: {
      ...scope,
      overrideSampleFn: {
        clickHandler() {
          customMethod();
        },
      },
    },
    bladeTitle,
  };
};
