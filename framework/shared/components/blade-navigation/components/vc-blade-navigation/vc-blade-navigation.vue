<template>
  <div class="tw-w-full tw-flex tw-flex-col tw-grow tw-basis-0">
    <VcBreadcrumbs
      v-if="blades && blades.length > 2"
      :items="breadcrumbs"
      class="tw-bg-[--blade-navigation-bg-color] tw-p-2"
      :class="[
        {
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
import { Ref, computed, inject, withDirectives, h, vShow, toRef, VNode, nextTick, provide } from "vue";
import { RouterView, useRoute } from "vue-router";
import { BladeVNode, IParentCallArgs, useBladeNavigation } from "./../../../../../shared";
import { ErrorInterceptor } from "./../../../error-interceptor";
import VcBreadcrumbs from "./../../../../../ui/components/molecules/vc-breadcrumbs/vc-breadcrumbs.vue";
import { useBreadcrumbs } from "./../../../../../core/composables/useBreadcrumbs";
import { VcBladeView } from "./../vc-blade-view/vc-blade-view";
import { watchDebounced } from "@vueuse/core";

const { blades, closeBlade, onParentCall } = useBladeNavigation();
const { breadcrumbs, push, remove } = useBreadcrumbs();
const route = useRoute();

const quantity = computed(() => {
  return (
    blades.value.filter((x) => x.props.navigation.isVisible || typeof x.props.navigation.isVisible === "undefined")
      .length || 0
  );
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
          if (blade.props.navigation.isVisible === false) {
            blade.props.navigation.isVisible = true;
          }
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
  if (!(route.matched[1].components?.default as BladeVNode)?.type?.isBlade) {
    return h(RouterView);
  }

  return h("div", { class: "tw-w-full tw-overflow-hidden tw-flex tw-grow tw-basis-0 tw-relative" }, [
    blades.value?.reduce(
      (arr, bladeVNode, index) => {
        if (bladeVNode.type.isBlade) {
          const hiddenQuantity = blades.value.filter(
            (x) => x.props.navigation.isVisible === false && x.props.navigation.idx < index,
          ).length;
          arr.push(
            h(
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
                      {
                        key: `${bladeVNode.type?.name}_${index}` || `blade_${index}`,
                        blade: bladeVNode,
                        expandable: quantity.value > 1,
                        error,
                      },
                      {
                        default: ({ Component }: { Component: BladeVNode }) => {
                          return h(Component, {
                            closable: index >= 1,
                            expanded: index - hiddenQuantity === quantity.value - 1,
                            "onClose:blade": () => {
                              if (index === 0) return;
                              closeBlade(index);
                            },
                            "onParent:call": async (args: IParentCallArgs) => {
                              await nextTick(() => {
                                const instance = blades.value?.[index - 1]?.props?.navigation?.instance;
                                if (instance) onParentCall(instance, args);
                              });
                            },
                            onVnodeUnmounted: reset,
                          });
                        },
                      },
                    ),

                    [
                      [
                        vShow,
                        (bladeVNode.props.navigation.isVisible ||
                          typeof bladeVNode.props.navigation.isVisible === "undefined") &&
                          index >= quantity.value - (isMobile.value ? 1 : 2),
                      ],
                    ],
                  );
                },
              },
            ),
          );
        }

        return arr;
      },
      [] as unknown as VNode[],
    ),
  ]);
};
</script>

<style lang="scss">
:root {
  --blade-navigation-bg-color: var(--additional-50);
  --blade-navigation-shadow-color: var(--additional-950);
  --blade-navigation-shadow: 2px 2px 8px rgb(from var(--blade-navigation-shadow-color) r g b / 7%);
  --blade-navigation-border-radius: var(--blade-border-radius);
}
</style>
