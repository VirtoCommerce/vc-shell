<template>
  <div
    v-if="appsList && appsList.length"
    ref="container"
    class="vc-app-switcher"
    @contextmenu.prevent
  >
    <GenericDropdown
      :items="appsList"
      :is-item-active="(item) => locationHandler(item.relativeUrl ?? '')"
      @item-click="switchApp"
    >
      <template #item="{ item }">
        <div class="vc-app-switcher__item">
          <img
            :src="imageUrl(item.iconUrl ?? '')"
            :alt="`icon_${item.id}`"
            class="vc-app-switcher__item-icon"
          />
          <p class="vc-app-switcher__item-title">
            {{ item.title }}
          </p>
        </div>
      </template>
    </GenericDropdown>
  </div>
</template>

<script lang="ts" setup>
import { AppDescriptor } from "../../../../../core/api/platform";
import { GenericDropdown } from "../../../generic-dropdown";

export interface Props {
  appsList: AppDescriptor[];
}

interface Emits {
  (event: "onClick", item: AppDescriptor): void;
}

const props = withDefaults(defineProps<Props>(), {
  appsList: undefined,
});

const emit = defineEmits<Emits>();

const imageUrl = (url: string) => url;

const locationHandler = (url: string) => {
  const cleanUrl = window.location.pathname.replace(/\/+$/, "");
  const match = url.match(cleanUrl);
  if (match) {
    return !!match[0];
  }
  return false;
};

const switchApp = (app: AppDescriptor) => {
  emit("onClick", app);
};
</script>

<style lang="scss">
:root {
  --app-switcher-item-text-color: var(--additional-950);
  --app-switcher-height: var(--app-bar-height);
}

.vc-app-switcher {
  @apply tw-relative tw-flex tw-shrink-0;

  &__item {
    @apply tw-flex tw-items-center tw-w-full tw-p-3 tw-w-full;
  }

  &__item-icon {
    @apply tw-w-5 tw-h-5 tw-mr-2 tw-shrink-0;
  }

  &__item-title {
    @apply tw-font-normal tw-text-sm tw-leading-5 tw-truncate;
    color: var(--app-switcher-item-text-color);
    transition: opacity 0.3s ease;
  }
}
</style>
