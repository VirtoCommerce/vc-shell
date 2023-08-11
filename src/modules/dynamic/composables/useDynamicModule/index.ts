import { BladeConstructor } from "@vc-shell/framework";
import { computed, ref } from "vue";
import { DynamicData } from "../../types";

const menuItems = ref([]);
export default () => {
  function createMenuItem(page: BladeConstructor, data: DynamicData) {
    const item = {
      title: data.settings.moduleName,
      icon: data.settings.icon,
      isVisible: true,
      component: page,
    };
    menuItems.value.push(item);
  }

  return {
    dynamicModuleItems: computed(() => menuItems.value),
    createMenuItem,
  };
};
