import { computed, ref, unref, watch, Ref } from "vue";
import { isEqual } from "lodash-es";
import { useRouter, useRoute } from "vue-router";
import usePermissions from "../usePermissions";
import { BladeComponent } from "@vc-shell/ui";

interface IParentCallArgs {
  method: string;
  args?: unknown;
  callback?: (args: unknown) => void;
}

interface IBladeContainer {
  blade: BladeComponent;
  options: Record<string, unknown>;
  param: string;
  onOpen: () => void;
  onClose: () => void;
  idx: number;
}

interface IUseBladeNavigation {
  readonly blades: Ref<IBladeContainer[]>;
  readonly bladeRefs: Ref<Record<string, unknown>[]>;
  readonly initialBladeOptions: Ref<Record<string, unknown>>;
  readonly initialBladeParam: Ref<string>;
  openBlade: (
    {
      initialBlade,
      component: blade,
      param,
      bladeOptions,
      onOpen,
      onClose,
    }: {
      initialBlade?: BladeComponent;
      component?: BladeComponent;
      param?: string;
      bladeOptions?: Record<string, unknown>;
      onOpen?: () => void;
      onClose?: () => void;
    },
    index?: number
  ) => void;
  closeBlade: (index: number) => void;
  onParentCall: (index: number, args: IParentCallArgs) => void;
}

const blades = ref<IBladeContainer[]>([]);
const bladeRefs = ref([]);
const initialBladeOptions = ref<Record<string, unknown>>();
const initialBladeParam = ref<string>();

export default (): IUseBladeNavigation => {
  const router = useRouter();
  const route = useRoute();
  const { checkPermission } = usePermissions();

  watch(
    () => blades.value,
    (newVal) => {
      const lastBlade = newVal[newVal.length - 1];

      if (lastBlade && lastBlade.blade.url) {
        if (lastBlade.param) {
          addEntryToLocation(lastBlade.blade.url + "/" + lastBlade.param);
        } else {
          addEntryToLocation(lastBlade.blade.url);
        }
      } else if (!lastBlade) {
        addEntryToLocation(route.path);
      }
    },
    { deep: true }
  );

  async function openBlade(
    {
      initialBlade,
      component: blade,
      param,
      bladeOptions,
      onOpen,
      onClose,
    }: {
      initialBlade?: BladeComponent;
      component?: BladeComponent;
      param?: string;
      bladeOptions?: Record<string, unknown>;
      onOpen?: () => void;
      onClose?: () => void;
    },
    index?: number
  ) {
    console.debug(`openBlade(${1}) called.`);

    const parent = unref(initialBlade);
    const child = unref(blade);
    const existingChild = findBlade(child);

    if (parent && parent.url) {
      await closeBlade(0);
      await router.push(parent.url);
      initialBladeOptions.value = bladeOptions;
    }

    if (child) {
      if (existingChild === undefined) {
        child.idx = index + 1;
      } else if (existingChild) {
        await closeBlade(
          blades.value.findIndex((x) => x.idx === existingChild.idx)
        );
        child.idx = existingChild.idx;
      }

      addBlade(child, param, bladeOptions, onOpen, onClose, index);
    }
  }

  async function closeBlade(index: number) {
    if (index < blades.value.length) {
      const children = blades.value.slice(index).reverse();

      let isPrevented = false;
      for (let i = 0; i < children.length; i++) {
        if (
          children[i]?.blade.onBeforeClose &&
          typeof children[i].blade.onBeforeClose === "function"
        ) {
          const result = await children[i].blade.onBeforeClose();
          if (result === false) {
            isPrevented = true;
            break;
          }
        }
      }
      if (!isPrevented) {
        if (typeof blades.value[index]?.onClose === "function") {
          blades.value[index]?.onClose?.();
        }
        blades.value.splice(index);
      } else {
        throw "Closing prevented";
      }
    }
  }

  async function addBlade(
    blade: BladeComponent,
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
        blade,
        options: bladeOptions,
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
    console.debug(
      `vc-app#onParentCall(${index}, { method: ${args.method} }) called.`
    );
    if (index >= 0) {
      const previous = blades.value[index - 1];
      const currentParent = previous
        ? previous
        : unref(bladeRefs.value[bladeRefs.value.length - 1]);

      if (currentParent) {
        if (args.method && typeof currentParent[args.method] === "function") {
          const method = currentParent[args.method] as (
            args: unknown
          ) => Promise<unknown>;
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

  function findBlade(blade: BladeComponent) {
    return blades.value.find((x) => isEqual(x.blade, blade));
  }

  return {
    blades: computed(() => blades.value),
    bladeRefs: computed(() => bladeRefs.value),
    initialBladeOptions: computed(() => initialBladeOptions.value),
    initialBladeParam: computed(() => initialBladeParam.value),
    openBlade,
    closeBlade,
    onParentCall,
  };
};
