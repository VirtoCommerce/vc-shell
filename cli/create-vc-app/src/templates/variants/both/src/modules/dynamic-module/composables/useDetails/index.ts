/* eslint-disable import/no-unresolved */
import { computed, ref, Ref } from "vue";
import img1 from "/assets/1.jpeg";
import img2 from "/assets/2.jpg";
import img3 from "/assets/3.jpg";
import {
  DetailsBaseBladeScope,
  DynamicBladeForm,
  IBladeToolbar,
  useDetailsFactory,
} from "@vc-shell/framework";

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
  const factory = useDetailsFactory<{ imgSrc: string; name: string; createdDate: Date; id: string }>({
    load: async (payload) => {
      return await new Promise((resolve) => {
        setTimeout(() => {
          const findMockedItem = [
            {
              imgSrc: img1,
              name: "Item 1",
              createdDate: new Date(),
              id: "item-id-1",
            },
            {
              imgSrc: img2,
              name: "Item 2",
              createdDate: new Date(),
              id: "item-id-2",
            },
            {
              imgSrc: img3,
              name: "Item 3",
              createdDate: new Date(),
              id: "item-id-3",
            },
          ].find((x) => x.id === payload.id);
          resolve(findMockedItem);
        }, 1000);
      });
    },
    saveChanges: () => {
      throw new Error("Function not implemented.");
    },
    remove: () => {
      throw new Error("Function not implemented.");
    },
  });

  const { load, saveChanges, remove, loading, item, validationState } = factory();

  // const item = ref({
  //   imgSrc: undefined,
  //   name: undefined,
  //   createdDate: undefined,
  //   id: undefined,
  // });

  const scope = ref<DynamicItemScope>({
    toolbarOverrides: {
      refresh: {
        async clickHandler() {
          await load({ id: args.props.param });
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
