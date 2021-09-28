<template>
  <vc-blade
    :uid="uid"
    :title="options.name"
    :subtitle="$t('ASSETS.PAGES.DETAILS.SUBTITLE')"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
    @close="$emit('page:close')"
  >
    <!-- Blade contents -->
    <div class="assets-details__inner vc-flex vc-flex-grow_1">
      <div class="assets-details__content vc-flex-grow_1">
        <vc-container :no-padding="true">
          <div class="vc-padding_l">
            <vc-form>
              <vc-image
                class="vc-margin-bottom_l"
                :src="localImage.url"
                size="xl"
                :bordered="true"
              ></vc-image>
              <vc-input
                class="vc-margin-bottom_l"
                :label="$t('ASSETS.PAGES.DETAILS.FIELDS.NAME.TITLE')"
                v-model="localImage.name"
                :clearable="true"
                :required="true"
                :placeholder="
                  $t('ASSETS.PAGES.DETAILS.FIELDS.NAME.PLACEHOLDER')
                "
              ></vc-input>
              <vc-input
                class="vc-margin-bottom_l"
                :label="$t('ASSETS.PAGES.DETAILS.FIELDS.ALT.TITLE')"
                v-model="localImage.alt"
                :clearable="true"
                :required="true"
                :placeholder="$t('ASSETS.PAGES.DETAILS.FIELDS.ALT.PLACEHOLDER')"
                :tooltip="$t('ASSETS.PAGES.DETAILS.FIELDS.ALT.TOOLTIP')"
              ></vc-input>
              <vc-textarea
                class="vc-margin-bottom_l"
                :label="$t('ASSETS.PAGES.DETAILS.FIELDS.DESCRIPTION.TITLE')"
                v-model="localImage.description"
                :required="true"
                :placeholder="
                  $t('ASSETS.PAGES.DETAILS.FIELDS.DESCRIPTION.PLACEHOLDER')
                "
              ></vc-textarea>
            </vc-form>
          </div>
        </vc-container>
      </div>
    </div>
  </vc-blade>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { useI18n } from "@virtoshell/core";

export default defineComponent({
  props: {
    uid: {
      type: String,
      default: undefined,
    },

    expanded: {
      type: Boolean,
      default: true,
    },

    closable: {
      type: Boolean,
      default: true,
    },

    options: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props) {
    const { t } = useI18n();
    const localImage = reactive({ ...props.options });

    const bladeToolbar = [
      {
        id: "save",
        title: t("ASSETS.PAGES.DETAILS.TOOLBAR.SAVE"),
        icon: "fas fa-save",
      },
      {
        id: "delete",
        title: t("ASSETS.PAGES.DETAILS.TOOLBAR.DELETE"),
        icon: "fas fa-trash",
      },
    ];

    return {
      bladeToolbar,
      localImage,
    };
  },
});
</script>

<style lang="less">
.assets-details {
  &__inner {
    border-top: 1px solid #eaedf3;
    overflow: hidden;
  }
}
</style>
