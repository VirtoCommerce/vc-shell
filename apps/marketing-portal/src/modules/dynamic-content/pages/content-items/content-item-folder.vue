<template>
  <VcBlade
    v-loading="loading"
    :title="title"
    width="30%"
    @close="$emit('page:close')"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
  >
    <!-- Blade contents -->
    <VcContainer :no-padding="true">
      <div class="grow basis-0">
        <div class="p-4">
          <VcForm>
            <VcInput
              class="mb-4"
              :required="true"
              v-model="folderDetails.name"
              :label="
                $t(
                  'DYNAMIC_CONTENT.PAGES.CONTENT_ITEM_FOLDER.INPUTS.FOLDER_NAME.LABEL'
                )
              "
              :placeholder="
                $t(
                  'DYNAMIC_CONTENT.PAGES.CONTENT_ITEM_FOLDER.INPUTS.FOLDER_NAME.PLACEHOLDER'
                )
              "
              rules="min:3"
              name="name"
            >
            </VcInput>
            <VcTextarea
              class="mb-4"
              v-model="folderDetails.description"
              rules="min:3"
              name="description"
              :required="true"
              :label="
                $t(
                  'DYNAMIC_CONTENT.PAGES.CONTENT_ITEM_FOLDER.INPUTS.DESCRIPTION.LABEL'
                )
              "
              :placeholder="
                $t(
                  'DYNAMIC_CONTENT.PAGES.CONTENT_ITEM_FOLDER.INPUTS.DESCRIPTION.PLACEHOLDER'
                )
              "
            >
            </VcTextarea>
          </VcForm>
        </div>
      </div>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, unref, onMounted } from "vue";

export default defineComponent({
  url: "folder",
});
</script>

<script lang="ts" setup>
import { IBladeToolbar } from "../../../../types";
import { useI18n } from "@virtoshell/core";
import { useContentItemFolder } from "../../composables";
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
const emit = defineEmits(["parent:call", "page:close"]);
const { t } = useI18n();
const title = computed(() => {
  return (
    folder.value?.name || t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEM_FOLDER.TITLE")
  );
});
const {
  folderDetails,
  folder,
  loading,
  modified,
  createContentFolder,
  getDynamicContentFolderById,
  updateContentFolder,
  resetEntries,
  deleteContentFolder,
} = useContentItemFolder();
const { validate } = useForm({ validateOnMount: false });

const bladeToolbar = reactive<IBladeToolbar[]>([
  {
    id: "save",
    title: t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEM_FOLDER.TOOLBAR.SAVE.TITLE"),
    icon: "fas fa-save",
    async clickHandler() {
      const { valid } = await validate();

      if (valid) {
        try {
          if (props.param) {
            await updateContentFolder(folderDetails.value);
          } else if (props.options.folderId) {
            await createContentFolder({
              ...folderDetails.value,
              parentFolderId: props.options.folderId,
            });
          }

          emit("parent:call", {
            method: "reload",
          });
          emit("page:close");
        } catch (e) {
          alert(e.message);
        }
      } else {
        alert(
          unref(
            computed(() =>
              t(
                "DYNAMIC_CONTENT.PAGES.CONTENT_ITEM_FOLDER.TOOLBAR.SAVE.NOT_VALID"
              )
            )
          )
        );
      }
    },
    disabled: computed(() => !modified.value),
  },
  {
    id: "reset",
    title: t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEM_FOLDER.TOOLBAR.RESET"),
    icon: "fas fa-undo",
    clickHandler() {
      resetEntries();
    },
    isVisible: !!props.param,
    disabled: computed(() => !modified.value),
  },
  {
    id: "delete",
    title: t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEM_FOLDER.TOOLBAR.DELETE"),
    icon: "fas fa-trash",
    async clickHandler() {
      await deleteContentFolder({ id: folderDetails.value.id });
    },
    isVisible: !!props.param,
  },
]);

onMounted(async () => {
  if (props.param) {
    await getDynamicContentFolderById({ id: props.param });
  }
});

defineExpose({
  title,
});
</script>
