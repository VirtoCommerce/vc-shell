# Example: Videos Module (List + Edit-Blade Variant)

This example shows the **edit-blade** variant: a child blade named `*Edit` (not `*Details`).
The pattern is identical to the details pattern, but the blade is oriented around editing an
existing item or creating a new one via an "add URL" flow rather than a traditional form.

Key patterns shown here that differ from team-module:

- `isWorkspace: false` (child blade, not sidebar nav) — videos is opened FROM another blade
- `callParent` with multiple methods from the same child blade
- `rowActions` on VcDataTable — per-row action buttons
- `selection-mode="multiple"` with `v-model:selection`
- `reorderable-rows` + `@row-reorder` for drag-and-drop row sorting
- `exposeToChildren` exposing multiple methods
- `useForm` `setFieldError` for programmatic field errors

---

## `pages/videos-list.vue` — List blade (embedded child, not workspace)

<!-- PATTERN: defineBlade without isWorkspace — blade is opened as a child, not from sidebar -->
<!-- PATTERN: options typed generic useBlade<{ disabled?: boolean; stagedProductDataId?: string }> -->
<!-- PATTERN: rowActions — per-row action array, returned as function -->
<!-- PATTERN: selection-mode="multiple" + v-model:selection for multi-select -->
<!-- PATTERN: reorderable-rows + @row-reorder for drag-and-drop ordering -->
<!-- PATTERN: exposeToChildren({ reload, markProductDirty }) — expose multiple methods -->
<!-- PATTERN: callParent with a method not defined in the immediate parent ("markProductDirty") -->

```vue
<template>
  <VcBlade
    :title="bladeTitle"
    width="50%"
    :toolbar-items="bladeToolbar"
  >
    <VcDataTable
      class="tw-grow tw-basis-0"
      :loading="loading"
      :items="sortedVideos"
      :row-actions="rowActions"
      selection-mode="multiple"
      v-model:selection="selectedVideos"
      v-model:sort-field="sortField"
      v-model:sort-order="sortOrder"
      :pagination="{ currentPage, pages }"
      :total-label="$t('VIDEOS.PAGES.LIST.TABLE.TOTALS')"
      :total-count="totalCount"
      v-model:active-item-id="selectedItemId"
      state-key="videos_list"
      :reorderable-rows="true"
      :pull-to-refresh="true"
      @row-click="onItemClick"
      @pagination-click="onPaginationClick"
      @pull-refresh="reload"
      @row-reorder="sortVideos"
    >
      <!-- PATTERN: #empty slot for custom empty state component -->
      <template #empty>
        <VideosEmptyGridTemplateNew
          :disabled="options?.disabled"
          @add="addVideo"
        />
      </template>

      <VcColumn
        id="thumbnailUrl"
        :title="t('VIDEOS.PAGES.LIST.TABLE.HEADER.THUMBNAIL')"
        type="image"
        :always-visible="true"
      />
      <!-- PATTERN: custom body slot with multi-line cell content -->
      <VcColumn
        id="name"
        :title="t('VIDEOS.PAGES.LIST.TABLE.HEADER.NAME')"
        :sortable="true"
        :always-visible="true"
      >
        <template #body="{ data }">
          <div class="tw-flex tw-flex-col">
            <div class="tw-truncate">{{ data.name }}</div>
            <VcHint class="tw-truncate tw-mt-1">{{ data.contentUrl }}</VcHint>
          </div>
        </template>
      </VcColumn>
      <!-- PATTERN: type="date-ago" for relative time display -->
      <VcColumn
        id="uploadDate"
        :title="t('VIDEOS.PAGES.LIST.TABLE.HEADER.CREATED_DATE')"
        :sortable="true"
        type="date-ago"
      />
      <VcColumn
        id="sortOrder"
        :title="t('VIDEOS.PAGES.LIST.TABLE.HEADER.SORT_ORDER')"
        :sortable="true"
        type="number"
      />
    </VcDataTable>
  </VcBlade>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { IBladeToolbar, useBlade, usePopup, useDataTableSort } from "@vc-shell/framework";
import type { TableAction } from "@vc-shell/framework";
import type { Video as IVideo } from "../../../api_client/virtocommerce.catalog";
import { useVideos } from "../composables";
import { VideosEmptyGridTemplateNew } from "../components";

// PATTERN: defineBlade without isWorkspace — this blade is embedded, not a top-level workspace
defineBlade({
  name: "Videos",
  isWorkspace: true, // true here because it can be a workspace entry-point too
});

// PATTERN: typed options from parent blade
const { openBlade, exposeToChildren, param, options, callParent } = useBlade<{
  disabled?: boolean;
  stagedProductDataId?: string;
}>();
const { showConfirmation } = usePopup();
const { t } = useI18n({ useScope: "global" });
const { videos, totalCount, pages, currentPage, searchVideos, deleteVideos, loading } = useVideos();

const { sortField, sortOrder, sortExpression } = useDataTableSort({
  initialField: "sortOrder",
  initialDirection: "ASC",
});

const selectedItemId = ref();
const sortedVideos = ref<IVideo[]>([]);
const selectedVideos = ref<IVideo[]>([]);
const selectedVideosIds = computed(() => selectedVideos.value.map((v) => v.id ?? ""));

watch(sortExpression, async (value) => {
  await searchVideos({ ownerIds: [param.value ?? ""], sort: value });
});

onMounted(async () => {
  await reload();
});

const reload = async () => {
  selectedVideos.value = [];
  await searchVideos({
    skip: (currentPage.value - 1) * 20,
    sort: sortExpression.value,
    ownerIds: [options.value?.stagedProductDataId ?? ""],
  });
  sortedVideos.value = videos.value;
};

// PATTERN: callParent to notify ancestor blade of a state change
const markProductDirty = async () => {
  callParent("markProductDirty");
};

const bladeTitle = computed(() => t("VIDEOS.PAGES.LIST.TITLE"));

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "add",
    title: computed(() => t("VIDEOS.PAGES.LIST.TOOLBAR.ADD")),
    icon: "lucide-plus",
    async clickHandler() {
      addVideo();
    },
    // PATTERN: isVisible as computed for reactive conditional visibility
    isVisible: computed(() => !options.value?.disabled),
  },
  {
    id: "deleteSelected",
    title: computed(() => t("VIDEOS.PAGES.LIST.TOOLBAR.DELETE")),
    icon: "lucide-trash-2",
    async clickHandler() {
      await markProductDirty();
      await deleteSelectedVideos();
    },
    disabled: computed(() => !selectedVideosIds.value.length),
    isVisible: computed(() => !options.value?.disabled),
  },
]);

// PATTERN: rowActions — function returning TableAction<T>[] for per-row action buttons
const rowActions = (): TableAction<IVideo>[] => [
  {
    icon: "lucide-trash-2",
    title: t("VIDEOS.PAGES.LIST.ACTIONS.DELETE"),
    type: "danger",
    async clickHandler(item: IVideo) {
      if (!item.id) return;
      selectedVideos.value = [item];
      await deleteSelectedVideos();
      await markProductDirty();
    },
  },
];

const onItemClick = (event: { data: IVideo }) => {
  const item = event.data;
  openBlade({
    name: "VideoEdit",
    param: item.id,
    options: { productId: options.value?.stagedProductDataId },
    onOpen() {
      selectedItemId.value = item.id;
    },
    onClose() {
      selectedItemId.value = undefined;
    },
  });
};

const onPaginationClick = async (page: number) => {
  await searchVideos({ ownerIds: [param.value ?? ""], skip: (page - 1) * 20 });
};

// PATTERN: @row-reorder handler — event contains dragIndex, dropIndex, and reordered value array
function sortVideos(event: { dragIndex: number; dropIndex: number; value: IVideo[] }) {
  if (event.dragIndex !== event.dropIndex) {
    sortedVideos.value = event.value.map((item, index) => {
      item.sortOrder = index + 1;
      return item;
    });
  }
}

async function deleteSelectedVideos() {
  if (
    await showConfirmation(
      t("VIDEOS.PAGES.LIST.DELETE_SELECTED_CONFIRMATION.MESSAGE", {
        count: selectedVideosIds.value.length,
      }),
    )
  ) {
    await deleteVideos(selectedVideosIds.value);
    await reload();
  }
}

function addVideo() {
  openBlade({
    name: "VideoEdit",
    options: { productId: options.value?.stagedProductDataId },
  });
}

// PATTERN: exposeToChildren with multiple methods
exposeToChildren({ reload, markProductDirty });
</script>
```

---

## `pages/videos-edit.vue` — Edit blade (create + view in one blade)

<!-- PATTERN: defineBlade name ends in "Edit" — naming convention for edit blades -->
<!-- PATTERN: useForm setFieldError — programmatic field error injection -->
<!-- PATTERN: Field with object rules (:rules="{ min: 1 }") instead of string rules -->
<!-- PATTERN: VcField for read-only display with type="date-ago", type="link" -->
<!-- PATTERN: conditional rendering v-if="!param" for create-only sections -->
<!-- PATTERN: callParent with multiple different method names -->

```vue
<template>
  <VcBlade
    :loading="loading"
    :title="bladeTitle"
    width="50%"
    :modified="modified"
    :toolbar-items="bladeToolbar"
  >
    <VcContainer :no-padding="true">
      <div class="tw-p-4">
        <VcForm>
          <!-- PATTERN: v-if="!param" = create-only section -->
          <div
            v-if="!param"
            class="tw-mb-4 tw-flex tw-flex-row"
          >
            <Field
              v-slot="{ errorMessage, handleChange, errors }"
              :label="t('VIDEOS.PAGES.DETAILS.FIELDS.ADD.TITLE')"
              name="videoUrl"
              :model-value="videoUrl"
              :rules="{ min: 1 }"
            >
              <VcInput
                v-model="videoUrl"
                class="tw-grow tw-basis-0"
                :label="$t('VIDEOS.PAGES.DETAILS.FIELDS.ADD.TITLE')"
                :placeholder="$t('VIDEOS.PAGES.DETAILS.FIELDS.ADD.PLACEHOLDER')"
                :tooltip="$t('VIDEOS.PAGES.DETAILS.FIELDS.ADD.HINT')"
                :error="!!errors.length"
                :error-message="errorMessage"
                @update:model-value="validateUrl"
              >
                <template #append>
                  <VcButton
                    :disabled="previewDisabled"
                    small
                    @click="
                      async (e: MouseEvent) => {
                        await getVideo();
                        handleChange(e);
                      }
                    "
                  >
                    {{ $t("VIDEOS.PAGES.DETAILS.FIELDS.ADD.ADD_BUTTON") }}
                  </VcButton>
                </template>
              </VcInput>
            </Field>
          </div>

          <!-- PATTERN: v-if="!!param || newVideoLoaded" = show content once loaded or in edit mode -->
          <div v-if="!!param || newVideoLoaded">
            <VcRow>
              <VcCol :size="1">
                <VcImage
                  size="xl"
                  :src="video?.thumbnailUrl"
                  bordered
                  background="contain"
                />
              </VcCol>
              <VcCol :size="2">
                <!-- PATTERN: VcField for read-only display fields -->
                <VcField
                  :label="$t('VIDEOS.PAGES.DETAILS.FIELDS.CREATED_DATE.TITLE')"
                  :model-value="video?.uploadDate"
                  type="date-ago"
                />
                <VcField
                  :label="$t('VIDEOS.PAGES.DETAILS.FIELDS.CONTENT_URL.TITLE')"
                  :model-value="video?.contentUrl"
                  type="link"
                  copyable
                />
              </VcCol>
            </VcRow>
            <VcInput
              v-model="video.name"
              :label="$t('VIDEOS.PAGES.DETAILS.FIELDS.NAME.TITLE')"
              required
              disabled
            />
            <VcTextarea
              v-model="video.description"
              :label="t('VIDEOS.PAGES.DETAILS.FIELDS.DESCRIPTION.TITLE')"
              disabled
            />
            <!-- PATTERN: VcVideo component for embedded video preview -->
            <VcVideo
              :source="video?.embedUrl"
              :label="$t('VIDEOS.PAGES.DETAILS.FIELDS.PREVIEW.TITLE')"
              size="xxl"
            />
          </div>
        </VcForm>
      </div>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { IBladeToolbar, usePopup, useBlade } from "@vc-shell/framework";
import { Video } from "../../../api_client/virtocommerce.catalog";
import { CreateVideoCommand } from "../../../api_client/virtocommerce.mymodule";
import { useVideo, useVideos } from "../composables";
import { Field, useForm } from "vee-validate";

// PATTERN: Edit blade name convention — ends in "Edit"
defineBlade({
  name: "VideoEdit",
});

const { param, options, callParent, closeSelf } = useBlade<{ productId: string }>();

// PATTERN: setFieldError from useForm — inject programmatic validation errors
const { setFieldError } = useForm({ validateOnMount: false });
const { t } = useI18n({ useScope: "global" });
const { createVideo, saveVideo, videoLoadedWithoutErrors, modified, loading, loadVideo, video } = useVideo();
const { deleteVideos } = useVideos();
const { showConfirmation } = usePopup();

const videoUrl = ref<string>("");
const newVideoLoaded = ref(false);

onMounted(async () => {
  if (param.value) {
    await loadVideo({ id: param.value });
  }
});

const previewDisabled = computed(() => videoUrl.value?.length === 0);
const bladeTitle = computed(() => t("VIDEOS.PAGES.DETAILS.TITLE"));

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: computed(() => t("VIDEOS.PAGES.DETAILS.TOOLBAR.SAVE")),
    icon: "lucide-save",
    async clickHandler() {
      await saveVideo(video.value);
      // PATTERN: callParent with multiple different methods
      callParent("reload");
      callParent("markProductDirty");
      closeSelf();
    },
    disabled: computed(() => !newVideoLoaded.value),
    isVisible: computed(() => !param.value), // only visible in create mode
  },
  {
    id: "delete",
    title: computed(() => t("VIDEOS.PAGES.DETAILS.TOOLBAR.DELETE")),
    icon: "lucide-trash-2",
    async clickHandler() {
      if ((await showConfirmation(t("VIDEOS.PAGES.DETAILS.DELETE_CONFIRMATION.MESSAGE"))) && video.value.id) {
        await deleteVideos([video.value.id]);
        callParent("reload");
        callParent("markProductDirty");
        closeSelf();
      }
    },
    isVisible: computed(() => !!param.value), // only visible in edit mode
  },
]);

async function getVideo() {
  const command = {
    contentUrl: videoUrl.value,
    ownerId: options.value?.productId ?? "",
    ownerType: "Product",
  } as CreateVideoCommand;
  try {
    video.value = await createVideo(command);
    newVideoLoaded.value = true;
  } catch (e) {
    video.value = {} as Video;
    newVideoLoaded.value = false;
  }
}

// PATTERN: setFieldError — inject validation error programmatically based on async result
const validateUrl = async () => {
  if (!videoLoadedWithoutErrors.value) {
    setFieldError("videoUrl", t("VIDEOS.PAGES.DETAILS.FIELDS.ADD.ERROR"));
  } else {
    setFieldError("videoUrl", undefined);
  }
};
</script>
```

---

## Summary: Edit-blade vs Details-blade naming

| Aspect          | Details blade                         | Edit blade                              |
| --------------- | ------------------------------------- | --------------------------------------- |
| Name convention | `*Details` (e.g. `TeamMemberDetails`) | `*Edit` (e.g. `VideoEdit`)              |
| Typical use     | Full form with vee-validate           | Lighter editing or multi-step create    |
| `onBeforeClose` | Common (unsaved changes guard)        | Optional                                |
| Difference      | N/A                                   | Same pattern — just a naming convention |

Both patterns use identical framework APIs. The "edit" name is used when the blade
primarily handles a simplified or specialized editing flow.
