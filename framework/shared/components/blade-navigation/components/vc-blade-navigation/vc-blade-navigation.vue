<template>
  <div class="tw-w-full tw-overflow-hidden tw-flex tw-grow tw-basis-0 tw-relative">
    <ErrorInterceptor
      v-for="(blade, key, index) in blades?.components"
      v-slot="{ error, reset }"
      :key="key"
      capture
    >
      <router-view
        v-show="index >= quantity - ($isMobile.value ? 1 : 2)"
        v-slot="{ Component }"
        :key="key"
        :name="key"
      >
        <VcBladeView
          v-slot="{ blade }"
          :key="blade.type?.name || key"
          :blade="Component"
          :name="key"
          :idx="index"
        >
          <component
            :is="blade"
            :ref="refs.set"
            :key="blade.props.navigation?.uniqueRouteKey ?? 0"
            :error="error"
            :closable="index >= 1"
            :expandable="Object.keys(blades?.components || {}).length > 1"
            :expanded="index === Object.keys(blades?.components || {}).length - 1"
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
import { useRouter } from "vue-router";
import { useBladeNavigation } from "./../../../../../shared";
import { ErrorInterceptor } from "./../../../error-interceptor";
import { VcBladeView } from "./../vc-blade-view/vc-blade-view";
import { useTemplateRefsList } from "@vueuse/core";

const { blades, closeBlade, onParentCall } = useBladeNavigation();

const router = useRouter();

const quantity = computed(() => {
  return (
    (router.currentRoute.value.matched[1]?.components &&
      Object.keys(router.currentRoute.value.matched[1].components).length) ||
    0
  );
});

const refs = useTemplateRefsList<HTMLDivElement>();
</script>
