<template>
  <VcBlade
    data-test-id="assets-folder-entry-details-blade"
    :title="entry?.name"
    :toolbar-items="bladeToolbar"
  >
    <VcContainer
      v-if="entry"
      no-padding
    >
      <div class="assets-folder-entry-details">
        <div class="assets-folder-entry-details__preview">
          <img
            v-if="isImage(entry.name) && !imageFailed"
            :key="version"
            :src="entry.url"
            :alt="entry.name"
            class="assets-folder-entry-details__image"
            @load="onImageLoad"
            @error="onImageError"
          />
          <div
            v-else
            class="assets-folder-entry-details__badge"
            :style="{ backgroundColor: getExtensionColor(entry.name) }"
          >
            {{ getExtensionLabel(entry.name) }}
          </div>
        </div>

        <div class="assets-folder-entry-details__fields">
          <VcField
            v-for="field in fields"
            :key="field.key"
            :data-test-id="`assets-folder-entry-details-field-${field.key}`"
            :label="field.label"
            :model-value="field.value"
            :copyable="field.copyable"
            orientation="horizontal"
            :aspect-ratio="[1, 2]"
          />

          <div
            v-if="options?.entryInfo"
            class="assets-folder-entry-details__info"
            data-test-id="assets-folder-entry-details-info"
          >
            <div
              v-if="info.status === 'loading'"
              class="assets-folder-entry-details__info-loading"
              data-test-id="assets-folder-entry-details-info-loading"
            >
              <VcSkeleton
                variant="text"
                :rows="2"
              />
            </div>
            <p
              v-else-if="info.status === 'failed'"
              class="assets-folder-entry-details__info-failed"
              data-test-id="assets-folder-entry-details-info-failed"
            >
              {{ t("ASSETS_MANAGER.FOLDER.DETAILS.INFO_FAILED") }}
            </p>
            <template v-else>
              <VcField
                v-for="(item, index) in info.items"
                :key="`${index}-${item.label}`"
                :label="item.label"
                :model-value="item.value"
                orientation="horizontal"
                :aspect-ratio="[1, 2]"
              />
            </template>
          </div>
        </div>
      </div>
    </VcContainer>
  </VcBlade>
</template>

<script setup lang="ts">
import { computed, ref, watch, type ComputedRef } from "vue";
import { useI18n } from "vue-i18n";
import { useBlade } from "@core/composables/useBlade";
import { notification } from "@core/notifications/notification";
import { PlatformPermissions } from "@core/constants/permissions";
import { getExtensionColor, getExtensionLabel, isImage, readableSize } from "@core/utilities/assets";
import { formatDateWithPattern } from "@core/utilities/date";
import type { IBladeToolbar } from "@core/types";
import { VcBlade } from "@ui/components/organisms/vc-blade";
import { VcContainer } from "@ui/components/atoms/vc-container";
import { VcSkeleton } from "@ui/components/atoms/vc-skeleton";
import { VcField } from "@ui/components/molecules/vc-field";
import { absoluteUrl, download } from "./entry-links";
import type { AssetsFolderManagerOptions, BlobEntry, IAssetsFolderInfoItem } from "./types";

interface AssetsFolderEntryDetailsOptions {
  entry: ComputedRef<BlobEntry | undefined>;
  entryInfo?: AssetsFolderManagerOptions["entryInfo"];
  onDelete: (entry: BlobEntry) => Promise<boolean>;
}

defineBlade({
  name: "AssetsFolderEntryDetails",
});

const { options, closeSelf } = useBlade<AssetsFolderEntryDetailsOptions>();
const { t } = useI18n({ useScope: "global" });

const entry = computed(() => options.value?.entry?.value);

// Options carry functions and a live ref, so a reload or deep link mounts without them: nothing to show.
watch(
  entry,
  (current) => {
    if (!current) void closeSelf();
  },
  { immediate: true },
);

// An overwrite keeps the url but changes the date, so both identify the file's content.
const version = computed(() => (entry.value ? `${entry.value.url}|${entry.value.modifiedDate ?? ""}` : undefined));

const dimensions = ref<string>();
// A missing or blocked image shows the extension badge instead of a broken-image glyph.
const imageFailed = ref(false);
watch(version, () => {
  dimensions.value = undefined;
  imageFailed.value = false;
});

function onImageLoad(event: Event) {
  const img = event.target as HTMLImageElement;
  if (img.naturalWidth && img.naturalHeight) dimensions.value = `${img.naturalWidth} × ${img.naturalHeight}`;
}

function onImageError() {
  imageFailed.value = true;
  dimensions.value = undefined;
}

const locale = window.navigator.language;
const formatDate = (value?: string) => (value ? formatDateWithPattern(value, "L LT", locale) : "");

interface DetailsField {
  key: string;
  label: string;
  value: string;
  copyable?: boolean;
}

const fields = computed<DetailsField[]>(() => {
  const current = entry.value;
  if (!current) return [];
  const label = (key: string) => t(`ASSETS_MANAGER.FOLDER.DETAILS.FIELDS.${key}`);
  const list: DetailsField[] = [
    { key: "name", label: label("NAME"), value: current.name },
    { key: "type", label: label("TYPE"), value: current.contentType || getExtensionLabel(current.name) },
    { key: "size", label: label("SIZE"), value: readableSize(current.size ?? 0) },
  ];
  if (dimensions.value) list.push({ key: "dimensions", label: label("DIMENSIONS"), value: dimensions.value });
  list.push(
    { key: "created", label: label("CREATED"), value: formatDate(current.createdDate) },
    { key: "modified", label: label("MODIFIED"), value: formatDate(current.modifiedDate) },
    { key: "url", label: label("URL"), value: absoluteUrl(current.url), copyable: true },
  );
  return list;
});

// --- App rows ---

type InfoState = { status: "loading" } | { status: "failed" } | { status: "ready"; items: IAssetsFolderInfoItem[] };

const info = ref<InfoState>({ status: "ready", items: [] });
let infoRequest = 0;

watch(
  version,
  async () => {
    const current = entry.value;
    const hook = options.value?.entryInfo;
    const request = ++infoRequest;
    if (!current || !hook) {
      info.value = { status: "ready", items: [] };
      return;
    }
    info.value = { status: "loading" };
    try {
      const items = await hook(current);
      if (request === infoRequest) info.value = { status: "ready", items };
    } catch {
      if (request === infoRequest) info.value = { status: "failed" };
    }
  },
  { immediate: true },
);

// --- Toolbar ---

async function copyLink() {
  if (!entry.value) return;
  try {
    await navigator.clipboard.writeText(absoluteUrl(entry.value.url));
    notification.success(t("ASSETS_MANAGER.FOLDER.NOTIFY.LINK_COPIED"));
  } catch (error) {
    notification.error(
      t("ASSETS_MANAGER.FOLDER.NOTIFY.REQUEST_FAILED", {
        message: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}

async function remove() {
  const current = entry.value;
  if (!current || !options.value) return;
  if (await options.value.onDelete(current)) await closeSelf();
}

// VcBlade hides items whose `permissions` the user lacks.
const bladeToolbar: IBladeToolbar[] = [
  {
    id: "download",
    title: computed(() => t("ASSETS_MANAGER.FOLDER.ACTIONS.DOWNLOAD")),
    icon: "lucide-download",
    clickHandler: () => {
      if (entry.value) download(entry.value);
    },
  },
  {
    id: "copy-link",
    title: computed(() => t("ASSETS_MANAGER.FOLDER.ACTIONS.COPY_LINK")),
    icon: "lucide-link",
    clickHandler: () => copyLink(),
  },
  {
    id: "delete",
    title: computed(() => t("ASSETS_MANAGER.FOLDER.ACTIONS.DELETE")),
    icon: "lucide-trash-2",
    permissions: PlatformPermissions.AssetDelete,
    clickHandler: () => remove(),
  },
];
</script>

<style lang="scss">
:root {
  --assets-folder-entry-details-preview-background: var(--secondary-100);
  --assets-folder-entry-details-preview-border: var(--neutrals-300);
  // Sits on the fixed extension colors, which do not change with the theme.
  --assets-folder-entry-details-badge-color: #ffffff;
  --assets-folder-entry-details-separator: var(--neutrals-300);
  --assets-folder-entry-details-muted-color: var(--neutrals-500);
}

.assets-folder-entry-details {
  @apply tw-flex tw-flex-col tw-gap-4 tw-p-4;

  &__preview {
    @apply tw-flex tw-items-center tw-justify-center tw-p-4;
    @apply tw-min-h-[200px] tw-rounded-md;
    @apply tw-border tw-border-solid tw-border-[color:var(--assets-folder-entry-details-preview-border)];
    @apply tw-bg-[color:var(--assets-folder-entry-details-preview-background)];
  }

  &__image {
    // 320px preview minus the block padding.
    @apply tw-block tw-max-w-full tw-max-h-[288px] tw-object-contain;
  }

  &__badge {
    @apply tw-flex tw-items-center tw-justify-center;
    @apply tw-px-6 tw-py-3 tw-rounded-lg;
    @apply tw-text-2xl tw-font-bold tw-tracking-wide;
    @apply tw-text-[color:var(--assets-folder-entry-details-badge-color)];
  }

  &__fields {
    @apply tw-flex tw-flex-col tw-gap-3;

    // A URL or a long file name has no break point: let the value column shrink and wrap it anywhere.
    .vc-field__value {
      @apply tw-min-w-0;
    }

    .vc-field__text {
      overflow-wrap: anywhere;
    }
  }

  &__info {
    @apply tw-flex tw-flex-col tw-gap-3 tw-pt-3;
    @apply tw-border-t tw-border-solid tw-border-[color:var(--assets-folder-entry-details-separator)];
  }

  &__info-failed {
    @apply tw-m-0 tw-text-sm tw-text-[color:var(--assets-folder-entry-details-muted-color)];
  }
}
</style>
