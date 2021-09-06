<template>
  <div class="vc-layout-workspace vc-flex vc-fill_all">
    <div class="vc-fill_height">
      <slot name="left">
        <vc-nav
          :items="navItems"
          :logo="branding.logo"
          :logo-mini="branding.logoMini"
          :version="branding.version"
          @itemClick="$emit('navClick', $event)"
        ></vc-nav>
      </slot>
    </div>

    <div class="vc-flex vc-flex-grow_1 vc-flex-column">
      <div
        class="
          vc-layout-workspace__topbar
          vc-flex
          vc-fill_width
          vc-flex-align_stretch
          vc-flex-shrink_0
        "
      >
        <div v-if="$slots['banner']" class="vc-layout-workspace__topbar-banner">
          <slot name="banner"></slot>
        </div>

        <div class="vc-flex-grow_1"></div>

        <div
          v-if="toolbarItems"
          class="vc-layout-workspace__topbar-toolbar vc-flex"
        >
          <div
            v-for="item in toolbarItems"
            :key="item.id"
            class="
              vc-layout-workspace__topbar-toolbar-item
              vc-flex
              vc-flex-align_center
              vc-fill_height
              vc-flex-justify_center
            "
            :class="{
              'vc-layout-workspace__topbar-toolbar-item_accent': item.accent,
            }"
            :title="item.title"
            @click="item.hasOwnProperty('onClick') ? item.onClick() : null"
          >
            <vc-icon
              :icon="typeof item.icon === 'function' ? item.icon() : item.icon"
              size="xl"
            ></vc-icon>
          </div>
        </div>

        <div
          v-if="account"
          class="
            vc-layout-workspace__topbar-account
            vc-flex
            vc-flex-shrink_0
            vc-flex-align_center
          "
          :class="{
            'vc-layout-workspace__topbar-account_active': accountMenuVisible,
          }"
          @click="accountMenuVisible = !accountMenuVisible"
        >
          <div
            class="vc-layout-workspace__topbar-account-avatar"
            :style="{ 'background-image': `url(${account.avatar})` }"
          ></div>
          <div class="vc-flex-grow_1 vc-margin-left_m">
            <div class="vc-layout-workspace__topbar-account-name">
              {{ account.name }}
            </div>
            <div class="vc-layout-workspace__topbar-account-role">
              {{ account.role }}
            </div>
          </div>
          <div
            v-if="account.dropdown"
            class="vc-layout-workspace__topbar-account-chevron"
          >
            <vc-icon icon="fas fa-chevron-down" size="xl"></vc-icon>
          </div>
          <div
            v-if="account.dropdown && accountMenuVisible"
            v-click-outside="toggleAccountMenuVisible"
            class="vc-layout-workspace__topbar-account-menu"
            @click.stop="accountMenuVisible = false"
          >
            <div
              v-for="item in account.dropdown"
              :key="item.id"
              class="vc-layout-workspace__topbar-account-menu-item"
              @click="item.hasOwnProperty('onClick') ? item.onClick() : null"
            >
              {{ item.title }}
            </div>
          </div>
        </div>
      </div>

      <div
        class="
          vc-layout-workspace__content
          vc-flex
          vc-flex-grow_1
          vc-padding-horizontal_s
        "
      >
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import VcIcon from "../../atoms/vc-icon/vc-icon.vue";
import { clickOutside } from "../../../directives";

export default defineComponent({
  components: { VcIcon },
  directives: {
    clickOutside,
  },

  props: {
    branding: {
      type: Object,
      default: () => ({}),
    },

    toolbarItems: {
      type: Array,
      default() {
        return [];
      },
    },

    navItems: {
      type: Array,
      default() {
        return [];
      },
    },

    account: {
      type: Object,
      default() {
        return {
          name: "Unknown",
          role: undefined,
          avatar: undefined,
        };
      },
    },
  },

  setup() {
    const accountMenuVisible = ref(false);
    const toggleAccountMenuVisible = () => {
      accountMenuVisible.value = !accountMenuVisible.value;
    };

    return {
      accountMenuVisible,
      toggleAccountMenuVisible,
    };
  },
});
</script>

<style lang="less">
.vc-layout-workspace {
  background-color: var(--background-color);
  overflow: hidden;

  &__topbar {
    height: var(--app-bar-height);
    background: var(--app-bar-background-color);
    color: white;

    &-banner {
      border-right: 1px solid var(--app-bar-divider-color);
      padding-left: 20px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
      max-width: 407px;
      flex-wrap: nowrap;
      font-size: var(--font-size-s);

      .vc-button {
        margin: 0 20px;
      }
    }

    &-toolbar {
      &-item {
        position: relative;
        width: var(--app-bar-toolbar-item-width);
        border-left: 1px solid var(--app-bar-divider-color);
        cursor: pointer;
        color: var(--app-bar-toolbar-icon-color);

        &:hover {
          background: var(--app-bar-toolbar-icon-background-hover);
          color: var(--app-bar-toolbar-icon-color-hover);
        }

        &_accent:before {
          content: "";
          display: block;
          position: absolute;
          right: 12px;
          top: 18px;
          width: 7px;
          height: 7px;
          background: #ff4a4a;
          border-radius: 50%;
          z-index: 1;
        }
      }
    }

    &-account {
      width: 325px;
      border-left: 1px solid var(--app-bar-divider-color);
      padding: 0 20px;
      box-sizing: border-box;
      cursor: pointer;
      position: relative;

      &:hover,
      &_active {
        background: var(--app-bar-toolbar-icon-background-hover);
      }

      &-avatar {
        border-radius: 50%;
        overflow: hidden;
        width: 34px;
        height: 34px;
        background-color: var(--app-bar-account-info-role-color);
        background-size: cover;
        background-position: center;
      }

      &-name {
        font-size: var(--font-size-m);
        color: var(--app-bar-account-info-name-color);
      }

      &-role {
        font-size: var(--font-size-m);
        color: var(--app-bar-account-info-role-color);
      }

      &-chevron {
        color: #7e8e9d;
      }

      &_active &-chevron {
        transform: rotate(180deg);
      }

      &-menu {
        position: absolute;
        left: -1px;
        right: 0;
        top: var(--app-bar-height);
        background: white;

        &-item {
          padding: var(--padding-m);
          font-size: var(--font-size-l);
          color: #000000;
          border-left: 1px solid #e7ebf1;
          border-bottom: 1px solid #e7ebf1;
          background-color: white;

          &:hover {
            background-color: #eff7fc;
          }
        }
      }
    }
  }

  &__content {
    overflow-y: hidden;
    overflow-x: auto;
  }
}
</style>
