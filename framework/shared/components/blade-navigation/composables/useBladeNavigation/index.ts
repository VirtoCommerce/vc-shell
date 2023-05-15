import {
  computed,
  ref,
  unref,
  watch,
  Ref,
  ComponentPublicInstance,
  getCurrentInstance,
  markRaw,
  inject,
  nextTick,
} from "vue";
import * as _ from "lodash-es";
import { useRouter, useRoute } from "vue-router";
import { usePermissions } from "../../../../../core/composables";
import {
  IBladeContainer,
  IBladeRef,
  IBladeEvent,
  IParentCallArgs,
  BladeConstructor,
  BladeComponentInternalInstance,
  BladeNavigationPlugin,
  notification,
} from "../../../..";
import { bladeNavigationInstance } from "./../../plugin";

interface IUseBladeNavigation {
  readonly blades: Ref<IBladeContainer[]>;
  readonly parentBladeOptions: Ref<Record<string, unknown>>;
  readonly parentBladeParam: Ref<string>;
  bladesRefs: Ref<IBladeRef[]>;
  openBlade: <Blade extends ComponentPublicInstance = ComponentPublicInstance>({
    blade,
    param,
    options,
    onOpen,
    onClose,
  }: IBladeEvent<Blade>) => void;
  closeBlade: (index: number) => void;
  onParentCall: (index: number, args: IParentCallArgs) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parentBladeOptions: Ref<Record<string, any>> = ref();
const parentBladeParam: Ref<string> = ref();

export function useBladeNavigation(): IUseBladeNavigation {
  const router = useRouter();
  const route = useRoute();
  const { checkPermission } = usePermissions();
  const isPrevented = ref(false);

  const instance: BladeComponentInternalInstance = getCurrentInstance();
  const navigationInstance =
    (instance && inject<BladeNavigationPlugin>("bladeNavigationPlugin")) || bladeNavigationInstance;

  const lastBladeUrl = ref();
  watch(
    navigationInstance.blades,
    (newVal) => {
      const lastBlade = newVal[newVal.length - 1];

      if (lastBlade && lastBlade.blade.url) {
        if (lastBlade.param) {
          addEntryToLocation(lastBlade.blade.url + "/" + lastBlade.param);
        } else {
          addEntryToLocation(lastBlade.blade.url);
        }
      } else if (!lastBlade) {
        clearParentData();
        addEntryToLocation(route.path);
      }
    },
    { deep: true }
  );

  async function openBlade<Blade extends ComponentPublicInstance>({
    blade,
    param,
    options,
    onOpen,
    onClose,
  }: IBladeEvent<Blade>) {
    const caller = instance && instance.vnode.type;

    const bladeComponent = unref(blade);
    const existingChild = findBlade(bladeComponent);
    const index = caller?.idx ? caller.idx : 0;

    const initiator = caller?.url && navigationInstance.bladesRefs.value.find((x) => x.blade.blade.url === caller.url);

    if (!initiator) {
      await closeBlade(0);

      if (!isPrevented.value) {
        parentBladeOptions.value = unref(options);
        parentBladeParam.value = unref(param);

        await router.push(bladeComponent.url);
      }
    } else {
      let isPrevented;
      if (existingChild === undefined) {
        bladeComponent.idx = index ? index + 1 : 1;
      } else if (existingChild) {
        isPrevented = await closeBlade(
          navigationInstance.blades.value.findIndex((x: IBladeContainer) => x.idx === existingChild.idx)
        );
        bladeComponent.idx = existingChild.idx;
      }
      if (!isPrevented) {
        await addBlade(bladeComponent, param, options, onOpen, onClose, index);
      }
    }
  }

  async function closeBlade(index: number) {
    console.debug(`[@vc-shell/framework#useBladeNavigation] - closeBlade called.`);
    const refsIndex = index + 1;

    if (refsIndex < navigationInstance.bladesRefs.value.length) {
      const children = navigationInstance.bladesRefs.value.slice(refsIndex).reverse();

      isPrevented.value = false;
      for (let i = 0; i < children.length; i++) {
        if (children[i]?.exposed.onBeforeClose && typeof children[i].exposed.onBeforeClose === "function") {
          const result = await children[i].exposed.onBeforeClose();
          if (result === false) {
            isPrevented.value = true;
            console.debug(`[@vc-shell/framework#useBladeNavigation] - Navigation is prevented`);
            return isPrevented;
          }
        }
      }
      if (!isPrevented.value) {
        if (typeof navigationInstance.blades.value[index]?.onClose === "function") {
          navigationInstance.blades.value[index]?.onClose?.();
        }

        navigationInstance.blades.value.splice(index);
      }
    }
  }

  async function addBlade(
    blade: BladeConstructor,
    param: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: Record<string, any>,
    onOpen: () => void,
    onClose: () => void,
    index?: number
  ) {
    if (index && navigationInstance.blades.value.length > index) {
      await closeBlade(index);
    }

    if (blade && checkPermission(blade.permissions)) {
      navigationInstance.blades.value.push({
        blade: markRaw(blade),
        options,
        param,
        onOpen,
        onClose,
        idx: blade.idx,
      });

      if (onOpen && typeof onOpen === "function") {
        onOpen();
      }
    } else {
      notification("Access restricted");
    }
  }

  async function onParentCall(index: number, args: IParentCallArgs) {
    console.debug(`vc-app#onParentCall(${index}, { method: ${args.method} }) called.`);

    if (index >= 0) {
      const currentParent = unref(navigationInstance.bladesRefs.value[index]);

      if (currentParent) {
        if (args.method && typeof currentParent.exposed[args.method] === "function") {
          const method = currentParent.exposed[args.method] as (args: unknown) => Promise<unknown>;
          const result = await method(args.args);
          if (typeof args.callback === "function") {
            args.callback(result);
          }
        } else {
          console.error(`No such method: ${args.method}.`);
        }
      }
    }
  }

  function addEntryToLocation(params: string) {
    history.pushState({}, null, "#" + params);
    lastBladeUrl.value = params;
  }

  function findBlade(blade: BladeConstructor) {
    return navigationInstance.blades.value.find((x) => _.isEqual(x.blade, blade));
  }

  async function clearParentData() {
    nextTick(() => {
      parentBladeOptions.value = undefined;
      parentBladeParam.value = undefined;
    });
  }

  return {
    blades: computed(() => navigationInstance.blades.value),
    parentBladeOptions: computed(() => parentBladeOptions.value),
    parentBladeParam: computed(() => parentBladeParam.value),
    bladesRefs: navigationInstance.bladesRefs,
    openBlade,
    closeBlade,
    onParentCall,
  };
}
