<template>
  <VcBlade
    :title="title"
    width="50%"
    v-loading="loading"
    @close="$emit('page:close')"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
  >
    <!-- Blade contents -->
    <VcContainer :no-padding="true">
      <div class="vc-flex-grow_1">
        <div class="vc-padding_l">
          <VcForm>
            <VcInput
              class="vc-margin-bottom_l"
              :required="true"
              v-model="contentPlaceDetails.name"
              :label="
                $t(
                  'DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDER.INPUTS.CONTENT_PLACEHOLDER_NAME.LABEL'
                )
              "
              :placeholder="
                $t(
                  'DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDER.INPUTS.CONTENT_PLACEHOLDER_NAME.PLACEHOLDER'
                )
              "
              rules="min:3"
              name="name"
            >
            </VcInput>
            <VcTextarea
              class="vc-margin-bottom_l"
              v-model="contentPlaceDetails.description"
              rules="min:3"
              name="description"
              :required="true"
              :label="
                $t(
                  'DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDER.INPUTS.DESCRIPTION.LABEL'
                )
              "
              :placeholder="
                $t(
                  'DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDER.INPUTS.DESCRIPTION.PLACEHOLDER'
                )
              "
            >
            </VcTextarea>
            <div class="vc-margin-bottom_l">
              <!-- File upload label -->
              <VcLabel class="vc-margin-bottom_s">
                <span>{{
                  $t(
                    "DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDER.INPUTS.PLACEHOLDER_IMAGE_DESCRIPTION.LABEL"
                  )
                }}</span>
              </VcLabel>
              <VcFileUpload variant="import" @upload="onUpload"></VcFileUpload>
            </div>
            <VcImage :src="contentPlaceDetails.imageUrl"></VcImage>
          </VcForm>
        </div>
      </div>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  onMounted,
  unref,
  ref,
} from "vue";

export default defineComponent({
  url: "placeholder",
});
</script>

<script lang="ts" setup>
import { IBladeToolbar } from "../../../../types";
import { useI18n, useLogger, useUser } from "@virtoshell/core";
import { useContentPlace } from "../../composables";
import { useForm } from "@virtoshell/ui";

const props = defineProps({
  expanded: {
    type: Boolean,
    default: true,
  },

  closable: {
    type: Boolean,
    default: true,
  },

  param: {
    type: String,
    default: undefined,
  },

  options: {
    type: Object,
    default: () => ({}),
  },
});
const emit = defineEmits(["page:close", "parent:call", "page:open"]);
const { t } = useI18n();
const {
  loadContentPlace,
  modified,
  contentPlace,
  contentPlaceDetails,
  loading,
  resetEntries,
  updateContentPlaceDetails,
  deleteContentPlaceDetails,
  createContentPlaceDetails,
  setImage,
} = useContentPlace();
const logger = useLogger();
const { getAccessToken } = useUser();
const { validate } = useForm({ validateOnMount: false });
const fileLoading = ref(false);

const title = computed(() => {
  return contentPlace.value?.name
    ? contentPlace.value?.name
    : t("DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDER.TITLE");
});

const bladeToolbar = reactive<IBladeToolbar[]>([
  {
    id: "save",
    title: t("DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDER.TOOLBAR.SAVE.TITLE"),
    icon: "fas fa-save",
    async clickHandler() {
      const { valid } = await validate();
      if (valid) {
        try {
          if (props.param) {
            await updateContentPlaceDetails(contentPlaceDetails.value);
          } else {
            await createContentPlaceDetails({
              ...contentPlaceDetails.value,
              folderId: props.options.folderId,
            });
          }
          emit("parent:call", {
            method: "reload",
          });
          if (!props.param) {
            emit("page:close");
          }
        } catch (err) {
          alert(err.message);
        }
      } else {
        alert(
          unref(
            computed(() =>
              t(
                "DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDER.TOOLBAR.SAVE.NOT_VALID"
              )
            )
          )
        );
      }
    },
    disabled: computed(() => props.param && !modified.value),
  },
  {
    id: "reset",
    title: t("DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDER.TOOLBAR.RESET"),
    icon: "fas fa-undo",
    clickHandler() {
      resetEntries();
    },
    disabled: computed(() => props.param && !modified.value),
    isVisible: !!props.param,
  },
  {
    id: "delete",
    title: t("DYNAMIC_CONTENT.PAGES.CONTENT_PLACEHOLDER.TOOLBAR.DELETE"),
    icon: "fas fa-trash",
    async clickHandler() {
      await deleteContentPlaceDetails({ id: contentPlaceDetails.value.id });
      emit("parent:call", {
        method: "reload",
      });
      emit("page:close");
    },
    isVisible: !!props.param,
  },
]);

onMounted(async () => {
  if (props.param) {
    await loadContentPlace({ id: props.param });
  }
});

async function onUpload(files: File) {
  try {
    fileLoading.value = true;
    const formData = new FormData();
    formData.append("file", files[0]);
    const authToken = await getAccessToken();
    const result = await fetch(`/api/assets?folderUrl=placeholders-images`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    const response = await result.json();
    if (response?.length) {
      setImage(response[0]);
    }
    files = null;
  } catch (e) {
    logger.error(e);
  } finally {
    fileLoading.value = false;
  }
}

defineExpose({
  title,
});
</script>

<style lang="less" scoped></style>
