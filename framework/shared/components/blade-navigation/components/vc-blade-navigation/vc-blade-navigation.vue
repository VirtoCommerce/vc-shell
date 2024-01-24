<template>
  <div class="tw-w-full tw-overflow-hidden tw-flex tw-grow tw-basis-0 tw-relative">
    <ErrorInterceptor
      v-for="(bladeVNode, index) in blades"
      v-slot="{ error, reset }"
      :key="index"
      capture
    >
      <router-view v-show="index >= quantity - ($isMobile.value ? 1 : 2)">
        <VcBladeView
          v-slot="{ Component }"
          :key="bladeVNode.type?.name || `blade_${index}`"
          :blade="bladeVNode"
        >
          <component
            :is="Component"
            :ref="refs.set"
            :error="error"
            :closable="index >= 1"
            :expandable="quantity > 1"
            :expanded="index === quantity - 1"
            @close:blade="closeBlade(index)"
            @parent:call="onParentCall(refs[index - 1], $event)"
            @vue:before-unmount="reset"
          >
          </component>
        </VcBladeView>
      </router-view>
    </ErrorInterceptor>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { RouterView } from "vue-router";
import { useBladeNavigation } from "./../../../../../shared";
import { ErrorInterceptor } from "./../../../error-interceptor";
import { VcBladeView } from "./../vc-blade-view/vc-blade-view";
import { useTemplateRefsList } from "@vueuse/core";

const { blades, closeBlade, onParentCall } = useBladeNavigation();

const quantity = computed(() => {
  return blades.value.length || 0;
});

const refs = useTemplateRefsList<HTMLDivElement>();
</script>
