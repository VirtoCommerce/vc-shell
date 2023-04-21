<template>
  <ErrorInterceptor
    capture
    v-slot="{ error }"
  >
    <router-view v-slot="{ Component, route }">
      <component
        :is="Component"
        :closable="false"
        v-show="$isMobile.value ? !blades.length : blades.length <= 1"
        @open:blade="onBladeOpen($event, 0)"
        :options="parentBladeOptions"
        :expanded="blades.length === 0"
        :maximized="findStateById(0)"
        :blades="blades"
        :param="resolveParam"
        :key="route"
        :ref="(el: IBladeElement) => setParentRef(el, Component)"
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
        :is="blade.component"
        :param="blade.param"
        :closable="i >= 0"
        :expanded="i === blades.length - 1"
        :maximized="findStateById(blade.idx)"
        :options="blade.bladeOptions"
        @open:blade="onBladeOpen($event, blade.idx)"
        @close:blade="onBladeClose(i)"
        @close:children="$emit('onClose', i + 1)"
        @parent:call="$emit('onParentCall', { id: i, args: $event })"
        @expand:blade="handleMaximizeBlade(blade.idx, true)"
        @collapse:blade="handleMaximizeBlade(blade.idx, false)"
        :ref="(el: IBladeElement) => setBladesRef(el, blade)"
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
import { IBladeContainer, IBladeElement, IBladeEvent, IParentCallArgs, IBladeRef } from "./../../../../../shared";
import { ErrorInterceptor } from "./../../../../../core/plugins/error-interceptor";

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
  parentBladeParam: undefined,
});

const route = useRoute();
const bladesRefs = ref<IBladeRef[]>([]);
const state = ref<(IBladeRef & { expanded: boolean })[]>([]);

const visibleBlades = computed(() => bladesRefs.value.slice(-2));

function handleMaximizeBlade(id: number, expand: boolean) {
  state.value = visibleBlades.value?.map((x: IBladeRef & { expanded: boolean }) => {
    if (x.blade.idx === id) {
      x.expanded = expand;
    }
    return x;
  });
}

function findStateById(id: number) {
  return state.value?.find((item) => item.blade.idx === id)?.expanded;
}

function setParentRef(el: IBladeElement, bladeNode: VNode) {
  if (el && bladeNode) {
    bladesRefs.value = [
      {
        exposed: el,
        blade: {
          component: bladeNode.type as VNode,
          param: bladeNode.props?.param as string,
          idx: 0,
        },
      },
    ];
  }
}

function setBladesRef(el: IBladeElement, blade: IBladeContainer) {
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

function onBladeOpen(event: IBladeEvent, idx: number) {
  state.value = [];
  emit("onOpen", { blade: event, id: idx });
}

const resolveParam = computed(() => {
  return props.parentBladeParam ? props.parentBladeParam : route.params.param;
});

function test(err) {
  throw new Error(err);
}

defineExpose({
  bladesRefs,
});
</script>