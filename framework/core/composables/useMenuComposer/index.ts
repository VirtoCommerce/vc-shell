import { BladeMenu, IBladeToolbar, NavigationMenu, ToolbarMenu } from "./../../types";

interface IUseMenuComposer {
  navigationMenuComposer<T extends BladeMenu[]>(items: [...{ [I in keyof T]: NavigationMenu<T[I]> }]): BladeMenu[];
  toolbarComposer<T extends IBladeToolbar[]>(items: [...{ [I in keyof T]: ToolbarMenu<T[I]> }]): IBladeToolbar[];
}

export function useMenuComposer(): IUseMenuComposer {
  function navigationMenuComposer<T extends BladeMenu[]>(
    items: [...{ [I in keyof T]: NavigationMenu<T[I]> }]
  ): BladeMenu[] {
    return items;
  }

  function toolbarComposer<T extends IBladeToolbar[]>(
    items: [...{ [I in keyof T]: ToolbarMenu<T[I]> }]
  ): IBladeToolbar[] {
    return items;
  }

  return {
    navigationMenuComposer,
    toolbarComposer,
  };
}
