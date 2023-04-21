import { computed, ref, unref, watch, Ref, shallowRef } from "vue";
import * as _ from "lodash-es";
import { useRouter, useRoute, NavigationFailure } from "vue-router";
import { usePermissions } from "../../../../../core/composables";
import { ExtendedComponent, IBladeContainer, IBladeRef, IBladeEvent, IParentCallArgs } from "../../../..";

interface IUseBladeNavigation {
  readonly blades: Ref<IBladeContainer[]>;
  readonly parentBladeOptions: Ref<Record<string, unknown>>;
  readonly parentBladeParam: Ref<string>;
  bladesRefs: Ref<IBladeRef[]>;
  openBlade: (
    { parentBlade, component, param, bladeOptions, onOpen, onClose }: IBladeEvent,
    index?: number,
    navigationCb?: () => Promise<void | NavigationFailure>
  ) => void;
  closeBlade: (index: number) => void;
  onParentCall: (index: number, args: IParentCallArgs) => void;
}

const blades: Ref<IBladeContainer[]> = ref([]);
const bladesRefs: Ref<IBladeRef[]> = ref([]);
const parentBladeOptions: Ref<Record<string, unknown>> = ref();
const parentBladeParam: Ref<string> = ref();

export function useBladeNavigation(): IUseBladeNavigation {
  const router = useRouter();
  const route = useRoute();
  const { checkPermission } = usePermissions();
  const isPrevented = ref(false);

  watch(
    () => blades.value,
    (newVal) => {
      const lastBlade = newVal[newVal.length - 1];

      if (lastBlade && lastBlade.component.url) {
        if (lastBlade.param) {
          addEntryToLocation(lastBlade.component.url + "/" + lastBlade.param);
        } else {
          addEntryToLocation(lastBlade.component.url);
        }
      } else if (!lastBlade) {
        addEntryToLocation(route.path);
      }
    },
    { deep: true }
  );

  async function openBlade(
    { parentBlade, component: blade, param, bladeOptions, onOpen, onClose }: IBladeEvent,
    index?: number,
    navigationCb?: () => Promise<void | NavigationFailure>
  ) {
    console.debug(`openBlade called.`);

    const parent = unref(parentBlade);
    const child = unref(blade);
    const existingChild = findBlade(child);

    if (parent && parent.url) {
      await closeBlade(0);

      if (!isPrevented.value) {
        parentBladeOptions.value = unref(bladeOptions);
        parentBladeParam.value = unref(param);
        if (navigationCb && typeof navigationCb === "function") {
          try {
            await navigationCb();
          } catch (e) {
            console.log(e);
          } finally {
            console.debug(`Navigated to: ${parent.url}`);
          }
        } else if (!navigationCb) {
          await router.push(parent.url);
        }
      }
    }

    if (child) {
      if (existingChild === undefined) {
        child.idx = index + 1;
      } else if (existingChild) {
        await closeBlade(blades.value.findIndex((x) => x.idx === existingChild.idx));
        child.idx = existingChild.idx;
      }

      await addBlade(child, param, bladeOptions, onOpen, onClose, index);
    }
  }

  async function closeBlade(index: number) {
    const refsIndex = index + 1;
    if (refsIndex < bladesRefs.value.length) {
      const children = bladesRefs.value.slice(refsIndex).reverse();

      isPrevented.value = false;
      for (let i = 0; i < children.length; i++) {
        if (children[i]?.exposed.onBeforeClose && typeof children[i].exposed.onBeforeClose === "function") {
          const result = await children[i].exposed.onBeforeClose();
          if (result === false) {
            isPrevented.value = true;
            break;
          }
        }
      }
      if (!isPrevented.value) {
        if (typeof blades.value[index]?.onClose === "function") {
          blades.value[index]?.onClose?.();
        }
        blades.value.splice(index);
      }
    }
  }

  async function addBlade(
    blade: ExtendedComponent,
    param: string,
    bladeOptions: Record<string, unknown>,
    onOpen: () => void,
    onClose: () => void,
    index: number
  ) {
    if (blades.value.length > index) {
      await closeBlade(index);
    }

    if (blade && checkPermission(blade.permissions)) {
      blades.value.push({
        component: shallowRef(blade),
        bladeOptions,
        param,
        onOpen,
        onClose,
        idx: blade.idx,
      });

      if (onOpen && typeof onOpen === "function") {
        onOpen();
      }
    } else {
      // TODO temporary access alert
      alert("Access restricted");
    }
  }

  async function onParentCall(index: number, args: IParentCallArgs) {
    console.debug(`vc-app#onParentCall(${index}, { method: ${args.method} }) called.`);

    if (index >= 0) {
      const currentParent = unref(bladesRefs.value[index]);

      if (currentParent) {
        if (args.method && typeof currentParent.exposed[args.method] === "function") {
          const method = currentParent.exposed[args.method] as (args: unknown) => Promise<unknown>;
          const result = await method(args.args);
          if (typeof args.callback === "function") {
            args.callback(result);
          }
        } else {
          // TODO temporary alert
          console.error(`No such method: ${args.method}.`);
        }
      }
    }
  }

  function addEntryToLocation(params: string) {
    history.pushState({}, null, "#" + params);
  }

  function findBlade(blade: ExtendedComponent) {
    return blades.value.find((x) => _.isEqual(x.component, blade));
  }

  return {
    blades: computed(() => blades.value),
    parentBladeOptions: computed(() => parentBladeOptions.value),
    parentBladeParam: computed(() => parentBladeParam.value),
    bladesRefs,
    openBlade,
    closeBlade,
    onParentCall,
  };
}