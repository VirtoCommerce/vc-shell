<template>
  <ErrorInterceptor
    v-slot="{ error, reset }"
    capture
  >
    <router-view
      v-slot="{ Component }"
      :key="route.path"
      @vue:before-unmount="reset"
    >
      <component
        :is="Component"
        v-show="$isMobile.value ? !blades.length : blades.length <= 1"
        :key="route.path"
        :ref="(el: CoreBladeExposed) => setParentRef(el, Component)"
        v-element-hover="
          (state) => {
            setActiveBlade(state, Component.type as Component);
          }
        "
        :closable="false"
        :options="workspaceOptions"
        :expanded="blades.length === 0"
        :maximized="findStateById(0)"
        :blades="blades"
        :param="workspaceParam"
        :error="error"
        @expand:blade="handleMaximizeBlade(0, true)"
        @collapse:blade="handleMaximizeBlade(0, false)"
      >
      </component>
    </router-view>
  </ErrorInterceptor>

  <template
    v-for="(blade, i) in blades"
    :key="`blade_${i + 1}`"
  >
    <ErrorInterceptor
      v-slot="{ error }"
      capture
    >
      <component
        :is="blade.blade"
        v-show="i >= blades.length - ($isMobile.value ? 1 : 2)"
        :ref="(el: CoreBladeExposed) => setBladesRef(el, blade)"
        v-element-hover="
          (state) => {
            setActiveBlade(state, blade.blade);
          }
        "
        :param="blade.param"
        :closable="i >= 0"
        :expanded="i === blades.length - 1"
        :maximized="findStateById(blade.idx)"
        :options="blade.options"
        :error="error"
        :blades="blades"
        :model="blade.model"
        @close:blade="onBladeClose(i)"
        @close:children="$emit('onClose', i + 1)"
        @parent:call="$emit('onParentCall', { id: i, args: $event })"
        @expand:blade="handleMaximizeBlade(blade.idx, true)"
        @collapse:blade="handleMaximizeBlade(blade.idx, false)"
      >
      </component>
    </ErrorInterceptor>
  </template>
</template>

<script lang="ts" setup>
import { computed, ref, VNode } from "vue";
import type { Component } from "vue";
import { useRoute } from "vue-router";
import {
  IBladeContainer,
  CoreBladeExposed,
  IBladeEvent,
  IParentCallArgs,
  IBladeRef,
  BladeConstructor,
} from "./../../../../../shared";
import { ErrorInterceptor } from "./../../../error-interceptor";
import { vElementHover } from "@vueuse/components";
import * as _ from "lodash-es";

export interface Props {
  blades: IBladeContainer[];
  workspaceOptions?: Record<string, unknown>;
  workspaceParam?: string;
}

export interface Emits {
  (event: "onOpen", blade: { blade: IBladeEvent; id: number }): void;
  (event: "onClose", index: number): void;
  (event: "onParentCall", args: { id: number; args: IParentCallArgs }): void;
}

const activeBlade = ref();

const emit = defineEmits<Emits>();

withDefaults(defineProps<Props>(), {
  blades: () => [],
  workspaceOptions: () => ({}),
});

const route = useRoute();
const bladesRefs = ref<IBladeRef[]>([]);
const state = ref<IBladeRef[]>([]);

const visibleBlades = computed(() => bladesRefs.value.slice(-2));

const setActiveBlade = (state: boolean, el: Component) => {
  const blade = bladesRefs.value.find((item) => _.isEqual(item.blade.blade, el));
  if (blade) {
    if (state) {
      activeBlade.value = el;
      Object.assign(blade, { active: true });
    } else {
      activeBlade.value = undefined;
      Object.assign(blade, { active: false });
    }
  }
};

function handleMaximizeBlade(id: number, expand: boolean) {
  state.value = visibleBlades.value?.map((x: IBladeRef) => {
    if (x.blade.idx === id) {
      x.expanded = expand;
    }
    return x;
  });
}

function findStateById(id: number) {
  return state.value?.find((item) => item.blade.idx === id)?.expanded;
}

function setParentRef(el: CoreBladeExposed, bladeNode: VNode) {
  if (el && bladeNode) {
    bladesRefs.value = [
      {
        active: _.isEqual(activeBlade.value, bladeNode.type),
        exposed: el,
        blade: {
          blade: bladeNode.type as BladeConstructor,
          param: bladeNode.props?.param as string,
          idx: 0,
        },
      },
    ];
  }
}

function setBladesRef(el: CoreBladeExposed, blade: IBladeContainer) {
  if (el && el !== null && blade) {
    const isExists = bladesRefs.value.some((item) => item.blade.idx === blade.idx);
    if (!isExists) {
      bladesRefs.value.push({ active: _.isEqual(activeBlade.value, blade), exposed: el, blade });
    }
  }
}

function onBladeClose(index: number) {
  emit("onClose", index);
}

defineExpose({
  bladesRefs,
});
</script>
