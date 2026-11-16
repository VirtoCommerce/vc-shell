<template>
  <VcBlade
    data-test-id="assets-folder-manager-blade"
    :title="bladeTitle"
    :toolbar-items="bladeToolbar"
    width="70%"
  >
    <div
      v-loading="loading"
      class="assets-folder-manager tw-relative tw-h-full tw-flex tw-flex-col"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop.prevent.stop="onDrop"
    >
      <div class="assets-folder-manager__bar">
        <VcBreadcrumbs
          class="assets-folder-manager__breadcrumbs"
          :items="crumbs"
          separated
        />
        <VcInput
          v-model="searchText"
          class="assets-folder-manager__search"
          size="small"
          clearable
          :debounce="300"
          :placeholder="t('ASSETS_MANAGER.FOLDER.SEARCH_PLACEHOLDER')"
          :aria-label="t('ASSETS_MANAGER.FOLDER.SEARCH_PLACEHOLDER')"
          data-test-id="assets-folder-manager-search"
          @update:model-value="onSearch(String($event ?? ''))"
        >
          <template #prepend-inner>
            <VcIcon
              icon="lucide-search"
              size="s"
              class="assets-folder-manager__search-icon"
            />
          </template>
        </VcInput>
        <VcButtonGroup
          attached
          role="group"
          class="assets-folder-manager__views"
        >
          <VcButton
            v-for="option in viewOptions"
            :key="option.view"
            variant="outline"
            size="xs"
            :icon="option.icon"
            :selected="view === option.view"
            :aria-pressed="view === option.view"
            :aria-label="option.label"
            :title="option.label"
            :data-test-id="`assets-folder-manager-view-${option.view}`"
            @click="setView(option.view)"
          />
        </VcButtonGroup>
      </div>

      <template v-if="view === 'grid'">
        <div class="assets-folder-manager__grid">
          <AssetsFolderGrid
            v-if="pageItems.length"
            v-model:selection="selection"
            :items="pageItems"
            :selectable="canDelete"
            :active-url="activeUrl"
            :drop-target-url="dropTargetUrl"
            :actions="rowActions"
            @open="onRowClick"
            @folder-dragover="onFolderDragOver"
            @folder-dragleave="onFolderDragLeave"
            @folder-drop="onFolderDrop"
          />
          <AssetsFolderState
            v-else-if="!loading"
            :state="keyword ? notFoundState : emptyState"
          />
        </div>
        <div
          v-if="pageItems.length"
          class="assets-folder-manager__pagination"
        >
          <span class="assets-folder-manager__page-info">
            {{ t("COMPONENTS.ORGANISMS.VC_TABLE.PAGE") }} {{ page }} {{ t("COMPONENTS.ORGANISMS.VC_TABLE.OF") }}
            {{ pageCount }}
          </span>
          <VcPagination
            :pages="pageCount"
            :current-page="page"
            @item-click="page = $event"
          />
        </div>
      </template>

      <!-- @vue-generic {BlobEntry} -->
      <VcDataTable
        v-else
        v-model:selection="selection"
        :items="pageItems"
        data-key="url"
        :search-value="keyword ?? ''"
        :active-item-id="activeUrl"
        :selection-mode="canDelete ? 'multiple' : undefined"
        :row-actions="rowActions"
        :pagination="pagination"
        :empty-state="emptyState"
        :not-found-state="notFoundState"
        @row-click="({ data }) => onRowClick(data)"
        @pagination-click="page = $event"
      >
        <VcColumn
          id="preview"
          title=""
          width="64px"
          mobile-role="image"
          always-visible
        >
          <template #body="{ data }">
            <div
              class="assets-folder-manager__preview"
              :class="{ 'assets-folder-manager__drop-target': isDropTarget(data) }"
              :data-folder-url="data.type === 'folder' ? folderUrlOf(data) : undefined"
            >
              <VcIcon
                v-if="data.type === 'folder'"
                icon="lucide-folder"
                size="xxl"
                class="assets-folder-manager__folder-icon"
              />
              <AssetPreviewCell
                v-else
                :name="data.name"
                :url="data.url"
              />
            </div>
          </template>
        </VcColumn>

        <VcColumn
          id="name"
          :title="t('ASSETS_MANAGER.FOLDER.TABLE.HEADER.NAME')"
          mobile-role="title"
          always-visible
        >
          <template #body="{ data }">
            <span
              class="assets-folder-manager__name"
              :class="{
                'assets-folder-manager__name--folder': data.type === 'folder',
                'assets-folder-manager__drop-target': isDropTarget(data),
              }"
              :data-folder-url="data.type === 'folder' ? folderUrlOf(data) : undefined"
              :title="data.name"
            >
              {{ data.name }}
            </span>
          </template>
        </VcColumn>

        <VcColumn
          id="size"
          :title="t('ASSETS_MANAGER.FOLDER.TABLE.HEADER.SIZE')"
          width="140px"
          mobile-role="field"
          always-visible
        >
          <template #body="{ data }">
            <span class="assets-folder-manager__muted">
              {{ data.type === "folder" ? "—" : readableSize(data.size ?? 0) }}
            </span>
          </template>
        </VcColumn>

        <VcColumn
          id="modifiedDate"
          :title="t('ASSETS_MANAGER.FOLDER.TABLE.HEADER.MODIFIED_DATE')"
          width="180px"
          type="date-ago"
          mobile-role="field"
          always-visible
        />
      </VcDataTable>
    </div>

    <input
      ref="fileInput"
      type="file"
      hidden
      multiple
      data-test-id="assets-folder-manager-file-input"
      @change="onFilesPicked"
    />
  </VcBlade>
</template>

<script setup lang="ts">
import { computed, markRaw, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useBlade } from "@core/composables/useBlade";
import { usePermissions } from "@core/composables/usePermissions";
import { usePopup } from "@core/composables/usePopup";
import { notification } from "@core/notifications/notification";
import { readableSize } from "@core/utilities/assets";
import type { Breadcrumbs, IBladeToolbar } from "@core/types";
import type { DataTablePagination, TableAction, TableStateConfig } from "@ui/components/organisms/vc-data-table/types";
import {
  VcBlade,
  VcBreadcrumbs,
  VcButton,
  VcButtonGroup,
  VcColumn,
  VcDataTable,
  VcIcon,
  VcInput,
  VcPagination,
} from "@ui/components";
import { vLoading } from "@core/directives";
import { PlatformPermissions } from "@core/constants/permissions";
import AssetPreviewCell from "../_internal/asset-preview-cell.vue";
import NewFolderPopup from "./_internal/new-folder-popup.vue";
import UploadUrlPopup from "./_internal/upload-url-popup.vue";
import OverwritePopup from "./_internal/overwrite-popup.vue";
import AssetsFolderGrid from "./_internal/assets-folder-grid.vue";
import AssetsFolderState from "./_internal/assets-folder-state.vue";
import { folderUrlOf, useAssetsFolder } from "./useAssetsFolder";
import { absoluteUrl, download } from "./entry-links";
import type { CollisionDecision } from "./collisions";
import type { AssetsFolderManagerOptions, BlobEntry } from "./types";

defineBlade({
  name: "AssetsFolderManager",
});

const PAGE_SIZE = 20;
// Past this many, the delete confirmation shows a count instead of names.
const MAX_NAMED_ITEMS = 3;

const { options, openBlade, closeChildren } = useBlade<AssetsFolderManagerOptions>();
const { t } = useI18n({ useScope: "global" });
const { hasAccess } = usePermissions();
const { showConfirmation } = usePopup();

const canCreate = computed(() => hasAccess(PlatformPermissions.AssetCreate));
const canDelete = computed(() => hasAccess(PlatformPermissions.AssetDelete));

const bladeTitle = computed(() => options.value?.title || t("ASSETS_MANAGER.FOLDER.TITLE"));

const {
  currentUrl,
  entries,
  keyword,
  loading,
  breadcrumbs,
  load,
  open,
  goTo,
  search,
  createFolder,
  upload,
  uploadFromUrl,
  remove,
} = useAssetsFolder(options.value!.rootUrl, bladeTitle);

const page = ref(1);
const selection = ref<BlobEntry[]>([]);
const fileInput = ref<HTMLInputElement>();

// Owned by the blade so a resolved search never overwrites newer typing; cleared only on navigation.
const searchText = ref("");
watch(currentUrl, () => {
  searchText.value = "";
});

const pageCount = computed(() => Math.max(1, Math.ceil(entries.value.length / PAGE_SIZE)));
const pageItems = computed(() => entries.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE));
const pagination = computed<DataTablePagination>(() => ({
  currentPage: page.value,
  pages: pageCount.value,
  pageSize: PAGE_SIZE,
}));

// --- View ---

type FolderView = "table" | "grid";
const VIEW_STORAGE_KEY = "VC_ASSETS_FOLDER_MANAGER_VIEW";

// Storage can be missing or blocked; any failure leaves the default table.
function readView(): FolderView {
  try {
    return localStorage.getItem(VIEW_STORAGE_KEY) === "grid" ? "grid" : "table";
  } catch {
    return "table";
  }
}

const view = ref<FolderView>(readView());

function setView(next: FolderView) {
  view.value = next;
  try {
    localStorage.setItem(VIEW_STORAGE_KEY, next);
  } catch {
    // the choice still applies for this session
  }
}

const viewOptions = computed(() => [
  { view: "table" as const, icon: "lucide-list", label: t("ASSETS_MANAGER.FOLDER.VIEW.TABLE") },
  { view: "grid" as const, icon: "lucide-layout-grid", label: t("ASSETS_MANAGER.FOLDER.VIEW.GRID") },
]);

// A reload replaces every entry object, so a kept selection would point at stale or foreign items.
watch(entries, () => {
  page.value = 1;
  selection.value = [];
});

const crumbs = computed<Breadcrumbs[]>(() =>
  breadcrumbs.value.map((crumb, index, all) => ({
    id: crumb.url,
    title: crumb.name,
    icon: index === 0 ? "lucide-hard-drive" : undefined,
    // the current folder is the last crumb and not a link
    clickHandler: index === all.length - 1 ? undefined : (id: string) => void navigate(() => goTo(id)),
  })),
);

const notFoundState = computed<TableStateConfig>(() => ({
  icon: "lucide-search-x",
  title: t("ASSETS_MANAGER.FOLDER.NOT_FOUND"),
}));

const emptyState = computed<TableStateConfig>(() => ({
  icon: "lucide-folder-open",
  title: t("ASSETS_MANAGER.FOLDER.EMPTY.TITLE"),
  ...(canCreate.value ? { actionLabel: t("ASSETS_MANAGER.FOLDER.EMPTY.UPLOAD"), actionHandler: pickFiles } : {}),
}));

function notifyRequestFailed(error: unknown) {
  notification.error(
    t("ASSETS_MANAGER.FOLDER.NOTIFY.REQUEST_FAILED", {
      message: error instanceof Error ? error.message : String(error),
    }),
  );
}

async function run(action: () => Promise<unknown>): Promise<void> {
  try {
    await action();
  } catch (error) {
    notifyRequestFailed(error);
  }
}

// Leaving the current level closes the details blade: its entry belongs to this level.
function navigate(action: () => Promise<unknown>): Promise<void> {
  void closeChildren();
  return run(action);
}

function onRowClick(entry: BlobEntry) {
  if (entry.type === "folder") void navigate(() => open(entry));
  else openDetails(entry);
}

function onSearch(text: string) {
  void navigate(() => search(text.trim() || undefined));
}

// --- Details ---

// Drives the highlight only; each details blade follows its own url.
const activeUrl = ref<string | undefined>();
// Opening another file closes the previous details first; only the latest open may clear the highlight.
let detailsToken: symbol | undefined;

function clearActive(token: symbol) {
  if (detailsToken !== token) return;
  detailsToken = undefined;
  activeUrl.value = undefined;
}

function openDetails(entry: BlobEntry) {
  const { url } = entry;
  const token = Symbol(url);
  detailsToken = token;
  activeUrl.value = url;
  // Follows reloads: the details get the fresh object, or undefined (and close) once the url is gone.
  const detailsEntry = computed(() => entries.value.find((e) => e.url === url));
  void run(async () => {
    try {
      await openBlade({
        name: "AssetsFolderEntryDetails",
        options: markRaw({
          entry: detailsEntry,
          entryInfo: options.value?.entryInfo,
          onDelete: (target: BlobEntry) => deleteEntries([target]),
        }),
        onClose: () => clearActive(token),
      });
    } catch (error) {
      clearActive(token);
      throw error;
    }
  });
}

// --- New folder / upload from URL ---

const { open: openNewFolder, close: closeNewFolder } = usePopup({
  component: NewFolderPopup,
  emits: {
    onConfirm: (name: string) => {
      closeNewFolder();
      void run(() => createFolder(name));
    },
    onCancel: () => closeNewFolder(),
  },
});

const { open: openUploadUrl, close: closeUploadUrl } = usePopup({
  component: UploadUrlPopup,
  emits: {
    onConfirm: (url: string) => {
      closeUploadUrl();
      void enqueueUpload(() => run(() => uploadFromUrl(url)));
    },
    onCancel: () => closeUploadUrl(),
  },
});

// --- Upload ---

// Uploads run one at a time: each one's collision check and popups must finish before the next starts.
let uploadQueue: Promise<void> = Promise.resolve();

function enqueueUpload(task: () => Promise<void>): Promise<void> {
  const next = uploadQueue.then(task);
  uploadQueue = next.catch(() => {});
  return next;
}

const collisionName = ref("");
let settleCollision: ((decision: CollisionDecision) => void) | undefined;

function settle(decision: CollisionDecision) {
  closeOverwrite();
  const resolve = settleCollision;
  settleCollision = undefined;
  resolve?.(decision);
}

const { open: openOverwrite, close: closeOverwrite } = usePopup(
  computed(() => ({
    component: OverwritePopup,
    props: { name: collisionName.value },
    emits: {
      onConfirm: (decision: CollisionDecision) => settle(decision),
      onCancel: () => settle({ action: "skip" }),
    },
  })),
);

// upload() asks one collision at a time and uploads are queued, so a single pending resolver is enough.
function resolveCollision(_file: File, name: string): Promise<CollisionDecision> {
  collisionName.value = name;
  return new Promise((resolve) => {
    settleCollision = resolve;
    openOverwrite();
  });
}

function uploadFiles(files: File[], targetUrl?: string) {
  if (!files.length) return;
  void enqueueUpload(() =>
    run(async () => {
      const { uploaded, failed } = await upload(files, resolveCollision, targetUrl);
      if (failed) {
        notification.error(t("ASSETS_MANAGER.FOLDER.NOTIFY.UPLOAD_FAILED", { failed, total: uploaded + failed }));
      }
    }),
  );
}

function pickFiles() {
  if (!fileInput.value) return;
  fileInput.value.value = "";
  fileInput.value.click();
}

function onFilesPicked(event: Event) {
  uploadFiles(Array.from((event.target as HTMLInputElement).files ?? []));
}

// Url of the folder row being dragged over; drives the highlight.
const dropTargetUrl = ref<string | undefined>();

const isDropTarget = (entry: BlobEntry) => entry.type === "folder" && dropTargetUrl.value === folderUrlOf(entry);

function setDropEffect(event: DragEvent) {
  if (event.dataTransfer) event.dataTransfer.dropEffect = canCreate.value ? "copy" : "none";
}

// Without preventDefault on every dragover the browser never fires drop.
function onFolderDragOver(entry: BlobEntry, event: DragEvent) {
  event.preventDefault();
  setDropEffect(event);
  dropTargetUrl.value = canCreate.value ? folderUrlOf(entry) : undefined;
}

function onFolderDragLeave(entry: BlobEntry, event: DragEvent) {
  // currentTarget is the blade surface or the grid card: a leave towards anywhere inside it is not a leave;
  // dragover re-targets.
  const holder = event.currentTarget instanceof Element ? event.currentTarget : null;
  if (event.relatedTarget instanceof Node && holder?.contains(event.relatedTarget)) return;
  if (dropTargetUrl.value === folderUrlOf(entry)) dropTargetUrl.value = undefined;
}

function onFolderDrop(entry: BlobEntry, event: DragEvent) {
  dropTargetUrl.value = undefined;
  if (!canCreate.value) return;
  uploadFiles(Array.from(event.dataTransfer?.files ?? []), folderUrlOf(entry));
}

// The surface handlers pick the folder under the pointer, so a drop uploads exactly once.
function folderUnder(event: Event): BlobEntry | undefined {
  const url = (event.target instanceof Element ? event.target.closest("[data-folder-url]") : null)?.getAttribute(
    "data-folder-url",
  );
  return url ? entries.value.find((e) => e.type === "folder" && folderUrlOf(e) === url) : undefined;
}

function onDragOver(event: DragEvent) {
  const folder = folderUnder(event);
  if (folder) return onFolderDragOver(folder, event);
  event.preventDefault();
  setDropEffect(event);
  dropTargetUrl.value = undefined;
}

function onDragLeave(event: DragEvent) {
  const folder = folderUnder(event);
  if (folder) onFolderDragLeave(folder, event);
}

function onDrop(event: DragEvent) {
  const folder = folderUnder(event);
  if (folder) return onFolderDrop(folder, event);
  if (!canCreate.value) return;
  uploadFiles(Array.from(event.dataTransfer?.files ?? []));
}

// --- Delete ---

function deleteMessage(items: BlobEntry[]): string {
  const names =
    items.length > MAX_NAMED_ITEMS
      ? t("ASSETS_MANAGER.FOLDER.ITEMS_COUNT", { count: items.length })
      : items.map((item) => item.name).join(", ");
  const key = items.some((item) => item.type === "folder") ? "CONFIRM_DELETE_FOLDERS" : "CONFIRM_DELETE";
  return t(`ASSETS_MANAGER.FOLDER.${key}`, { items: names });
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

// Resolves true when the entries were removed; false on cancel or any failure.
async function deleteEntries(entries: BlobEntry[]): Promise<boolean> {
  if (!entries.length) return false;
  const message = deleteMessage(entries);
  let warning: string | undefined;
  try {
    warning = await options.value?.beforeDelete?.(entries);
  } catch (error) {
    notifyRequestFailed(error);
    return false;
  }
  // Entry names and the hook text are untrusted, so the html path escapes both parts.
  const confirmed = warning
    ? await showConfirmation(`<p>${escapeHtml(message)}</p><p class="tw-mt-2">${escapeHtml(warning)}</p>`, {
        html: true,
      })
    : await showConfirmation(message);
  if (!confirmed) return false;
  try {
    await remove(entries);
  } catch (error) {
    notifyRequestFailed(error);
    return false;
  }
  selection.value = [];
  return true;
}

// --- Row actions ---

async function copyLink(entry: BlobEntry) {
  await navigator.clipboard.writeText(absoluteUrl(entry.url));
  notification.success(t("ASSETS_MANAGER.FOLDER.NOTIFY.LINK_COPIED"));
}

function rowActions(entry: BlobEntry): TableAction[] {
  const isFolder = entry.type === "folder";
  const actions: TableAction[] = [];
  if (!isFolder) {
    actions.push({
      id: "download",
      icon: "lucide-download",
      title: t("ASSETS_MANAGER.FOLDER.ACTIONS.DOWNLOAD"),
      type: "info",
      clickHandler: () => download(entry),
    });
  }
  actions.push({
    id: "copy-link",
    icon: "lucide-link",
    title: t("ASSETS_MANAGER.FOLDER.ACTIONS.COPY_LINK"),
    type: "info",
    clickHandler: () => void run(() => copyLink(entry)),
  });
  if (canDelete.value) {
    actions.push({
      id: "delete",
      icon: "lucide-trash-2",
      title: t("ASSETS_MANAGER.FOLDER.ACTIONS.DELETE"),
      type: "danger",
      clickHandler: () => void deleteEntries([entry]),
    });
  }
  if (isFolder) {
    const allowed = (options.value?.folderActions ?? []).filter((action) => hasAccess(action.permission));
    for (const action of allowed) {
      actions.push({
        id: action.id,
        icon: action.icon ?? "lucide-folder-cog",
        title: action.title,
        type: "info",
        clickHandler: () => void run(async () => action.clickHandler(entry, { reload: load })),
      });
    }
  }
  return actions;
}

// --- Toolbar ---

// VcBlade hides items whose `permissions` the user lacks.
const bladeToolbar: IBladeToolbar[] = [
  {
    id: "refresh",
    title: computed(() => t("ASSETS_MANAGER.FOLDER.TOOLBAR.REFRESH")),
    icon: "lucide-refresh-cw",
    clickHandler() {
      void run(load);
    },
  },
  {
    id: "new-folder",
    title: computed(() => t("ASSETS_MANAGER.FOLDER.TOOLBAR.NEW_FOLDER")),
    icon: "lucide-folder-plus",
    permissions: PlatformPermissions.AssetCreate,
    clickHandler: () => openNewFolder(),
  },
  {
    id: "upload",
    title: computed(() => t("ASSETS_MANAGER.FOLDER.TOOLBAR.UPLOAD")),
    icon: "lucide-upload",
    permissions: PlatformPermissions.AssetCreate,
    clickHandler: () => pickFiles(),
  },
  {
    id: "upload-url",
    title: computed(() => t("ASSETS_MANAGER.FOLDER.TOOLBAR.UPLOAD_FROM_URL")),
    icon: "lucide-link",
    permissions: PlatformPermissions.AssetCreate,
    clickHandler: () => openUploadUrl(),
  },
  {
    id: "delete",
    title: computed(() => t("ASSETS_MANAGER.FOLDER.TOOLBAR.DELETE")),
    icon: "lucide-trash-2",
    permissions: PlatformPermissions.AssetDelete,
    disabled: computed(() => !selection.value.length),
    clickHandler: () => void deleteEntries(selection.value),
  },
];

onMounted(() => run(load));
</script>

<style lang="scss">
:root {
  --assets-folder-manager-bar-background: var(--additional-50);
  --assets-folder-manager-bar-border: var(--neutrals-300);
  --assets-folder-manager-folder-color: var(--primary-500);
  --assets-folder-manager-folder-fill: var(--primary-100);
  --assets-folder-manager-muted-color: var(--neutrals-500);
  --assets-folder-manager-drop-outline: var(--primary-500);
  --assets-folder-manager-drop-background: var(--primary-50);
}

.assets-folder-manager {
  &__bar {
    @apply tw-flex tw-flex-wrap tw-items-center tw-gap-x-4 tw-gap-y-2 tw-shrink-0;
    @apply tw-px-4 tw-py-2;
    @apply tw-border-b tw-border-solid tw-border-[color:var(--assets-folder-manager-bar-border)];
    @apply tw-bg-[color:var(--assets-folder-manager-bar-background)];
  }

  // VcDataTable does not forward `class` to its root, so size it from here.
  > .vc-data-table {
    @apply tw-flex-1 tw-min-h-0 tw-w-full;
  }

  // On phones the crumbs take their own row and the search shares the next one with the view toggle.
  &__breadcrumbs {
    @apply tw-w-full tw-min-w-0 sm:tw-w-auto sm:tw-flex-1;
  }

  &__search {
    @apply tw-flex-1 tw-min-w-0 sm:tw-flex-none sm:tw-w-64;
  }

  &__views {
    @apply tw-shrink-0;
  }

  &__grid {
    @apply tw-flex tw-flex-col tw-flex-1 tw-min-h-0 tw-overflow-y-auto;
  }

  &__pagination {
    @apply tw-flex tw-shrink-0 tw-items-center tw-justify-between tw-gap-4 tw-px-4 tw-py-[11px];
    @apply tw-border-t tw-border-solid tw-border-[color:var(--assets-folder-manager-bar-border)];
  }

  &__page-info {
    @apply tw-text-sm tw-text-[color:var(--assets-folder-manager-muted-color)];
  }

  &__search-icon {
    @apply tw-text-[color:var(--assets-folder-manager-muted-color)];
  }

  &__preview {
    @apply tw-flex tw-items-center tw-justify-center tw-w-10 tw-h-10;
  }

  // VcIcon puts the class on the <svg> itself; the inner selector covers a wrapper too.
  &__folder-icon,
  &__folder-icon svg {
    @apply tw-text-[color:var(--assets-folder-manager-folder-color)];
    fill: var(--assets-folder-manager-folder-fill);
  }

  &__name {
    @apply tw-block tw-truncate;

    &--folder {
      @apply tw-font-semibold;
    }
  }

  // Row-level highlight: the table gives no class hook, so select the row from its marked cell.
  // :has() adds its argument's specificity; the tripled row class reaches (0,5,0) to outrank the striped even-row rule.
  .vc-table-composition__row.vc-table-composition__row.vc-table-composition__row:has(
      .assets-folder-manager__drop-target
    ) {
    @apply tw-bg-[color:var(--assets-folder-manager-drop-background)];
    outline: 2px dashed var(--assets-folder-manager-drop-outline);
    outline-offset: -2px;
  }

  &__muted {
    @apply tw-text-[color:var(--assets-folder-manager-muted-color)];
  }
}
</style>
