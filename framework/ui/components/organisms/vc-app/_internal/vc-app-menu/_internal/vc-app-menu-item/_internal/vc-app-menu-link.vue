<template>
  <div
    class="vc-app-menu-link"
    @click="onMenuItemClick"
  >
    <div
      class="vc-app-menu-link__item"
      :class="[
        {
          'vc-app-menu-link__item_active': isMenuItemActive,
          'vc-app-menu-link__item_no-hover': !children?.length,
          'vc-app-menu-link__item_child-opened': expand && isOpened,
          'vc-app-menu-link__item_collapsed': !expand,
        },
      ]"
    >
      <div
        v-if="icon"
        class="vc-app-menu-link__icon"
      >
        <VcIcon
          class="vc-app-menu-link__icon-content"
          :icon="icon"
          size="m"
        />
      </div>
      <div
        v-if="expand"
        class="vc-app-menu-link__title"
      >
        <div class="vc-app-menu-link__title-truncate">
          {{ title }}
        </div>
        <VcIcon
          v-if="!!children?.length || false"
          class="vc-app-menu-link__title-icon"
          :icon="`fas fa-chevron-${isOpened ? 'up' : 'down'}`"
          size="xs"
        />
      </div>
    </div>
  </div>

  <div
    v-show="isOpened"
    class="vc-app-menu-link__child"
    :class="{
      'vc-app-menu-link__child-collapsed': !expand,
    }"
  >
    <template
      v-for="(nested, i) in children"
      :key="i"
    >
      <router-link
        v-if="$hasAccess(nested.permissions!) && nested.url"
        :to="nested.url"
        custom
      >
        <div
          class="vc-app-menu-link__child-item-link"
          :data-test-id="nested.routeId"
          @click="$emit('onClick', nested)"
        >
          <div
            :key="i"
            :class="[
              {
                'vc-app-menu-link__child-item_active': isActive(nested.url ?? ''),
                'vc-app-menu-link__child-item_collapsed': !expand,
                'vc-app-menu-link__child-item_expanded': expand,
              },
              'vc-app-menu-link__child-item',
            ]"
          >
            <div
              v-if="nested.icon"
              class="vc-app-menu-link__icon"
              :class="{
                'vc-app-menu-link__icon-collapsed': !expand,
              }"
            >
              <VcIcon
                class="vc-app-menu-link__icon-content"
                :icon="nested.icon"
                size="m"
              />
            </div>
            <p
              v-if="expand"
              class="vc-app-menu-link__child-item-title"
            >
              {{ nested.title }}
            </p>
          </div>
        </div>
      </router-link>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed, onMounted } from "vue";
import { MenuItem } from "../../../../../../../../../core/types";
import { VcIcon } from "./../../../../../../../";
import { useRoute } from "vue-router";

export interface Props {
  children?: MenuItem[];
  sticky?: boolean;
  icon: string;
  title?: string;
  url?: string;
  expand?: boolean;
  id?: string | number;
}

export interface Emits {
  (event: "onClick", item?: MenuItem): void;
}

const props = withDefaults(defineProps<Props>(), {
  sticky: true,
});

const emit = defineEmits<Emits>();

const isOpened = ref(false);
const route = useRoute();
const params = Object.fromEntries(Object.entries(route.params).filter(([key]) => key !== "pathMatch"));

const isMenuItemActive = computed(() => isActive(props.url ?? "") && !props.children?.length);

watch(
  () => route.path,
  () => {
    if (props.children && props.children.length && props.children.find((x) => x?.url === route?.path)) {
      isOpened.value = true;
    }
  },
  { immediate: true },
);

function onMenuItemClick() {
  if (!props.children?.length) {
    emit("onClick");
  } else {
    isOpened.value = !isOpened.value;
  }
}

const isActive = (url: string) => {
  if (url) {
    let path = route.path;
    if (Object.values(params).length) {
      path = path.replace(Object.values(params)[0] as string, "");
    }

    const active = path.endsWith(url);

    if (active && props.children?.length) {
      isOpened.value = true;
    }

    return active;
  } else {
    return false;
  }
};

onMounted(() => {
  const storedState = localStorage.getItem(`vc_menu_${props.id}_isOpened`);
  if (storedState) {
    isOpened.value = JSON.parse(storedState);
  }
});

watch(isOpened, (newValue) => {
  localStorage.setItem(`vc_menu_${props.id}_isOpened`, JSON.stringify(newValue));
});
</script>

<style lang="scss">
:root {
  --app-menu-item-height: 36px;
  --app-menu-item-icon-width: 22px;
  --app-menu-item-icon-color: var(--secondary-600);
  --app-menu-item-icon-color-active: var(--additional-50);
  --app-menu-item-background-color-hover: var(--secondary-500);
  --app-menu-item-background-color-active: var(--secondary-600);
  --app-menu-item-hover-radius: 4px;
  --app-menu-item-title-color: var(--base-text-color, var(--neutrals-950));
  --app-menu-item-title-color-active: var(--additional-50);

  --app-menu-item-active-text: var(--base-text-color, var(--neutrals-950));
  --app-menu-item-active-icon: var(--base-text-color, var(--neutrals-950));
}

.vc-app-menu-link {
  @apply tw-cursor-pointer tw-px-5;

  &:hover .vc-app-menu-link__item:not(.vc-app-menu-link__item_active) {
    @apply tw-bg-[var(--app-menu-item-background-color-hover)] tw-bg-opacity-50
      tw-rounded-[var(--app-menu-item-hover-radius)];

    .vc-app-menu-link__title {
      @apply tw-text-[color:var(--app-menu-item-title-color-active)];
    }

    .vc-app-menu-link__icon {
      @apply tw-text-[color:var(--app-menu-item-icon-color-active)];
    }

    .vc-app-menu-link__title-icon {
      @apply tw-text-[color:var(--app-menu-item-icon-color-active)];
    }
  }

  &__item {
    @apply tw-flex tw-items-center tw-w-full tw-h-[var(--app-menu-item-height)]
      tw-border-none tw-flex-nowrap tw-box-border tw-cursor-pointer tw-relative
      tw-uppercase tw-select-none tw-py-1 tw-px-2;

    &_collapsed {
      @apply tw-w-10;
    }

    &_active {
      @apply tw-bg-[color:var(--app-menu-item-background-color-active)]
        tw-rounded-[var(--app-menu-item-hover-radius)]
        before:tw-opacity-100;

      .vc-app-menu-link__icon {
        @apply tw-text-[color:var(--app-menu-item-icon-color-active)];
      }

      .vc-app-menu-link__title {
        @apply tw-font-bold tw-text-[color:var(--app-menu-item-title-color-active)] #{!important};
      }

      .vc-app-menu-link__title-icon {
        @apply tw-text-[color:var(--app-menu-item-icon-color-active)];
      }
    }

    &_child-opened {
      .vc-app-menu-link__title {
        @apply tw-font-bold tw-text-[color:var(--app-menu-item-active-text)] #{!important};
      }

      .vc-app-menu-link__icon {
        @apply tw-text-[color:var(--app-menu-item-active-icon)] #{!important};
      }
    }
  }

  &__icon {
    @apply tw-text-[color:var(--app-menu-item-icon-color)]
    tw-overflow-hidden tw-flex
    tw-justify-center tw-shrink-0 tw-transition-[color] tw-duration-200 tw-w-[var(--app-menu-item-icon-width)];
  }

  &__title {
    @apply tw-capitalize tw-text-[color:var(--app-menu-item-title-color)] tw-truncate
    tw-text-sm
    tw-font-medium
    tw-pl-2
    [transition:color_0.2s_ease]
    tw-opacity-100 tw-w-full tw-flex tw-justify-between tw-items-center;
  }

  &__title-truncate {
    @apply tw-truncate;
  }

  &__title-icon {
    @apply tw-ml-3 tw-text-[color:var(--app-menu-item-icon-color)];
  }

  &__icon-content {
    @apply tw-text-center;
  }

  &__child {
    @apply tw-gap-1 tw-mt-1 tw-flex tw-flex-col;
  }

  &__child-item {
    @apply tw-cursor-pointer tw-min-w-0 tw-flex tw-h-[var(--app-menu-item-height)]
      tw-items-center tw-transition-[padding] tw-duration-150 tw-w-fit tw-py-1 tw-px-2 tw-rounded-[4px]
    tw-text-[color:var(--app-menu-item-title-color)] tw-text-xs
    hover:tw-bg-[var(--app-menu-item-background-color-hover)]
    hover:tw-text-[color:var(--app-menu-item-title-color-active)];

    &_expanded {
      @apply tw-pl-5 tw-w-full #{!important};
    }

    &_collapsed {
      @apply tw-w-10;
    }

    &_active {
      @apply tw-rounded-[var(--app-menu-item-hover-radius)]
      tw-bg-[color:var(--app-menu-item-background-color-active)]
      tw-text-[color:var(--app-menu-item-title-color-active)] tw-font-bold
      hover:tw-bg-[color:var(--app-menu-item-background-color-active)]
      hover:tw-text-[color:var(--app-menu-item-title-color-active)];

      .vc-app-menu-link__icon {
        @apply tw-text-[color:var(--app-menu-item-icon-color-active)];
      }
    }
  }

  &__child-item-title {
    @apply tw-truncate tw-pl-2;
  }

  &__child-item-link {
    @apply tw-cursor-pointer tw-z-[2] tw-px-5;
  }

  &__child-item-link:hover .vc-app-menu-link__child-item:not(.vc-app-menu-link__child-item_active) {
    @apply tw-bg-[var(--app-menu-item-background-color-hover)] tw-bg-opacity-50
      tw-rounded-[var(--app-menu-item-hover-radius)];

    .vc-app-menu-link__icon {
      @apply tw-text-[color:var(--app-menu-item-icon-color-active)];
    }
  }

  &__icon-collapsed {
    @apply tw-p-0;
  }
}
</style>
