<template>
  <VcButton
    variant="secondary"
    class="vc-external-provider"
    @click="$emit('signIn')"
  >
    <div class="tw-flex tw-flex-row tw-items-center tw-gap-2">
      <VcImage
        :src="processedLogo"
        class="vc-external-provider__icon"
        size="xxs"
      />{{ displayName }}
    </div>
  </VcButton>
</template>

<script lang="ts" setup>
import { VcButton, VcImage } from "@ui/components";
import { computed } from "vue";

export interface Props {
  logo: string | undefined;
  displayName: string | undefined;
  authenticationType: string | undefined;
}

export interface Emits {
  (event: "signIn"): void;
}

const props = defineProps<Props>();
defineEmits<Emits>();

const processedLogo = computed(() => {
  if (props.logo && !props.logo.startsWith("data:image") && !props.logo.startsWith("http")) {
    return new URL(props.logo, window.location.origin).toString();
  }
  return props.logo;
});
</script>

<style lang="scss">
.vc-external-provider {
  &__icon {
    @apply tw-flex-shrink-0;
  }
}
</style>
