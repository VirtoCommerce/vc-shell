import { computed, ref } from "vue";
import { DynamicSchema } from "../../types";
import { BladeConstructor } from "../../../../index";

const menuItems = ref([]);
export default () => {
  function createMenuItem(page: BladeConstructor, data: DynamicSchema) {
    if ("moduleName" in data.settings && "icon" in data.settings) {
      const item = {
        title: data.settings.moduleName,
        icon: data.settings.icon,
        isVisible: true,
        component: page,
      };
      menuItems.value.push(item);
    }
  }

  return {
    dynamicModuleItems: computed(() => menuItems.value),
    createMenuItem,
  };
};
