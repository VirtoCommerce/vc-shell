<template>
  <div
    class="vc-app-menu-link"
    @click="onMenuItemClick"
  >
    <VcTooltip>
      <template
        v-if="!expand"
        #tooltip
        >{{ title }}</template
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
          v-if="!expand && !icon"
          class="vc-app-menu-link__icon-letters"
        >
          {{ twoLettersTitle(title) }}
        </div>

        <Transition name="opacity">
          <div
            v-show="expand"
            class="vc-app-menu-link__title"
          >
            <div class="vc-app-menu-link__title-truncate">
              {{ title }}
            </div>
            <div
              v-if="(!!children?.length && expand) || false"
              class="vc-app-menu-link__title-icon"
            >
              <VcIcon
                class="vc-app-menu-item__title-icon"
                :icon="isOpened ? ChevronUpIcon : ChevronDownIcon"
                size="m"
              ></VcIcon>
            </div>
          </div>
        </Transition>
      </div>
    </VcTooltip>
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
      <VcTooltip>
        <template
          v-if="!expand"
          #tooltip
          >{{ nested.title }}</template
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
                class="vc-app-menu-link__icon vc-app-menu-link__icon--child"
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
              <div
                v-if="!expand && !nested.icon"
                class="vc-app-menu-link__icon-letters"
              >
                {{ twoLettersTitle(nested.title) }}
              </div>
              <Transition name="opacity">
                <p
                  v-show="expand"
                  class="vc-app-menu-link__child-item-title"
                  :class="{
                    'vc-app-menu-link__child-item-title--no-icon': !nested.icon,
                  }"
                >
                  {{ nested.title }}
                </p>
              </Transition>
            </div>
          </div>
        </router-link>
      </VcTooltip>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed, onMounted, Component, MaybeRef, unref } from "vue";
import { MenuItem } from "./../../../../../../../../../core/types";
import { VcIcon } from "./../../../../../../../";
import { useRoute } from "vue-router";
import ChevronUpIcon from "./../../../../../../../atoms/vc-icon/icons/ChevronUpIcon.vue";
import ChevronDownIcon from "./../../../../../../../atoms/vc-icon/icons/ChevronDownIcon.vue";

export interface Props {
  children?: MenuItem[];
  sticky?: boolean;
  icon: string | Component;
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

const twoLettersTitle = (title: MaybeRef<string> | undefined) => {
  // get first letters in title words and combine them. Two letters maximum
  return unref(title)
    ?.split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("");
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
  --app-menu-item-height: 38px;
  --app-menu-item-icon-width: 16px;
  --app-menu-item-icon-width-container: 23px;
  --app-menu-item-icon-color: var(--neutrals-600);
  --app-menu-item-icon-color-active: var(--primary-700);
  --app-menu-item-background-color-hover: var(--neutrals-100);
  --app-menu-item-background-color-active: var(--primary-100);
  --app-menu-item-hover-radius: 6px;
  --app-menu-item-title-color: var(--neutrals-600);
  --app-menu-item-title-color-active: var(--primary-700);

  --app-menu-item-active-text: var(--neutrals-950);
  --app-menu-item-active-icon: var(--neutrals-950);
}

.vc-app-menu-link {
  @apply tw-cursor-pointer tw-w-full;
  @apply tw-transition-transform tw-duration-[0] tw-ease-in-out #{!important};

  &:hover .vc-app-menu-link__item:not(.vc-app-menu-link__item_active) {
    @apply tw-bg-[var(--app-menu-item-background-color-hover)] tw-bg-opacity-50 tw-rounded;

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
      tw-uppercase tw-select-none tw-px-2 tw-gap-4;

    &_collapsed {
    }

    &_active {
      @apply tw-bg-[color:var(--app-menu-item-background-color-active)] tw-rounded;

      .vc-app-menu-link__icon {
        @apply tw-text-[color:var(--app-menu-item-icon-color-active)];
      }

      .vc-app-menu-link__title {
        @apply tw-text-[color:var(--app-menu-item-title-color-active)] #{!important};
      }

      .vc-app-menu-link__title-icon {
        @apply tw-text-[color:var(--app-menu-item-icon-color-active)];
      }
    }

    // &_child-opened {
    //   .vc-app-menu-link__title {
    //     @apply tw-text-[color:var(--app-menu-item-active-text)] #{!important};
    //   }

    //   .vc-app-menu-link__icon {
    //     @apply tw-text-[color:var(--app-menu-item-active-icon)] #{!important};
    //   }
    // }
  }

  &__icon {
    @apply tw-text-[color:var(--app-menu-item-icon-color)]
    tw-overflow-hidden tw-flex
    tw-justify-center tw-shrink-0 tw-transition-[color] tw-duration-200 tw-w-[var(--app-menu-item-icon-width-container)];

    &--child {
      // @apply tw-mr-5;
    }
  }

  &__icon-letters {
    @apply tw-shrink-0 tw-w-[24px] tw-h-[24px] tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-xxs tw-leading-[10px] tw-font-extrabold tw-text-[var(--neutrals-500)] tw-border-[2px] tw-border-[var(--neutrals-500)];
  }

  &__title {
    @apply tw-text-[color:var(--app-menu-item-title-color)] tw-truncate
    tw-text-sm
    tw-font-normal
    tw-leading-normal
    tw-normal-case

    [transition:color_0.2s_ease]
    tw-opacity-100 tw-w-full tw-flex tw-justify-between tw-items-center;
  }

  &__title-icon {
    @apply tw-ml-3 tw-text-lg;
  }

  &__title-truncate {
    @apply tw-truncate;
  }

  &__title-icon {
    @apply tw-ml-3;
  }

  &__icon-content {
    @apply tw-text-center;
  }

  &__child {
    @apply tw-gap-1 tw-mt-1 tw-flex tw-flex-col;
  }

  &__child-item {
    @apply tw-cursor-pointer tw-min-w-0 tw-flex tw-h-[var(--app-menu-item-height)]
      tw-items-center tw-transition-[padding] tw-duration-150 tw-w-full tw-py-2 tw-px-3
    tw-text-[color:var(--app-menu-item-title-color)] tw-text-sm
    hover:tw-bg-[var(--app-menu-item-background-color-hover)]
    hover:tw-text-[color:var(--app-menu-item-title-color-active)] tw-gap-5;

    &_expanded {
      @apply tw-pl-7 tw-w-full #{!important};
    }

    &_collapsed {
      @apply tw-pl-2;
    }

    &_active {
      @apply tw-bg-[color:var(--app-menu-item-background-color-active)] tw-rounded #{!important};
      @apply tw-font-medium;
      @apply tw-text-[color:var(--app-menu-item-title-color-active)] #{!important};

      .vc-app-menu-link__icon {
        @apply tw-text-[color:var(--app-menu-item-icon-color-active)];
      }
    }
  }

  &__child-item-title {
    @apply tw-truncate;
  }

  &__child-item-link {
    @apply tw-cursor-pointer tw-z-[2] tw-w-full;
  }

  &__child-item-link:hover .vc-app-menu-link__child-item:not(.vc-app-menu-link__child-item_active) {
    @apply tw-bg-[var(--app-menu-item-background-color-hover)] tw-bg-opacity-50 tw-rounded;

    .vc-app-menu-link__icon {
      @apply tw-text-[color:var(--app-menu-item-icon-color-active)];
    }
  }

  &__icon-collapsed {
    @apply tw-p-0 tw-m-0;
  }
}

.opacity-enter-active,
.opacity-leave-active {
  transition: opacity 0.3s ease;
}

.opacity-enter-from,
.opacity-leave-to {
  opacity: 0;
}
</style>
