<template>
  <div class="vc-layout vc-flex vc-fill_all">
    <div class="vc-fill_height">
      <slot name="left"></slot>
    </div>

    <div class="vc-flex vc-flex-grow_1 vc-flex-column">
      <div
        class="
          vc-layout__topbar
          vc-flex
          vc-fill_width
          vc-flex-align_stretch
          vc-flex-shrink_0
        "
      >
        <div v-if="$slots['banner']" class="vc-layout__topbar-banner">
          <slot name="banner"></slot>
        </div>

        <div
          v-if="$slots['notification']"
          class="vc-layout__topbar-notification"
        >
          <slot name="notification"></slot>
        </div>
        <vc-spacer v-else />

        <div v-if="toolbarItems" class="vc-layout__topbar-toolbar vc-flex">
          <div
            v-for="item in toolbarItems"
            :key="item.id"
            class="
              vc-layout__topbar-toolbar-item
              vc-flex
              vc-flex-align_center
              vc-fill_height
              vc-flex-justify_center
            "
            :class="{ 'vc-layout__topbar-toolbar-item_accent': item.accent }"
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
          class="
            vc-layout__topbar-account
            vc-flex
            vc-flex-shrink_0
            vc-flex-align_center
          "
          :class="{ 'vc-layout__topbar-account_active': accountMenuVisible }"
          @click="accountMenuVisible = !accountMenuVisible"
          v-if="account"
        >
          <div
            class="vc-layout__topbar-account-avatar"
            :style="{ 'background-image': `url(${account.avatar})` }"
          ></div>
          <div class="vc-flex-grow_1 vc-margin-left_m">
            <div class="vc-layout__topbar-account-name">{{ account.name }}</div>
            <div class="vc-layout__topbar-account-role">{{ account.role }}</div>
          </div>
          <div class="vc-layout__topbar-account-chevron">
            <vc-icon icon="chevron-down" size="xl"></vc-icon>
          </div>
          <div
            class="vc-layout__topbar-account-menu"
            v-if="accountMenuVisible"
            @click.stop
          >
            <div class="vc-layout__topbar-account-menu-item">Profile</div>
            <div class="vc-layout__topbar-account-menu-item">Log Out</div>
          </div>
        </div>
      </div>

      <div class="vc-layout__content vc-flex vc-flex-grow_1">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
  import VcIcon from "./vc-icon.vue";
  import VcSpacer from "./vc-spacer.vue";

  export default {
    components: { VcIcon, VcSpacer },

    props: {
      toolbarItems: {
        type: Array,
      },

      account: {
        type: Object,
      },
    },

    data() {
      return {
        accountMenuVisible: false,
      };
    },
  };
</script>
