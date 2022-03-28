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
              v-model="contentItemDetails.name"
              :label="
                $t(
                  'DYNAMIC_CONTENT.PAGES.CONTENT_ITEM.INPUTS.CONTENT_ITEM_NAME.LABEL'
                )
              "
              :placeholder="
                $t(
                  'DYNAMIC_CONTENT.PAGES.CONTENT_ITEM.INPUTS.CONTENT_ITEM_NAME.PLACEHOLDER'
                )
              "
              rules="min:3"
              name="name"
            >
            </VcInput>
            <VcTextarea
              class="vc-margin-bottom_l"
              v-model="contentItemDetails.description"
              rules="min:3"
              name="description"
              :required="true"
              :label="
                $t(
                  'DYNAMIC_CONTENT.PAGES.CONTENT_ITEM.INPUTS.DESCRIPTION.LABEL'
                )
              "
              :placeholder="
                $t(
                  'DYNAMIC_CONTENT.PAGES.CONTENT_ITEM.INPUTS.DESCRIPTION.PLACEHOLDER'
                )
              "
            >
            </VcTextarea>
            <VcDynamicProperty
              v-for="(property, i) in contentItemDetails.dynamicProperties"
              :key="`${contentItemDetails.id}_${i}`"
              :property="property"
              :optionsGetter="loadDictionaries"
              :getter="getPropertyValue"
              :setter="setPropertyValue"
              class="vc-margin-bottom_l"
            ></VcDynamicProperty>
          </VcForm>
        </div>
      </div>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, onMounted, unref } from "vue";

export default defineComponent({
  url: "item",
});
</script>

<script lang="ts" setup>
import { IBladeToolbar } from "../../../../types";
import { useI18n } from "@virtoshell/core";
import { useContentItem, useDictionaryItems } from "../../composables";
import {
  DynamicObjectProperty,
  DynamicPropertyDictionaryItem,
  DynamicPropertyObjectValue,
} from "@virtoshell/api-client";
import { useForm } from "@virtoshell/ui";
import ContentManageProperties from "./content-manage-properties.vue";

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
  loadContentItem,
  modified,
  contentItem,
  contentItemDetails,
  loading,
  resetEntries,
  updateContentItemDetails,
  deleteContentItemDetails,
  createContentItemDetails,
  handleContentItemCreate,
} = useContentItem();
const { searchDictionaryItems } = useDictionaryItems();
const { validate } = useForm({ validateOnMount: false });

const title = computed(() => {
  return contentItem.value?.name
    ? contentItem.value?.name
    : t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEM.TITLE");
});

const bladeToolbar = reactive<IBladeToolbar[]>([
  {
    id: "save",
    title: t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEM.TOOLBAR.SAVE.TITLE"),
    icon: "fas fa-save",
    async clickHandler() {
      const { valid } = await validate();
      if (valid) {
        try {
          if (props.param) {
            await updateContentItemDetails(contentItemDetails.value);
          } else {
            await createContentItemDetails({
              ...contentItemDetails.value,
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
              t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEM.TOOLBAR.SAVE.NOT_VALID")
            )
          )
        );
      }
    },
    disabled: computed(() => props.param && !modified.value),
  },
  {
    id: "reset",
    title: t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEM.TOOLBAR.RESET"),
    icon: "fas fa-undo",
    clickHandler() {
      resetEntries();
    },
    disabled: computed(() => props.param && !modified.value),
    isVisible: !!props.param,
  },
  {
    id: "delete",
    title: t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEM.TOOLBAR.DELETE"),
    icon: "fas fa-trash",
    async clickHandler() {
      await deleteContentItemDetails({ id: contentItemDetails.value.id });
      emit("parent:call", {
        method: "reload",
      });
      emit("page:close");
    },
    isVisible: !!props.param,
  },
  {
    id: "typeProps",
    title: t("DYNAMIC_CONTENT.PAGES.CONTENT_ITEM.TOOLBAR.TYPE_PROPERTIES"),
    icon: "fas fa-download",
    clickHandler() {
      emit("page:open", {
        component: ContentManageProperties,
        componentOptions: { objectType: contentItem.value.objectType },
      });
    },
    disabled: !props.param,
  },
]);

onMounted(async () => {
  if (props.param) {
    await loadContentItem({ id: props.param });
  } else {
    await handleContentItemCreate();
  }
});

function handleDictionaryValue(
  property: DynamicObjectProperty,
  valueId: string,
  dictionary: DynamicPropertyDictionaryItem[]
) {
  let valueName;
  const dictionaryItem = dictionary.find((x) => x.id === valueId);
  if (dictionaryItem) {
    valueName = dictionaryItem.name;
  }

  return {
    value: valueName,
    valueId,
  };
}

function getPropertyValue(
  property: DynamicObjectProperty,
  isDictionary?: boolean
) {
  if (isDictionary) {
    return (
      property.values[0] &&
      (property.values[0].valueId as unknown as Record<string, unknown>)
    );
  }
  return property.values[0] && property.values[0].value;
}

function setPropertyValue(
  property: DynamicObjectProperty,
  value: string,
  dictionary?: DynamicPropertyDictionaryItem[]
) {
  if (dictionary && dictionary.length) {
    const handledValue = handleDictionaryValue(
      property,
      value as string,
      dictionary
    );
    property.values[0] = new DynamicPropertyObjectValue({
      ...handledValue,
      propertyId: property.id,
    });
  } else {
    property.values[0].value = value;
  }
}

async function loadDictionaries(
  property: DynamicObjectProperty,
  keyword?: string,
  skip?: number
) {
  return await searchDictionaryItems(property.id, keyword, skip);
}

defineExpose({
  title,
});
</script>

<style lang="less" scoped></style>
