<template>
  <div class="tw-w-full tw-flex tw-flex-col tw-grow tw-basis-0">
    <VcBreadcrumbs
      v-if="blades && blades.length > 2"
      :items="breadcrumbs"
      class="tw-bg-white tw-p-2 tw-shadow-[2px_2px_8px_rgba(54,84,117,0.14)] tw-rounded-[var(--blade-border-radius)]"
      :class="[
        {
          'tw-mt-4 tw-mx-2': !$isMobile.value,
          'tw-p-4': $isMobile.value,
        },
      ]"
      variant="light"
      with-arrow
    />
    <render></render>
  </div>
</template>

<script lang="ts" setup>
import { Ref, computed, inject, withDirectives, h, vShow, toRef } from "vue";
import { RouterView } from "vue-router";
import { BladeVNode, IParentCallArgs, useBladeNavigation } from "./../../../../../shared";
import { ErrorInterceptor } from "./../../../error-interceptor";
import VcBreadcrumbs from "./../../../../../ui/components/molecules/vc-breadcrumbs/vc-breadcrumbs.vue";
import { useBreadcrumbs } from "./../../../../../core/composables/useBreadcrumbs";
import { VcBladeView } from "./../vc-blade-view/vc-blade-view";
import { watchDebounced } from "@vueuse/core";

const { blades, closeBlade, onParentCall } = useBladeNavigation();
const { breadcrumbs, push, remove } = useBreadcrumbs();

const quantity = computed(() => {
  return blades.value.length || 0;
});

const isMobile = inject("isMobile") as Ref<boolean>;

watchDebounced(
  blades,
  (newVal) => {
    breadcrumbs.value.forEach((breadcrumb) => breadcrumb && remove([breadcrumb.id]));

    newVal.forEach((blade) => {
      push({
        id: blade.props.navigation.idx.toString(),
        title: toRef(blade.props.navigation.instance ?? { title: "" }, "title"),
        clickHandler: async (id) => {
          const isPrevented = await closeBlade(parseInt(id) + 1);
          return !isPrevented;
        },
      });
    });
  },
  {
    deep: true,
    immediate: true,
    flush: "post",
    debounce: 10,
  },
);

const render = () => {
  if (!blades.value.length) {
    return h(RouterView);
  }
  return h("div", { class: "tw-w-full tw-overflow-hidden tw-flex tw-grow tw-basis-0 tw-relative" }, [
    blades.value.map((bladeVNode, index) => {
      if (bladeVNode.type.isBlade) {
        return h(
          ErrorInterceptor,
          {
            key: index,
            capture: true,
          },
          {
            default: ({
              error,
              reset,
            }: Parameters<InstanceType<typeof ErrorInterceptor>["$slots"]["default"]>["0"]) => {
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
                        "onClose:blade": () => closeBlade(index),
                        "onParent:call": (args: IParentCallArgs) => {
                          const instance = blades.value?.[index - 1]?.props?.navigation?.instance;
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
    }),
  ]);
};
</script>
