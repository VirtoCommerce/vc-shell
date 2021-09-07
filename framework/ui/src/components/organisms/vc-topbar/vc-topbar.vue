<template>
  <div class="vc-topbar">
    <img class="vc-topbar__logo" :src="logo" />
    <div class="vc-topbar__version vc-margin-left_xl">{{ version }}</div>

    <div class="vc-flex-grow_1"></div>

    <div v-if="buttons" class="vc-flex vc-fill_height">
      <div
        v-for="item in buttons"
        :key="item.id"
        class="vc-topbar__button"
        :class="{
          'vc-topbar__button_accent': item.accent,
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
      class="vc-topbar__account"
      :class="{
        'vc-topbar__account_active': accountMenuVisible,
      }"
      @click="toggleAccountMenuVisible"
    >
      <div
        class="vc-topbar__account-avatar"
        :style="{ 'background-image': `url(${account.avatar})` }"
      ></div>
      <div class="vc-flex-grow_1 vc-margin-left_m">
        <div class="vc-topbar__account-name">
          {{ account.name }}
        </div>
        <div class="vc-topbar__account-role">
          {{ account.role }}
        </div>
      </div>
      <div v-if="account.dropdown" class="vc-topbar__account-chevron">
        <vc-icon icon="fas fa-chevron-down" size="xl"></vc-icon>
      </div>
      <div
        v-if="account.dropdown && accountMenuVisible"
        v-click-outside="toggleAccountMenuVisible"
        class="vc-topbar__account-menu"
        @click.stop="accountMenuVisible = false"
      >
        <div
          v-for="item in account.dropdown"
          :key="item.id"
          class="vc-topbar__account-menu-item"
          @click="item.hasOwnProperty('onClick') ? item.onClick() : null"
        >
          {{ item.title }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import VcIcon from "../../atoms/vc-icon/vc-icon.vue";
import { clickOutside } from "../../../directives";

export default defineComponent({
  name: "VcTopbar",

  components: { VcIcon },

  directives: {
    clickOutside,
  },

  props: {
    logo: {
      type: String,
      default: "",
    },

    version: {
      type: String,
      default: "",
    },

    buttons: {
      type: Array,
      default: () => [],
    },

    account: {
      type: Object,
      default: () => ({}),
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
:root {
  --topbar-height: 60px;
  --topbar-background-color: #ffffff;
  --topbar-button-width: 50px;
  --topbar-button-border-color: var(--topbar-background-color);
  --topbar-button-color: #acacac;
  --topbar-button-background-color: var(--topbar-background-color);
  --topbar-button-color-hover: #808080;
  --topbar-button-background-color-hover: var(--topbar-background-color);
  --topbar-version-color: #838d9a;
}

.vc-topbar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--topbar-height);
  background-color: var(--topbar-background-color);
  padding-left: var(--padding-l);

  &__logo {
    height: 50%;
  }

  &__version {
    color: var(--topbar-version-color);
    font-size: var(--font-size-xs);
  }

  &__button {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--topbar-button-width);
    border-left: 1px solid var(--topbar-button-border-color);
    cursor: pointer;
    color: var(--topbar-button-color);
    background-color: var(--topbar-button-background-color);

    &:hover {
      color: var(--topbar-button-color-hover);
      background-color: var(--topbar-button-background-color-hover);
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

  &__account {
    width: 325px;
    border-left: 1px solid var(--app-bar-divider-color);
    padding: 0 var(--padding-l);
    box-sizing: border-box;
    cursor: pointer;
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;

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
      z-index: 9999;

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
</style>
