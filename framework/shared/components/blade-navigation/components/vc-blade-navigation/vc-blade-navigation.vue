<template>
  <div class="tw-w-full tw-overflow-hidden tw-flex tw-grow tw-basis-0 tw-relative">
    <render></render>
  </div>
</template>

<script lang="ts" setup>
import { Ref, computed, inject, withDirectives, h, vShow } from "vue";
import { RouterView } from "vue-router";
import { BladeVNode, IParentCallArgs, useBladeNavigation } from "./../../../../../shared";
import { ErrorInterceptor } from "./../../../error-interceptor";
import { VcBladeView } from "./../vc-blade-view/vc-blade-view";

const { blades, closeBlade, onParentCall } = useBladeNavigation();

const quantity = computed(() => {
  return blades.value.length || 0;
});

const isMobile = inject("isMobile") as Ref<boolean>;

const render = () => {
  if (!blades.value.length) {
    return h(RouterView);
  }
  return blades.value.map((bladeVNode, index) => {
    if (bladeVNode.type.isBlade) {
      return h(
        ErrorInterceptor,
        {
          key: index,
          capture: true,
        },
        {
          default: ({ error, reset }: Parameters<InstanceType<typeof ErrorInterceptor>["$slots"]["default"]>["0"]) => {
            return withDirectives(
              h(
                VcBladeView,
                { key: `${bladeVNode.type?.name}_${index}` || `blade_${index}`, blade: bladeVNode },
                {
                  default: ({ Component }: { Component: BladeVNode }) => {
                    return h(Component, {
                      error,
                      closable: index >= 1,
                      expandable: quantity.value > 1,
                      expanded: index === quantity.value - 1,
                      "onUpdate:expanded": (value: boolean) => {
                        if (value) {
                          closeBlade(index + 1);
                        }
                      },
                      "onClose:blade": () => closeBlade(index),
                      "onParent:call": (args: IParentCallArgs) => {
                        const instance = blades.value?.[index - 1]?.props?.navigation?.instance.value;
                        if (instance) onParentCall(instance, args);
                      },
                      onVnodeUnmounted: reset,
                    });
                  },
                },
              ),

              [[vShow, index >= quantity.value - (isMobile.value ? 1 : 2)]],
            );
          },
        },
      );
    }
  });
};
</script>
