<template>
  <VcBreadcrumbs
    v-on-click-outside="hideBreadcrumbs"
    :items="breadcrumbs"
  >
    <template #trigger="{ click }">
      <OnLongPress
        as="button"
        @trigger="click"
      >
        <VcButton
          ref="buttonRef"
          icon="material-arrow_back"
          icon-class="tw-text-neutrals-500"
          icon-size="l"
          text
          @click="onClick"
          @contextmenu.prevent
        />
      </OnLongPress>
    </template>
  </VcBreadcrumbs>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { onLongPress } from "@vueuse/core";
import { VcButton } from "@ui/components";
import VcBreadcrumbs from "@ui/components/molecules/vc-breadcrumbs/vc-breadcrumbs.vue";
import type { Breadcrumbs } from "@ui/types";
import { OnLongPress, vOnClickOutside } from "@vueuse/components";

const props = defineProps<{
  breadcrumbs: Breadcrumbs[];
  onBack: () => void;
}>();

const buttonRef = ref<HTMLElement>();
const showBreadcrumbs = ref(false);

const onClick = () => {
  props.onBack();
};

onLongPress(
  buttonRef,
  () => {
    showBreadcrumbs.value = true;
  },
  { delay: 500 },
);

const hideBreadcrumbs = () => {
  showBreadcrumbs.value = false;
};
</script>

<style lang="scss">
.vc-mobile-back-button {
  position: relative;

  &__breadcrumbs {
    position: fixed;
    z-index: 1000;
    background: var(--additional-50);
    border-radius: var(--blade-navigation-border-radius);
    box-shadow: var(--blade-navigation-shadow);
    padding: 0.5rem;

    &-button {
      &--active {
        background-color: var(--neutrals-100);
      }
    }
  }
}
</style>
