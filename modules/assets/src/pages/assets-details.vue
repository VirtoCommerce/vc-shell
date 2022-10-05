<template>
  <VcBlade
    :title="options.editableAsset.name"
    :subtitle="$t('ASSETS.PAGES.DETAILS.SUBTITLE')"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
    @close="$emit('page:close')"
  >
    <!-- Blade contents -->
    <div class="flex grow-1 border-t border-solid border-t-[#eaedf3]">
      <div class="assets-details__content grow basis-0">
        <VcContainer :no-padding="true">
          <div class="p-4">
            <VcForm>
              <VcImage
                class="mb-4"
                :src="localImage.url"
                size="xl"
                :bordered="true"
              ></VcImage>
              <VcInput
                class="mb-4"
                :label="$t('ASSETS.PAGES.DETAILS.FIELDS.NAME.TITLE')"
                v-model="localImage.name"
                :clearable="true"
                :required="true"
                :placeholder="
                  $t('ASSETS.PAGES.DETAILS.FIELDS.NAME.PLACEHOLDER')
                "
              ></VcInput>
              <VcInput
                class="mb-4"
                :label="$t('ASSETS.PAGES.DETAILS.FIELDS.ALT.TITLE')"
                v-model="localImage.altText"
                :clearable="true"
                :required="true"
                :placeholder="$t('ASSETS.PAGES.DETAILS.FIELDS.ALT.PLACEHOLDER')"
                :tooltip="$t('ASSETS.PAGES.DETAILS.FIELDS.ALT.TOOLTIP')"
              ></VcInput>
              <VcTextarea
                class="mb-4"
                :label="$t('ASSETS.PAGES.DETAILS.FIELDS.DESCRIPTION.TITLE')"
                v-model="localImage.description"
                :required="true"
                :placeholder="
                  $t('ASSETS.PAGES.DETAILS.FIELDS.DESCRIPTION.PLACEHOLDER')
                "
              ></VcTextarea>
            </VcForm>
          </div>
        </VcContainer>
      </div>
    </div>
  </VcBlade>
</template>

<script lang="ts" setup>
import { computed, reactive, unref } from "vue";
import { useI18n } from "@virto-shell/core";

const props = defineProps({
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
});
const emit = defineEmits(["parent:call", "page:close"]);
const { t } = useI18n();
const localImage = reactive({ ...props.options.editableAsset });

const bladeToolbar = [
  {
    id: "save",
    title: t("ASSETS.PAGES.DETAILS.TOOLBAR.SAVE"),
    icon: "fas fa-save",
    clickHandler() {
      if (
        props.options.sortHandler &&
        typeof props.options.sortHandler === "function"
      ) {
        props.options.sortHandler(false, localImage);
        emit("page:close");
      }
    },
  },
  {
    id: "delete",
    title: t("ASSETS.PAGES.DETAILS.TOOLBAR.DELETE"),
    icon: "fas fa-trash",
    clickHandler() {
      if (
        window.confirm(
          unref(computed(() => t("ASSETS.PAGES.DETAILS.DELETE_CONFIRMATION")))
        )
      ) {
        if (
          props.options.sortHandler &&
          typeof props.options.sortHandler === "function"
        ) {
          props.options.sortHandler(true, localImage);
          emit("page:close");
        }
      }
    },
  },
];
</script>
