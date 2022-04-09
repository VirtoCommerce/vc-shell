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
              :label="
                $t(
                  'DYNAMIC_CONTENT.PAGES.CONTENT_MANAGE_PROPERTY.FORM.INPUTS.PROPERTY_NAME.LABEL'
                )
              "
              :placeholder="
                $t(
                  'DYNAMIC_CONTENT.PAGES.CONTENT_MANAGE_PROPERTY.FORM.INPUTS.PROPERTY_NAME.PLACEHOLDER'
                )
              "
              v-model="propertyDetails.name"
              :required="true"
            >
            </VcInput>
            <VcRow>
              <VcCol class="vc-margin-bottom_l">
                <VcSwitch
                  v-model="propertyDetails.isRequired"
                  :label="
                    $t(
                      'DYNAMIC_CONTENT.PAGES.CONTENT_MANAGE_PROPERTY.FORM.SWITCHES.REQUIRED'
                    )
                  "
                ></VcSwitch>
              </VcCol>
              <VcCol class="vc-margin-bottom_l">
                <VcSwitch
                  v-model="propertyDetails.isArray"
                  :label="
                    $t(
                      'DYNAMIC_CONTENT.PAGES.CONTENT_MANAGE_PROPERTY.FORM.SWITCHES.MULTIVALUE'
                    )
                  "
                ></VcSwitch>
              </VcCol>
              <VcCol class="vc-margin-bottom_l">
                <VcSwitch
                  :disabled="options.item"
                  v-model="propertyDetails.isMultilingual"
                  :label="
                    $t(
                      'DYNAMIC_CONTENT.PAGES.CONTENT_MANAGE_PROPERTY.FORM.SWITCHES.MULTILINGUAL'
                    )
                  "
                ></VcSwitch>
              </VcCol>
              <VcCol class="vc-margin-bottom_l">
                <VcSwitch
                  :disabled="options.item"
                  v-model="propertyDetails.isDictionary"
                  :label="
                    $t(
                      'DYNAMIC_CONTENT.PAGES.CONTENT_MANAGE_PROPERTY.FORM.SWITCHES.DICTIONARY'
                    )
                  "
                ></VcSwitch>
              </VcCol>
            </VcRow>
            <VcSelect
              :label="
                $t(
                  'DYNAMIC_CONTENT.PAGES.CONTENT_MANAGE_PROPERTY.FORM.VALUE_TYPE'
                )
              "
              class="vc-margin-bottom_l"
              :options="valueOptions"
              :isSearchable="true"
              keyProperty="id"
              displayProperty="title"
              @search="onSearchValueTypes"
              v-model="propertyDetails.valueType"
            >
            </VcSelect>
            <VcInput
              class="vc-margin-bottom_l"
              type="number"
              :label="
                $t(
                  'DYNAMIC_CONTENT.PAGES.CONTENT_MANAGE_PROPERTY.FORM.INPUTS.DISPLAY_ORDER.LABEL'
                )
              "
              :placeholder="
                $t(
                  'DYNAMIC_CONTENT.PAGES.CONTENT_MANAGE_PROPERTY.FORM.INPUTS.DISPLAY_ORDER.PLACEHOLDER'
                )
              "
              v-model="propertyDetails.displayOrder"
            >
            </VcInput>
            <VcInput
              class="vc-margin-bottom_l"
              :label="
                $t(
                  'DYNAMIC_CONTENT.PAGES.CONTENT_MANAGE_PROPERTY.FORM.INPUTS.DESCRIPTION.LABEL'
                )
              "
              :placeholder="
                $t(
                  'DYNAMIC_CONTENT.PAGES.CONTENT_MANAGE_PROPERTY.FORM.INPUTS.DESCRIPTION.PLACEHOLDER'
                )
              "
              v-model="propertyDetails.description"
            >
            </VcInput>
            <div>
              <VcLabel class="vc-margin-bottom_s">
                <span>{{
                  $t(
                    "DYNAMIC_CONTENT.PAGES.CONTENT_MANAGE_PROPERTY.FORM.INPUTS.DISPLAY_NAME.LABEL"
                  )
                }}</span>
              </VcLabel>
              <VcInput
                v-for="(lang, i) in propertyDetails.displayNames"
                :key="`${lang.locale}_${i}`"
                :fieldDescription="lang.locale"
                class="vc-margin-bottom_l"
                v-model="lang.name"
                :placeholder="
                  $t(
                    'DYNAMIC_CONTENT.PAGES.CONTENT_MANAGE_PROPERTY.FORM.INPUTS.DISPLAY_NAME.PLACEHOLDER'
                  )
                "
              >
              </VcInput>
              <VcButton
                :disabled="!propertyDetails.isDictionary"
                class="vc-flex vc-flex-justify_center"
                @click="editDictionaryValues"
                >Dictionary values</VcButton
              >
            </div>
          </VcForm>
        </div>
      </div>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts" setup>
import { IBladeToolbar } from "../../../../types";
import { useI18n } from "@virtoshell/core";
import { useDictionaryItems, useDynamicProperties } from "../../composables";
import { computed, onMounted, reactive, ref } from "vue";
import { DictionaryValues } from "../index";
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
  loading,
  valueTypes,
  propertyDetails,
  handlePropertyDetailsItem,
  resetPropertyEntries,
  handleInitialProperty,
  removeDynamicProperties,
  saveDynamicProperty,
  createDynamicProperty,
  modified,
} = useDynamicProperties();
const { saveDictionaryItems, stagedDictionaryItems } = useDictionaryItems();
const { validate } = useForm({ validateOnMount: false });
const title = computed(() =>
  t("DYNAMIC_CONTENT.PAGES.CONTENT_MANAGE_PROPERTY.TITLE")
);

const valueOptions = ref(valueTypes);

const onSearchValueTypes = (e: string) => {
  valueOptions.value = valueTypes.value.filter((x) =>
    x.title.toLowerCase().includes(e.toLowerCase())
  );
};

const bladeToolbar = reactive<IBladeToolbar[]>([
  {
    id: "save",
    title: t(
      "DYNAMIC_CONTENT.PAGES.CONTENT_MANAGE_PROPERTY.TOOLBAR.SAVE.TITLE"
    ),
    icon: "fas fa-save",
    async clickHandler() {
      const { valid } = await validate();

      if (valid) {
        try {
          if (props.options.item) {
            await saveDynamicProperty(propertyDetails.value);
          } else {
            const property = await createDynamicProperty(propertyDetails.value);

            const populatedItems = stagedDictionaryItems.value.map((item) => {
              item.propertyId = property.id;

              return item;
            });

            await saveDictionaryItems(populatedItems);
          }
          emit("parent:call", {
            method: "reload",
          });
          if (!props.options.item) {
            emit("page:close");
          }
        } catch (err) {
          alert(err.message);
        }
      }
    },
    disabled: computed(() => !modified.value),
  },
  {
    id: "reset",
    title: t("DYNAMIC_CONTENT.PAGES.CONTENT_MANAGE_PROPERTY.TOOLBAR.RESET"),
    icon: "fas fa-undo",
    clickHandler() {
      resetPropertyEntries();
    },
    disabled: computed(() => !modified.value),
    isVisible: !!props.options.item,
  },
  {
    id: "delete",
    title: t("DYNAMIC_CONTENT.PAGES.CONTENT_MANAGE_PROPERTY.TOOLBAR.DELETE"),
    icon: "fas fa-trash",
    async clickHandler() {
      await removeDynamicProperties({ ids: [propertyDetails.value.id] });
      emit("parent:call", {
        method: "reload",
      });
      emit("page:close");
    },
    isVisible: !!props.options.item,
  },
]);

onMounted(async () => {
  if (props.options.item) {
    handlePropertyDetailsItem(props.options.item);
  } else if (props.options.objectType) {
    handleInitialProperty(props.options.objectType);
  }
});

function editDictionaryValues() {
  emit("page:open", {
    component: DictionaryValues,
    param: propertyDetails.value.id,
  });
}

defineExpose({
  title,
});
</script>

<style lang="less" scoped></style>
