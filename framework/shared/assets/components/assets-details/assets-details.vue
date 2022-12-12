<template>
  <VcBlade
    :title="options.editableAsset.name"
    :subtitle="$t('ASSETS.PAGES.DETAILS.SUBTITLE')"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
    @close="$emit('close:blade')"
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
                is-required
                :placeholder="
                  $t('ASSETS.PAGES.DETAILS.FIELDS.NAME.PLACEHOLDER')
                "
              ></VcInput>
              <VcInput
                class="mb-4"
                :label="$t('ASSETS.PAGES.DETAILS.FIELDS.ALT.TITLE')"
                v-model="localImage.altText"
                :clearable="true"
                :placeholder="$t('ASSETS.PAGES.DETAILS.FIELDS.ALT.PLACEHOLDER')"
                :tooltip="$t('ASSETS.PAGES.DETAILS.FIELDS.ALT.TOOLTIP')"
                is-required
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
import { useI18n } from "@/core/composables";
import { IParentCallArgs } from "@/shared";
import {
  VcBlade,
  VcContainer,
  VcForm,
  VcImage,
  VcInput,
  VcTextarea,
} from "@/components";

interface ILocalImage {
  url: string;
  name: string;
  altText: string;
  description: string;
}

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  options?: {
    editableAsset?: ILocalImage;
    sortHandler?: (remove: boolean, localImage: ILocalImage) => void;
  };
}

export interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "close:blade"): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
  options: () => ({}),
});

const emit = defineEmits<Emits>();
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
        emit("close:blade");
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
          emit("close:blade");
        }
      }
    },
  },
];
</script>
