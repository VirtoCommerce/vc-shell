<template>
  <div
    class="vc-blade"
    :style="{ width: `${width}px` }"
    :class="{ 'vc-blade_expanded': expanded }"
  >
    <div class="vc-blade__topbar vc-flex-shrink_0">
      <div
        class="vc-blade__topbar-button"
        v-if="expanded"
        @click="expanded = false"
      >
        <vc-icon icon="window-minimize" size="s"></vc-icon>
      </div>
      <div class="vc-blade__topbar-button" v-else @click="expanded = true">
        <vc-icon icon="window-maximize" size="s"></vc-icon>
      </div>
      <div
        class="vc-blade__topbar-button"
        :class="{ 'vc-blade__topbar-button_disabled': !closable }"
        @click="closable && $emit('close')"
      >
        <vc-icon icon="times"></vc-icon>
      </div>
    </div>

    <div class="vc-blade__header vc-flex-shrink_0">
      <div class="vc-blade__header-icon">
        <vc-icon :icon="icon" size="xxl"></vc-icon>
      </div>
      <div class="vc-blade__header-info">
        <div
          class="vc-blade__header-title"
          :class="{ 'vc-blade__header-title_only': !subtitle }"
        >
          {{ title }}
        </div>
        <div class="vc-blade__header-subtitle" v-if="subtitle">
          {{ subtitle }}
        </div>
      </div>
    </div>

    <div v-if="toolbarItems" class="vc-blade__toolbar vc-flex-shrink_0">
      <template v-for="item in toolbarItems">
        <div
          class="vc-blade__toolbar-item"
          :class="{ 'vc-blade__toolbar-item_disabled': item.disabled }"
          :key="item.id"
        >
          <vc-icon :icon="item.icon" size="ss"></vc-icon>
          <div class="vc-blade__toolbar-item-title">{{ item.title }}</div>
        </div>
      </template>
    </div>

    <vc-breadcrumbs
      v-if="breadcrumbs"
      class="vc-padding_l vc-padding-bottom_none vc-flex-shrink_0"
      :items="breadcrumbs"
    ></vc-breadcrumbs>

    <div
      v-if="searchable || filterable"
      class="
        vc-blade__searchbar
        vc-flex
        vc-flex-align_center
        vc-fill_width
        vc-padding_l
        vc-flex-shrink_0
      "
    >
      <div
        v-if="filterable"
        class="vc-blade__searchbar-filter vc-margin-right_l"
      >
        <div
          class="
            vc-blade__searchbar-filter-toggler
            vc-flex vc-flex-align-center
          "
          @click="filterOpened = !filterOpened"
        >
          <div class="vc-blade__searchbar-filter-label">Select filter</div>
          <vc-icon
            :icon="filterOpened ? 'caret-up' : 'caret-down'"
            size="s"
            class="vc-blade__searchbar-filter-chevron vc-margin-left_s"
          ></vc-icon>
        </div>
        <div class="vc-blade__searchbar-filter-menu" v-if="filterOpened">
          <div
            class="vc-blade__searchbar-filter-menu-item"
            @click="filterOpened = false"
          >
            Item 1
          </div>
          <div
            class="vc-blade__searchbar-filter-menu-item"
            @click="filterOpened = false"
          >
            Item 2
          </div>
          <div
            class="vc-blade__searchbar-filter-menu-item"
            @click="filterOpened = false"
          >
            Item 3
          </div>
        </div>
      </div>
      <div class="vc-blade__searchbar-search vc-flex-grow_1">
        <vc-input
          placeholder="Search keywords"
          clearable="clearable"
        ></vc-input>
      </div>
      <div
        v-if="filterable"
        class="vc-blade__searchbar-counter vc-margin-left_l"
      >
        <span class="vc-blade__searchbar-counter-label">Count:</span>
        <span class="vc-blade__searchbar-counter-value">5</span>
      </div>
    </div>

    <slot></slot>
  </div>
</template>

<script>
  import VcIcon from "./vc-icon.vue";
  import VcInput from "./vc-input.vue";
  import VcBreadcrumbs from "./vc-breadcrumbs.vue";
  import { defineComponent } from "@vue/composition-api";

  export default defineComponent({
    components: { VcIcon, VcInput, VcBreadcrumbs },
    
    props: {
      icon: {
        type: String,
      },

      title: {
        type: String,
      },

      subtitle: {
        type: String,
      },

      width: {
        type: Number | String,
        default: 300,
      },

      closable: {
        type: Boolean,
        default: true,
      },

      toolbarItems: {
        type: Array,
      },

      breadcrumbs: {
        type: Array,
      },

      searchable: {
        type: Boolean,
      },

      filterable: {
        type: Boolean,
      },
    },

    setup() {
      return {
        expanded: false,
        filterOpened: false,
      };
    },
  });
</script>
