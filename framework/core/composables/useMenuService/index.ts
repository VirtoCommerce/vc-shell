import { createSharedComposable, createUnrefFn, useArrayFind } from "@vueuse/core";
import { Ref, ref, computed } from "vue";
import * as _ from "lodash-es";
import { i18n } from "./../../plugins/i18n";
import { MenuItemConfig } from "../../../shared/components/blade-navigation/types";
import { MenuItem } from "../../types";

export interface IUseMenuService {
  addMenuItem: MenuItemConfig;
  menuItems: Ref<MenuItem[]>;
  removeMenuItem: (item: MenuItem) => void;
}

const menuItems: Ref<MenuItem[]> = ref([]);
const rawMenu: Ref<Record<string, unknown>[]> = ref([]);

function useMenuServiceFn() {
  const { t } = i18n.global;

  function addMenuItem(item: Record<string, unknown>) {
    rawMenu.value.push(item);

    constructMenu();
  }

  const upsert = createUnrefFn((array: Record<string, unknown>[], element: Record<string, unknown>) => {
    const i = array.findIndex((_element) => _.isEqual(_element, element));
    if (i > -1) array[i] = { ...element };
    else array.push({ ...element });
  });

  function sortByPriority(a: MenuItem, b: MenuItem) {
    const priorityA = a.priority !== undefined ? a.priority : Infinity;
    const priorityB = b.priority !== undefined ? b.priority : Infinity;

    return priorityA - priorityB;
  }

  function constructMenu() {
    const constructedMenu = ref<MenuItem[]>([]);

    rawMenu.value.forEach((item) => {
      let group;
      if (item.group) {
        const isGroupExist = useArrayFind(constructedMenu, (m) => m.groupId === "group_" + item.group);

        const groupItem = _.omit(
          {
            ...item,
            title: computed(() => t(item.title as string)),
          },
          "group",
        );

        if (isGroupExist.value) {
          upsert(isGroupExist.value.children, groupItem);
        } else {
          group = {
            groupId: "group_" + item.group,
            icon: item.icon,
            title: computed(() => t(item.group as string)),
            children: [_.omit(groupItem)],
            priority: item.priority,
          };
          upsert(constructedMenu.value, group);
        }
      } else {
        if (item && item.title) {
          upsert(constructedMenu.value, {
            ...item,
            title: item.title,
          });
        }
      }
    });

    menuItems.value = constructedMenu.value
      .map((x, index) => ({ ...x, title: computed(() => t(x.title as string)), id: index }))
      .sort(sortByPriority);
  }

  function removeMenuItem(item: MenuItem) {
    const index = menuItems.value.indexOf(item);
    menuItems.value.splice(index, 1);
  }

  return {
    addMenuItem,
    menuItems,
    removeMenuItem,
  };
}

const useMenuService = createSharedComposable(useMenuServiceFn);

export { useMenuService };
