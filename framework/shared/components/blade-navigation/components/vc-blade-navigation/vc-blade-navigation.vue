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
import { useTemplateRefsList } from "@vueuse/core";

const { blades, closeBlade, onParentCall } = useBladeNavigation();

const quantity = computed(() => {
  return blades.value.length || 0;
});

const isMobile = inject("isMobile") as Ref<boolean>;

const refs = useTemplateRefsList<HTMLDivElement>();

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
                { key: bladeVNode.type?.name || `blade_${index}`, blade: bladeVNode },
                {
                  default: ({ Component }: { Component: BladeVNode }) =>
                    h(Component, {
                      ref: refs.value.set,
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
                      "onParent:call": (args: IParentCallArgs) => onParentCall(refs.value[index - 1], args),
                      "onVue:before-unmount": reset,
                    }),
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
