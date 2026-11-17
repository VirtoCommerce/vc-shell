<template>
  <VcBlade
    :title="isStorage ? current?.name : options?.asset?.name"
    :subtitle="isStorage ? undefined : t('ASSETS.PAGES.DETAILS.SUBTITLE')"
    :toolbar-items="bladeToolbar"
  >
    <VcContainer
      v-if="current"
      no-padding
    >
      <div class="assets-details">
        <AssetsDetailsHeader
          :asset="headerAsset"
          @dimensions="dimensions = $event"
          @copy="copyLink"
        />

        <template v-if="!isStorage && hasFormFields">
          <div class="assets-details__separator" />
          <section class="assets-details__section">
            <h3 class="assets-details__heading">{{ t("ASSETS.PAGES.DETAILS.SECTIONS.METADATA") }}</h3>
            <VcForm class="assets-details__form">
              <Field
                v-if="!isHidden('name')"
                v-slot="{ errorMessage, handleChange, errors }"
                :label="t('ASSETS.PAGES.DETAILS.FIELDS.NAME.TITLE')"
                name="asset_name"
                rules="required"
                :model-value="defaultAsset.name"
              >
                <VcInput
                  v-model="assetNameClean"
                  data-test-id="assets-details-name"
                  :label="t('ASSETS.PAGES.DETAILS.FIELDS.NAME.TITLE')"
                  :suffix="extensionSuffix || undefined"
                  clearable
                  required
                  :error="!!errors.length"
                  :error-message="errorMessage"
                  :placeholder="t('ASSETS.PAGES.DETAILS.FIELDS.NAME.PLACEHOLDER')"
                  :disabled="readonly"
                  @update:model-value="handleChange"
                />
              </Field>
              <VcInput
                v-if="defaultAsset.typeId === 'Image' && !isHidden('altText')"
                v-model="defaultAsset.altText"
                data-test-id="assets-details-alt"
                :label="t('ASSETS.PAGES.DETAILS.FIELDS.ALT.TITLE')"
                clearable
                :placeholder="t('ASSETS.PAGES.DETAILS.FIELDS.ALT.PLACEHOLDER')"
                :tooltip="t('ASSETS.PAGES.DETAILS.FIELDS.ALT.TOOLTIP')"
                :disabled="readonly"
              />
              <VcTextarea
                v-if="!isHidden('description')"
                v-model="defaultAsset.description"
                data-test-id="assets-details-description"
                :label="t('ASSETS.PAGES.DETAILS.FIELDS.DESCRIPTION.TITLE')"
                :placeholder="t('ASSETS.PAGES.DETAILS.FIELDS.DESCRIPTION.PLACEHOLDER')"
                :disabled="readonly"
              />
            </VcForm>
          </section>
        </template>

        <div class="assets-details__separator" />
        <AssetsDetailsInfo
          :title="t('ASSETS.PAGES.DETAILS.SECTIONS.FILE')"
          :rows="fileRows"
        />

        <template v-if="hasExtraInfo">
          <div class="assets-details__separator" />
          <AssetsDetailsInfo
            data-test-id="assets-details-extra-info"
            :rows="extraInfo.items.value"
            :state="extraInfo.state.value"
          />
        </template>
      </div>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts" setup>
import type { IBladeToolbar } from "@core/types";
import type { AssetLike } from "@core/composables/useAssetsManager";
import { computed, ref, unref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { VcBlade } from "@ui/components/organisms/vc-blade";
import { VcContainer } from "@ui/components/atoms/vc-container";
import { VcForm } from "@ui/components/molecules/vc-form";
import { VcInput } from "@ui/components/molecules/vc-input";
import { VcTextarea } from "@ui/components/molecules/vc-textarea";
import { downloadFile, readableSize } from "@core/utilities/assets";
import { formatDateWithPattern } from "@core/utilities/date";
import { notification } from "@core/notifications/notification";
import { useIsFormValid, Field, useForm, useIsFormDirty } from "vee-validate";
import { useBlade } from "@core/composables/useBlade";
import { PlatformPermissions } from "@core/constants/permissions";
import AssetsDetailsHeader from "@modules/assets/components/assets-details/_internal/assets-details-header.vue";
import { safeAbsoluteUrl } from "@modules/assets/components/assets-details/_internal/safe-absolute-url";
import { fileLabel } from "@modules/assets/components/assets-details/_internal/file-label";
import AssetsDetailsInfo from "@modules/assets/components/assets-details/_internal/assets-details-info.vue";
import { useAssetExtraInfo } from "@modules/assets/components/assets-details/_internal/useAssetExtraInfo";
import type { AssetsDetailsOptions, IAssetInfoRow } from "@modules/assets/components/assets-details/types";

defineBlade({
  name: "AssetsDetails",
});

const { options, closeSelf } = useBlade<AssetsDetailsOptions>();

useForm({ validateOnMount: false });
const isValid = useIsFormValid();
const isDirty = useIsFormDirty();
const { t } = useI18n({ useScope: "global" });
const defaultAsset = ref<AssetLike>({ ...options.value?.asset });
const dimensions = ref<string>();

// Storage mode shows a live entry with no form; `assetSource` wins over `asset`.
const isStorage = computed(() => options.value?.assetSource !== undefined);
// `unref`: options that are not markRaw reach us with the computed already unwrapped.
const current = computed<AssetLike | undefined>(() => {
  if (isStorage.value) return unref(options.value?.assetSource);
  return options.value?.asset ? defaultAsset.value : undefined;
});

// Flat mode edits a clone: the header keeps showing the original so a half-typed name does not blank it.
const headerAsset = computed<AssetLike>(() =>
  isStorage.value ? (current.value ?? defaultAsset.value) : (options.value?.asset ?? defaultAsset.value),
);

// Options carry functions and a live ref, so a reload or deep link mounts without them: nothing to show.
watch(
  current,
  (value) => {
    if (!value) void closeSelf();
  },
  { immediate: true },
);

const extraInfo = useAssetExtraInfo(current, () => options.value?.extraInfo);
const hasExtraInfo = computed(() => typeof options.value?.extraInfo === "function");

const readonly = computed(() => options.value?.disabled);
const isHidden = (field: string) => !!options.value?.hiddenFields?.includes(field);
const hasFormFields = computed(
  () =>
    !isHidden("name") || !isHidden("description") || (defaultAsset.value.typeId === "Image" && !isHidden("altText")),
);

// The extension is locked: only the base name is edited, the extension is reattached.
function splitName(name: string | undefined) {
  if (!name) return { base: "", ext: "" };
  const dotIndex = name.lastIndexOf(".");
  return dotIndex > 0 ? { base: name.slice(0, dotIndex), ext: name.slice(dotIndex) } : { base: name, ext: "" };
}

const extensionSuffix = computed(() => splitName(defaultAsset.value.name).ext);

const assetNameClean = computed({
  get: () => splitName(defaultAsset.value.name).base,
  set(value) {
    if (!defaultAsset.value.name) return;
    defaultAsset.value.name = value ? value + extensionSuffix.value : "";
  },
});

const locale = window.navigator.language;

const formatDate = (value: Parameters<typeof formatDateWithPattern>[0]) => formatDateWithPattern(value, "L LT", locale);

const fileRows = computed<IAssetInfoRow[]>(() => {
  const asset = current.value;
  if (!asset) return [];
  const rows: IAssetInfoRow[] = [
    { key: "type", label: t("ASSETS.PAGES.DETAILS.FIELDS.TYPE"), value: asset.contentType || fileLabel(asset.name) },
  ];
  if (asset.size != null) {
    rows.push({ key: "size", label: t("ASSETS.PAGES.DETAILS.FIELDS.SIZE"), value: readableSize(asset.size) });
  }
  if (dimensions.value) {
    rows.push({ key: "dimensions", label: t("ASSETS.PAGES.DETAILS.FIELDS.DIMENSIONS"), value: dimensions.value });
  }
  if (asset.createdDate) {
    rows.push({
      key: "created",
      label: t("ASSETS.PAGES.DETAILS.FIELDS.CREATED_DATE"),
      value: formatDate(asset.createdDate),
    });
  }
  if (isStorage.value && asset.modifiedDate) {
    rows.push({
      key: "modified",
      label: t("ASSETS.PAGES.DETAILS.FIELDS.MODIFIED"),
      value: formatDate(asset.modifiedDate),
    });
  }
  return rows;
});

async function copyLink() {
  const url = current.value?.url;
  if (!url) return;
  try {
    await navigator.clipboard.writeText(safeAbsoluteUrl(url));
    notification.success(t("ASSETS.PAGES.DETAILS.NOTIFY.LINK_COPIED"));
  } catch {
    notification.error(t("ASSETS.PAGES.DETAILS.NOTIFY.COPY_FAILED"));
  }
}

const saveDisabled = computed(() => !isDirty.value || !isValid.value || !!readonly.value);
const deleteDisabled = computed(() => !!readonly.value);

function downloadItem(url: string): IBladeToolbar {
  return {
    id: "download",
    title: t("ASSETS.PAGES.DETAILS.TOOLBAR.DOWNLOAD"),
    icon: "lucide-download",
    clickHandler: () => downloadFile({ url: safeAbsoluteUrl(url), name: headerAsset.value.name }),
  };
}

const bladeToolbar = computed<IBladeToolbar[]>(() => {
  const url = current.value?.url;
  const items: IBladeToolbar[] = [];
  if (!isStorage.value) {
    items.push({
      id: "save",
      title: t("ASSETS.PAGES.DETAILS.TOOLBAR.SAVE"),
      icon: "lucide-save",
      async clickHandler() {
        const handler = options.value?.assetEditHandler;
        if (typeof handler !== "function") return;
        await handler(defaultAsset.value);
        closeSelf();
      },
      disabled: saveDisabled,
    });
  }
  if (url) {
    items.push(downloadItem(url));
    if (isStorage.value) {
      items.push({
        id: "copy-link",
        title: t("ASSETS.PAGES.DETAILS.TOOLBAR.COPY_LINK"),
        icon: "lucide-link",
        clickHandler: () => copyLink(),
      });
    }
  }
  items.push({
    id: "delete",
    title: t("ASSETS.PAGES.DETAILS.TOOLBAR.DELETE"),
    icon: "lucide-trash-2",
    // VcBlade hides items whose permissions the user lacks; flat mode leaves the check to the caller.
    permissions: isStorage.value ? PlatformPermissions.AssetDelete : undefined,
    async clickHandler() {
      const handler = options.value?.assetRemoveHandler;
      const asset = current.value;
      if (typeof handler !== "function" || !asset) return;
      // `false` means the caller cancelled; a rejection leaves the blade open too.
      if ((await handler(asset)) !== false) closeSelf();
    },
    disabled: deleteDisabled,
  });
  return items;
});
</script>

<style lang="scss">
:root {
  --assets-details-border: var(--neutrals-300);
  --assets-details-tile-background: var(--secondary-100);
  --assets-details-checker-light: var(--additional-50);
  // --neutrals-100 equals --additional-50 in the dark theme, which hides the checkerboard.
  --assets-details-checker-dark: var(--secondary-100);
  --assets-details-title-color: var(--neutrals-900);
  --assets-details-chip-background: var(--secondary-100);
  --assets-details-chip-color: var(--neutrals-700);
  --assets-details-muted-color: var(--neutrals-500);
  --assets-details-url-color: var(--neutrals-700);
  --assets-details-copy-hover: var(--primary-500);
  --assets-details-focus-ring: var(--primary-300);
  // Sits on the fixed extension colors, which do not change with the theme.
  --assets-details-tile-ext-color: #ffffff;
}

.assets-details {
  @apply tw-flex tw-flex-col tw-gap-4 tw-p-4;
}

.assets-details__separator {
  @apply tw-h-px tw-bg-[color:var(--assets-details-border)];
}

.assets-details__form {
  @apply tw-flex tw-flex-col tw-gap-4;
}
</style>
