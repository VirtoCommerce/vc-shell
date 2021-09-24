<template>
  <vc-popup :title="currentImage.title" @close="$emit('close')">
    <template v-slot:title>
      <div>
        <span>{{ currentImage.name }} (</span>
        <vc-link @click="copyLink(currentImage.src)">copy image link</vc-link>
        <span>)</span>
      </div>
    </template>
    <div class="vc-fill_all vc-flex vc-flex-column vc-flex-align_center">
      <div
        class="vc-gallery-preview__image-container vc-flex-grow_1 vc-fill_width"
      >
        <div
          class="vc-gallery-preview__image vc-fill_all"
          :style="{ backgroundImage: 'url(' + currentImage.url + ')' }"
        ></div>
        <div
          v-if="localIndex > 0"
          class="vc-gallery-preview__prev"
          @click="localIndex--"
        >
          <vc-icon icon="fas fa-arrow-left" size="xl"></vc-icon>
        </div>
        <div
          v-if="localIndex < images.length - 1"
          class="vc-gallery-preview__next"
          @click="localIndex++"
        >
          <vc-icon icon="fas fa-arrow-right" size="xl"></vc-icon>
        </div>
      </div>
      <div class="vc-gallery-preview__images vc-flex-shrink_1 vc-flex">
        <div
          v-for="(item, i) in images"
          :key="i"
          class="vc-gallery-preview__images-item"
          :class="{
            'vc-gallery-preview__images-item_current': i === localIndex,
          }"
        >
          <vc-image
            :src="item.url"
            size="xl"
            :bordered="true"
            :clickable="true"
            @click="localIndex = i"
          ></vc-image>
        </div>
      </div>
    </div>
  </vc-popup>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import VcPopup from "../../../vc-popup/vc-popup.vue";

export default defineComponent({
  name: "VcGalleryPreview",

  components: {
    VcPopup,
  },

  props: {
    images: {
      type: Array,
      default: () => [],
    },

    index: {
      type: Number,
      default: 0,
    },
  },

  setup(props) {
    const localIndex = ref(props.index);
    const currentImage = computed(() => props.images[localIndex.value] || {});

    const copyLink = (link: string) => {
      if (link.charAt(0) === "/") {
        navigator.clipboard?.writeText(`${location.origin}${link}`);
      } else {
        navigator.clipboard?.writeText(link);
      }
    };

    return {
      currentImage,
      localIndex,
      copyLink,
    };
  },
});
</script>

<style lang="less">
.vc-gallery-preview {
  &__image-container {
    box-sizing: border-box;
    padding: var(--padding-xl);
  }

  &__image {
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }

  &__images {
    padding: var(--padding-l);
    padding-bottom: 40px;
    max-width: 100%;
    overflow-x: auto;
    box-sizing: border-box;

    &-item {
      margin: 0 var(--margin-xs);
      opacity: 0.6;

      &_current {
        position: relative;
        opacity: 1;

        &::after {
          content: "";
          background: #43b0e6;
          height: 4px;
          width: 100%;
          border-radius: 5px;
          position: absolute;
          left: 0;
          bottom: -12px;
        }
      }
    }
  }

  &__prev,
  &__next {
    position: absolute;
    top: 50%;
    margin-top: -36px;
    height: 72px;
    width: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: #f1f6fa;
    cursor: pointer;
    color: #a1c0d4;
    --icon-size-xl: 36px;

    &:hover {
      box-shadow: 0 0 20px rgba(31, 40, 50, 0.15);
    }
  }

  &__prev {
    left: 25px;
  }

  &__next {
    right: 25px;
  }
}
</style>
