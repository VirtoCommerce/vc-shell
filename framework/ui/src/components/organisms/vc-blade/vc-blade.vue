<template>
  <div
    class="vc-blade"
    :style="{ width: typeof width === 'number' ? `${width}px` : width }"
    :class="{ 'vc-blade_expanded': expanded }"
  >
    <vc-blade-header
      :expanded="expanded"
      :closable="closable"
      :icon="icon"
      :title="title"
      :subtitle="subtitle"
      @expand="$emit('expand')"
      @collapse="$emit('collapse')"
      @close="$emit('close')"
    />

    <slot name="toolbar"><vc-blade-toolbar :items="toolbarItems" /></slot>

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
            :icon="filterOpened ? 'fas fa-caret-up' : 'fas fa-caret-down'"
            size="s"
            class="vc-blade__searchbar-filter-chevron vc-margin-left_s"
          ></vc-icon>
        </div>
        <div v-if="filterOpened" class="vc-blade__searchbar-filter-menu">
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
        <vc-form-input
          placeholder="Search keywords"
          clearable="clearable"
        ></vc-form-input>
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

<script lang="ts">
import { defineComponent, ref } from "vue";
import VcIcon from "../../atoms/vc-icon/vc-icon.vue";
import VcFormInput from "../../molecules/vc-form-input/vc-form-input.vue";
import VcBladeHeader from "../../molecules/vc-blade-header/vc-blade-header.vue";
import VcBladeToolbar from "../../organisms/vc-blade-toolbar/vc-blade-toolbar.vue";

export default defineComponent({
  name: "VcBlade",
  components: {
    VcIcon,
    VcFormInput,
    VcBladeHeader,
    VcBladeToolbar,
  },

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
      type: [Number, String],
      default: 300,
    },

    expanded: {
      type: Boolean,
      default: false,
    },

    closable: {
      type: Boolean,
      default: true,
    },

    toolbarItems: {
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
    const filterOpened = ref(false);

    return {
      filterOpened,
    };
  },
});
</script>

<style lang="less">
:root {
  --blade-background-color: #ffffff;
  --blade-border-radius: 6px;
  --blade-shadow: 2px 2px 8px rgba(126, 142, 157, 0.14);
  --blade-margin: 16px;
}

.vc-blade {
  display: flex;
  flex-direction: column;
  background: var(--blade-background-color);
  border-radius: var(--blade-border-radius);
  box-shadow: var(--blade-shadow);
  margin: var(--blade-margin);
  overflow: hidden;

  &_expanded {
    width: 100% !important;
  }

  &__searchbar {
    box-sizing: border-box;

    &-filter {
      position: relative;

      &-toggler {
        cursor: pointer;
        font-size: 14px;
      }

      &-label {
        color: #43b0e6;
      }

      &-chevron {
        color: #43b0e6;
      }

      &-menu {
        position: absolute;
        left: 0;
        top: 120%;
        width: 200px;
        background: white;
        border: 1px solid #e7ebf1;
        border-bottom: 0;

        &-item {
          padding: 12px;
          border-bottom: 1px solid #e7ebf1;
          cursor: pointer;

          &:hover {
            background: #eff7fc;
          }
        }
      }
    }

    &-counter {
      font-size: 16px;
      font-weight: var(--font-weight-medium);

      &-label {
        color: #333333;
      }

      &-value {
        color: #43b0e6;
      }
    }
  }
}
</style>
