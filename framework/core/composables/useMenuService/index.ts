import { createSharedComposable, createUnrefFn, useArrayFind } from "@vueuse/core";
import { Ref, ref, computed } from "vue";
import * as _ from "lodash-es";
import { i18n } from "./../../plugins/i18n";
import { MenuItem } from "../../types";

interface MenuService {
  addMenuItem: (item: MenuItem) => void;
  menuItems: Ref<MenuItem[]>;
  removeMenuItem: (item: MenuItem) => void;
}

const menuItems: Ref<MenuItem[]> = ref([]);
const rawMenu: Ref<MenuItem[]> = ref([]);

function useMenuServiceFn(): MenuService {
  const { t } = i18n.global;

  function addMenuItem(item: MenuItem): void {
    rawMenu.value.push(item);
    constructMenu();
  }

  const upsert = createUnrefFn(
    (array: (MenuItem | Omit<MenuItem, "icon">)[], element: MenuItem | Omit<MenuItem, "icon">) => {
      const index = array.findIndex((_element) => _.isEqual(_.omit(_element, "title"), _.omit(element, "title")));
      if (index > -1) {
        array[index] = { ...element };
      } else {
        array.push({ ...element });
      }
    },
  );

  function sortByPriority(a: MenuItem, b: MenuItem): number {
    const getPriority = (item: MenuItem): number => item.priority ?? Infinity;
    return getPriority(a) - getPriority(b);
  }

  function sortByGroupPriority(a: MenuItem, b: MenuItem): number {
    const getGroupPriority = (item: MenuItem): number => item.inGroupPriority ?? Infinity;
    return getGroupPriority(a) - getGroupPriority(b);
  }

  function constructMenu(): void {
    const constructedMenu: Ref<MenuItem[]> = ref([]);

    rawMenu.value.forEach((item) => {
      if (item.group) {
        const isGroupExist = useArrayFind(
          constructedMenu,
          (m) => m.groupId === "group_" + _.snakeCase(t(item.group ?? "")),
        );

        const groupItem = _.omit(
          {
            ...item,
            title: computed(() => t(item.title as string)),
          },
          "group",
          "groupIcon",
          "groupPriority",
        );

        if (isGroupExist.value && isGroupExist.value.children) {
          upsert(isGroupExist.value.children, groupItem);
        } else {
          const group: Omit<MenuItem, "icon"> = {
            groupId: "group_" + _.snakeCase(t(item.group)),
            groupIcon: item.groupIcon ?? "",
            title: computed(() => t(item.group as string)),
            children: [_.omit(groupItem)],
            priority: item.priority,
          };
          upsert(constructedMenu.value, group);
        }
      } else {
        if (item.title) {
          upsert(constructedMenu.value, { ...item });
        }
      }
    });

    menuItems.value = constructedMenu.value
      .map(
        (x): MenuItem => ({
          ...x,
          title: computed(() => t(x.title as string)),
          id: _.snakeCase(t(x.title as string)),
          children: x.children?.sort(sortByGroupPriority),
        }),
      )
      .sort(sortByPriority);
  }

  function removeMenuItem(item: MenuItem): void {
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
