<template>
  <button
    class="vc-app-switcher__button"
    @click.stop="toggleAppSwitch"
  >
    <div class="vc-app-switcher__icon"></div>
  </button>
  <Sidebar
    :is-expanded="isVisible"
    render="always"
    position="left"
    @close="onClose"
  >
    <template #header>
      <div
        class="vc-app-switcher__button-wrap"
        :class="{
          'vc-app-switcher__button-wrap--mobile': $isMobile.value,
        }"
      >
        <button
          class="vc-app-switcher__button vc-app-switcher__button--header"
          @click.stop="isVisible = false"
        >
          <div class="vc-app-switcher__icon"></div>
        </button>
        <p class="vc-app-switcher__title">{{ $t("COMPONENTS.APP_SWITCHER.TITLE") }}</p>
      </div>
    </template>
    <template #content>
      <div
        v-if="isVisible && appsList && appsList.length"
        ref="container"
        class="vc-app-switcher"
        @contextmenu.prevent
      >
        <div class="vc-app-switcher__dropdown">
          <ul class="vc-app-switcher__list">
            <li
              v-for="item in appsList"
              :key="item.id"
              class="vc-app-switcher__list-item"
              :class="{
                'vc-app-switcher__list-item--active': locationHandler(item.relativeUrl ?? ''),
              }"
              @click="switchApp(item)"
            >
              <img
                :src="imageUrl(item.iconUrl ?? '')"
                :alt="`icon_${item.id}`"
                class="vc-app-switcher__item-icon"
              />
              <p class="vc-app-switcher__item-title">
                {{ item.title }}
              </p>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </Sidebar>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { AppDescriptor } from "../../../../../core/api/platform";
import { Sidebar } from "./../../../sidebar";

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

const isVisible = ref(false);

const imageUrl = (url: string) => url;

const locationHandler = (url: string) => {
  const cleanUrl = window.location.pathname.replace(/\/+$/, "");
  const match = url.match(cleanUrl);
  if (match) {
    return match[0];
  }
  return null;
};

const switchApp = (app: AppDescriptor) => {
  emit("onClick", app);
  onClose();
};

const toggleAppSwitch = () => {
  if (props.appsList && props.appsList.length) {
    isVisible.value = !isVisible.value;
  }
};

const onClose = () => {
  isVisible.value = false;
};
</script>

<style lang="scss">
:root {
  --app-switcher-button-color: var(--neutrals-400);
  --app-switcher-button-color-hover: var(--neutrals-500);
  --app-switcher-item-text-color: var(--additional-950);
  --app-switcher-dropdown-bg-color: var(--additional-50);
  --app-switcher-dropdown-shadow: 4px 4px 20px rgba(47, 86, 108, 0.25);
  --app-switcher-height: var(--app-bar-height);
  --app-switcher-item-bg-hover: var(--primary-50);
}

.vc-app-switcher {
  @apply tw-relative tw-flex tw-mx-3 tw-shrink-0 tw-mt-4;

  &__button {
    @apply hover:tw-relative tw-p-0 tw-border-0 tw-bg-transparent tw-relative tw-h-full tw-flex tw-items-center tw-justify-center tw-shrink-0 tw-mx-3;

    &:hover .vc-app-switcher__icon {
      @apply tw-bg-[color:var(--app-switcher-button-color-hover)];
    }

    &--header {
      @apply tw-h-auto tw-block tw-mx-0 #{!important};
    }
  }

  &__button-wrap {
    @apply tw-min-h-[--app-switcher-height] tw-px-4 tw-flex tw-items-center tw-justify-between tw-h-[var(--app-switcher-height)] tw-mx-3;

    &--mobile {
      @apply tw-mx-2 #{!important};
    }
  }

  &__title {
    @apply tw-text-lg tw-font-bold tw-text-[color:var(--app-switcher-item-text-color)];
  }

  &__icon {
    @apply tw-h-[22px] tw-w-[22px] tw-bg-[color:var(--app-switcher-button-color)] tw-duration-200;
    mask: url(/assets/app-select.svg) no-repeat center;
    mask-size: contain;
  }

  &__dropdown {
    @apply tw-bg-[color:var(--app-switcher-dropdown-bg-color)] tw-w-full;
  }

  &__list {
    @apply tw-flex tw-flex-col tw-gap-3 tw-overflow-hidden;
  }

  &__list-item {
    @apply tw-p-3 tw-text-sm tw-text-[color:var(--app-switcher-item-text-color)] tw-flex tw-flex-row tw-items-center tw-cursor-pointer tw-w-full;
    transition: background-color 0.2s;

    &--active {
      @apply tw-font-extrabold;
    }

    &:hover .vc-app-switcher__item-title {
      @apply tw-opacity-80;
    }

    &:hover {
      @apply tw-bg-[color:var(--app-switcher-item-bg-hover)];
    }
  }

  &__item-icon {
    @apply tw-w-5 tw-h-5 tw-mr-2 tw-shrink-0;
  }

  &__item-title {
    @apply tw-font-normal tw-text-sm tw-truncate;
    color: var(--app-switcher-item-text-color);
    transition: opacity 0.3s ease;
  }
}
</style>
