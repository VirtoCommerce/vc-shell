<template>
  <router-view v-slot="{ Component, route }">
    <component
      :is="Component"
      :closable="false"
      v-show="$isMobile.value ? !blades.length : blades.length <= 1"
      @open="openBlade($event, 0)"
      :ref="setBladeRef"
      :options="initialBladeOptions"
      :param="resolveParam"
      :key="route"
    >
    </component>
  </router-view>
  <component
    v-for="(blade, i) in blades"
    v-show="i >= blades.length - ($isMobile.value ? 1 : 2)"
    :key="`blade_${i}`"
    :is="blade.blade"
    :param="blade.param"
    :closable="i >= 0"
    :expanded="i === blades.length - 1"
    :options="blade.options"
    @open="openBlade($event, blade.idx)"
    @close="closeBlade(i)"
    @close:children="closeBlade(i + 1)"
    @parent:call="onParentCall(i, $event)"
    :ref="setBladeRef"
  ></component>
</template>

<script lang="ts" setup>
import useBladeNavigation from "@vc-shell/core/src/composables/useBladeNavigation/index";
import { onBeforeUpdate, ComponentPublicInstance, computed } from "vue";
import { useRoute } from "vue-router";

interface BladeElement extends ComponentPublicInstance {
  onBeforeClose: () => Promise<boolean>;
  [x: string]: unknown;
}

const {
  blades,
  bladeRefs,
  initialBladeOptions,
  initialBladeParam,
  openBlade,
  closeBlade,
  onParentCall,
} = useBladeNavigation();

const route = useRoute();

onBeforeUpdate(() => {
  bladeRefs.value = [];
});

const resolveParam = computed(() => {
  return initialBladeParam.value ? initialBladeParam.value : route.params.param;
});

const setBladeRef = (el: BladeElement) => {
  if (el && Object.keys(el).length) {
    bladeRefs.value.push(el);
  }
};
</script>
