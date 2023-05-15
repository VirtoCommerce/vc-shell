<template>
  <ErrorInterceptor
    capture
    v-slot="{ error, reset }"
  >
    <router-view
      @vue:before-unmount="reset"
      v-slot="{ Component, route }: { Component: any, route: any }"
      :key="route.path"
    >
      <component
        :is="Component"
        :closable="false"
        v-show="$isMobile.value ? !blades.length : blades.length <= 1"
        :options="parentBladeOptions"
        :expanded="blades.length === 0"
        :maximized="findStateById(0)"
        :blades="blades"
        :param="resolveParam"
        :key="route.path"
        :ref="(el: CoreBladeExposed) => setParentRef(el, Component)"
        @expand:blade="handleMaximizeBlade(0, true)"
        @collapse:blade="handleMaximizeBlade(0, false)"
      >
        <template
          v-slot:error
          v-if="error"
          >{{ error }}</template
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
        v-show="i >= blades.length - ($isMobile.value ? 1 : 2)"
        :is="blade.blade"
        :param="blade.param"
        :closable="i >= 0"
        :expanded="i === blades.length - 1"
        :maximized="findStateById(blade.idx)"
        :options="blade.options"
        @close:blade="onBladeClose(i)"
        @close:children="$emit('onClose', i + 1)"
        @parent:call="$emit('onParentCall', { id: i, args: $event })"
        @expand:blade="handleMaximizeBlade(blade.idx, true)"
        @collapse:blade="handleMaximizeBlade(blade.idx, false)"
        :ref="(el: CoreBladeExposed) => setBladesRef(el, blade)"
      >
        <template
          v-slot:error
          v-if="error"
          >{{ error }}</template
        >
      </component>
    </ErrorInterceptor>
  </template>
</template>

<script lang="ts" setup>
import { computed, ref, VNode } from "vue";
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

export interface Props {
  blades: IBladeContainer[];
  parentBladeOptions: Record<string, unknown>;
  parentBladeParam?: string | undefined;
}

export interface Emits {
  (event: "onOpen", blade: { blade: IBladeEvent; id: number }): void;
  (event: "onClose", index: number): void;
  (event: "onParentCall", args: { id: number; args: IParentCallArgs }): void;
}

const emit = defineEmits<Emits>();

const props = withDefaults(defineProps<Props>(), {
  blades: () => [],
  parentBladeOptions: () => ({}),
});

const route = useRoute();
const bladesRefs = ref<IBladeRef[]>([]);
const state = ref<IBladeRef[]>([]);

const visibleBlades = computed(() => bladesRefs.value.slice(-2));

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
      bladesRefs.value.push({ exposed: el, blade });
    }
  }
}

function onBladeClose(index: number) {
  emit("onClose", index);
}

const resolveParam = computed(() => {
  return props.parentBladeParam ? props.parentBladeParam : route.params.param;
});

defineExpose({
  bladesRefs,
});
</script>
