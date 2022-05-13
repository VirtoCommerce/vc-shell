<template>
  <VcBlade
    width="50%"
    :title="title"
    :expanded="expanded"
    :closable="closable"
    v-loading="loading"
    :toolbarItems="bladeToolbar"
    @close="$emit('page:close')"
  >
    <!-- Blade contents -->
    <VcContainer :no-padding="true">
      <div class="grow basis-0">
        <div class="p-4">
          <VcForm>
            <div>
              <VcInput
                class="mb-4"
                :label="
                  $t(
                    'DYNAMIC_CONTENT.PAGES.DICTIONARY_VALUES.FORM.INPUTS.ENTRY_NAME.LABEL'
                  )
                "
                :placeholder="
                  $t(
                    'DYNAMIC_CONTENT.PAGES.DICTIONARY_VALUES.FORM.INPUTS.ENTRY_NAME.PLACEHOLDER'
                  )
                "
                v-model.trim="newEntry.name"
              >
              </VcInput>
              <VcButton @click="addNewEntry" :disabled="!newEntry.name">{{
                $t(
                  "DYNAMIC_CONTENT.PAGES.DICTIONARY_VALUES.FORM.INPUTS.ENTRY_NAME.ADD"
                )
              }}</VcButton>
            </div>
          </VcForm>
        </div>
        <div>
          <VcTable
            :columns="columns"
            :header="false"
            :footer="false"
            :items="dictionaryItemsDetails"
            :multiselect="true"
            @selectionChanged="onSelectionChanged"
          >
            <!-- Name column override -->
            <template v-slot:item_name="itemData">
              <VcInput v-model="itemData.item.name"></VcInput>
            </template>
          </VcTable>
        </div>
      </div>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts" setup>
import { IBladeToolbar, ITableColumns } from "../../../../types";
import { computed, onMounted, reactive, ref } from "vue";
import { useI18n } from "@virtoshell/core";
import { useContentItem, useDictionaryItems } from "../../composables";
import { useForm } from "@virtoshell/ui";
import { DynamicPropertyDictionaryItem } from "@virtoshell/api-client";

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
const emit = defineEmits(["page:close"]);
const {
  searchDictionaryItems,
  dictionaryItemsDetails,
  modified,
  resetDictionaryEntries,
  deleteDictionaryItems,
  saveDictionaryItems,
  loading,
  stageDictionaryItems,
  stagedDictionaryItems,
} = useDictionaryItems();

const { t } = useI18n();
const title = t("DYNAMIC_CONTENT.PAGES.DICTIONARY_VALUES.TITLE");
const selectedDictionaryItemIds = ref<string[]>();
const newEntry = ref(new DynamicPropertyDictionaryItem());
const bladeToolbar = reactive<IBladeToolbar[]>([
  {
    id: "save",
    title: t("DYNAMIC_CONTENT.PAGES.DICTIONARY_VALUES.TOOLBAR.SAVE.TITLE"),
    icon: "fas fa-save",
    async clickHandler() {
      try {
        if (props.param) {
          await saveDictionaryItems(dictionaryItemsDetails.value);
        } else {
          stageDictionaryItems(dictionaryItemsDetails.value);
          emit("page:close");
        }
      } catch (err) {
        alert(err.message);
      }
    },
    disabled: computed(() => props.param && !modified.value),
  },
  {
    id: "reset",
    title: t("DYNAMIC_CONTENT.PAGES.DICTIONARY_VALUES.TOOLBAR.RESET"),
    icon: "fas fa-undo",
    clickHandler() {
      resetDictionaryEntries();
    },
    disabled: computed(() => props.param && !modified.value),
  },
  {
    id: "delete",
    title: t("DYNAMIC_CONTENT.PAGES.DICTIONARY_VALUES.TOOLBAR.DELETE"),
    icon: "fas fa-trash",
    clickHandler() {
      removeDictionaryItems();
    },
    disabled: computed(() => !selectedDictionaryItemIds.value?.length),
  },
]);

const columns = ref<ITableColumns[]>([
  {
    id: "name",
    title: t("DYNAMIC_CONTENT.PAGES.DICTIONARY_VALUES.TABLE.HEADER.NAME"),
  },
]);

const onSelectionChanged = (checkboxes: { [key: string]: boolean }) => {
  selectedDictionaryItemIds.value = Object.entries(checkboxes)
    .filter(([id, isChecked]) => isChecked)
    .map(([id, isChecked]) => id);
};

onMounted(() => {
  reload();
  if (stagedDictionaryItems.value.length) {
    dictionaryItemsDetails.value = stagedDictionaryItems.value;
  }
});

async function reload() {
  if (props.param) {
    await searchDictionaryItems(props.param);
  }
}

async function addNewEntry() {
  dictionaryItemsDetails.value.push({
    ...newEntry.value,
    propertyId: props.param,
  });

  newEntry.value = new DynamicPropertyDictionaryItem();
}

async function removeDictionaryItems() {
  if (
    window.confirm(
      t(
        "DYNAMIC_CONTENT.PAGES.DICTIONARY_VALUES.DELETE_SELECTED_CONFIRMATION",
        {
          count: selectedDictionaryItemIds.value.length,
        }
      )
    )
  ) {
    if (props.param) {
      await deleteDictionaryItems({ ids: selectedDictionaryItemIds.value });
      await reload();
    }
  }
}

defineExpose({
  title,
});
</script>
