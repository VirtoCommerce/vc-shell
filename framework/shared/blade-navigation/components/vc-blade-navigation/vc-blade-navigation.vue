<template>
  <router-view v-slot="{ Component, route }">
    <component
      :is="Component"
      :closable="false"
      v-show="$isMobile.value ? !blades.length : blades.length <= 1"
      @open:blade="$emit('onOpen', { blade: $event, id: 0 })"
      :options="parentBladeOptions"
      :param="resolveParam"
      :key="route"
      ref="parentRef"
    >
    </component>
  </router-view>
  <component
    v-for="(blade, i) in blades"
    v-show="i >= blades.length - ($isMobile.value ? 1 : 2)"
    :key="`blade_${i}`"
    :is="blade.component"
    :param="blade.param"
    :closable="i >= 0"
    :expanded="i === blades.length - 1"
    :options="blade.bladeOptions"
    @open:blade="$emit('onOpen', { blade: $event, id: blade.idx })"
    @close:blade="$emit('onClose', i)"
    @close:children="$emit('onClose', i + 1)"
    @parent:call="$emit('onParentCall', { id: i, cb: $event })"
    :ref="setBladesRef"
  ></component>
</template>

<script lang="ts" setup>
import { computed, onBeforeUpdate, ref } from "vue";
import { useRoute } from "vue-router";
import {
  IBladeContainer,
  IBladeElement,
  IBladeEvent,
  IParentCallArgs,
} from "@shared";

export interface Props {
  blades: IBladeContainer[];
  parentBladeOptions: Record<string, unknown>;
  parentBladeParam: string;
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
  parentBladeParam: "",
});

const route = useRoute();
const bladesRefs = ref([]);
const parentRef = ref();

onBeforeUpdate(() => {
  bladesRefs.value = [parentRef.value];
});

const setBladesRef = (el: IBladeElement) => {
  if (el && Object.keys(el).length) {
    bladesRefs.value.push(el);
  }
};

const resolveParam = computed(() => {
  return props.parentBladeParam ? props.parentBladeParam : route.params.param;
});

defineExpose({
  bladesRefs,
});
</script>
