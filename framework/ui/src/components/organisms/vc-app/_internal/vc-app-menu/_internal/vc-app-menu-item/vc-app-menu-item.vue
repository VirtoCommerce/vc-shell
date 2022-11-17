<template>
  <div>
    <template v-if="component && component.url">
      <router-link :to="component.url" v-slot="{ isActive }">
        <vc-app-menu-link
          :isActive="isActive"
          :children="children"
          :sticky="sticky"
          :icon="icon"
          :title="title"
          @onClick="onMenuItemClick"
        />
      </router-link>
    </template>
    <template v-else>
      <vc-app-menu-link
        :children="children"
        :sticky="sticky"
        :icon="icon"
        :title="title"
        @onClick="onMenuItemClick"
      />

      <!-- Nested menu items -->
      <div class="vc-app-menu-item__child" v-if="isOpened">
        <template v-for="(nested, i) in children" :key="i">
          <router-link :to="nested.component.url" v-slot="{ isActive }">
            <div
              :class="[
                {
                  'vc-app-menu-item__child-item_active': isActive,
                },
                'vc-app-menu-item__child-item',
              ]"
              v-if="nested.isVisible === undefined || nested.isVisible"
              :key="i"
              @click="$emit('child:click', nested)"
            >
              {{ nested.title }}
            </div>
          </router-link>
        </template>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { BladeComponent, IBladeToolbar } from "../../../../../../../typings";
import VcAppMenuLink from "./_internal/vc-app-menu-link.vue";
import { useRoute } from "vue-router";

interface Props {
  sticky?: boolean;
  isVisible?: boolean;
  component?: BladeComponent;
  bladeOptions?: Record<string, unknown>;
  clickHandler?: () => void;
  icon: string;
  title: string;
  children?: IBladeToolbar[];
  isCollapsed?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  sticky: true,
  isVisible: false,
  component: undefined,
  bladeOptions: () => ({}),
  clickHandler: undefined,
  icon: "",
  title: "",
  children: () => [],
  isCollapsed: true,
});

const route = useRoute();

const emit = defineEmits(["click"]);

const isOpened = ref(false);

onMounted(() => {
  if (
    props.children &&
    props.children.length &&
    props.children.find((x) => x.component?.url === route.path)
  ) {
    isOpened.value = true;
  }
});

function onMenuItemClick() {
  if (!props.children?.length) {
    emit("click");
  } else {
    isOpened.value = !isOpened.value;
  }
}
</script>

<style lang="scss">
:root {
  --app-menu-item-height: 38px;
  --app-menu-item-icon-width: 20px;
  --app-menu-item-icon-color: #337599;
  --app-menu-item-icon-color-active: #ffffff;
  --app-menu-item-handler-width: 10px;
  --app-menu-item-background-color-hover: #337599;
  --app-menu-item-hover-radius: 4px;
  --app-menu-item-title-color: #465769;
  --app-menu-item-title-color-active: #ffffff;
  --app-menu-item-handler-color: #bdd1df;
}
.vc-app-menu-item {
  &__child {
    @apply ml-[42px] gap-[4px] flex flex-col;
  }

  &__child-item {
    @apply cursor-pointer w-fit py-[5px] px-[9px] rounded-[4px]
    hover:bg-[color:var(--app-menu-item-background-color-hover)]
    hover:text-[color:var(--app-menu-item-title-color-active)];

    &_active {
      @apply bg-[color:var(--app-menu-item-background-color-hover)]
      text-[color:var(--app-menu-item-title-color-active)] font-bold;
    }
  }
}
</style>
