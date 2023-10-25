<template>
  <VcBlade
    v-loading="videoLoading"
    :title="t('VIDEOS.PAGES.DETAILS.TITLE')"
    width="50%"
    :expanded="expanded"
    :closable="closable"
    :toolbar-items="bladeToolbar"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <!-- Blade contents -->
    <VcContainer
      ref="container"
      :no-padding="true"
    >
      <div class="videos-edit__inner tw-grow tw-basis-0 tw-overflow-hidden">
        <div class="tw-p-4">
          <VcForm>
            <!-- Add Video URL -->
            <div
              v-if="isNew"
              class="tw-mb-4 tw-flex tw-flex-row"
            >
              <Field
                v-slot="{ errorMessage, handleChange, errors }"
                :label="t('VIDEOS.PAGES.DETAILS.FIELDS.ADD.TITLE')"
                name="video_add"
                :rules="validateYoutubeUrl"
              >
                <VcInput
                  v-model="videoUrl"
                  class="tw-grow tw-basis-0"
                  :label="$t('VIDEOS.PAGES.DETAILS.FIELDS.ADD.TITLE')"
                  :placeholder="$t('VIDEOS.PAGES.DETAILS.FIELDS.ADD.PLACEHOLDER')"
                  :tooltip="$t('VIDEOS.PAGES.DETAILS.FIELDS.ADD.HINT')"
                  :disabled="!isNew"
                  :error="!!errors.length"
                  :error-message="errorMessage"
                ></VcInput>
                <div class="tw-items-top tw-h-full">
                  <VcButton
                    :disabled="!videoUrl"
                    class="tw-ml-4 tw-mt-[29px]"
                    small
                    @click="
                      async (e) => {
                        await getVideo();
                        handleChange(e);
                      }
                    "
                  >
                    {{ $t("VIDEOS.PAGES.DETAILS.FIELDS.ADD.ADD_BUTTON") }}
                  </VcButton>
                </div>
              </Field>
            </div>
            <div v-if="!isNew || newVideoLoaded">
              <!-- Thumbnail and specs -->
              <div class="tw-p-2">
                <VcRow>
                  <VcCol
                    class="tw-p-2 content-center items-center"
                    size="1"
                  >
                    <VcImage
                      class="tw-shrink-0"
                      size="xxl"
                      :src="videoDetails?.thumbnailUrl"
                      :bordered="true"
                      background="contain"
                    ></VcImage>
                  </VcCol>
                  <VcCol
                    class="tw-p-2"
                    size="2"
                  >
                    <div class="tw-grow tw-basis-0">
                      <VcLabel class="tw-mt-2">
                        <span>{{ $t("VIDEOS.PAGES.DETAILS.FIELDS.CREATED_DATE.TITLE") }}</span>
                      </VcLabel>
                      <VcHint class="tw-flex-col">{{ moment(videoDetails?.uploadDate).fromNow() }} </VcHint>
                    </div>
                    <div class="tw-grow tw-basis-0">
                      <VcLabel class="tw-mt-2">
                        <span>{{ $t("VIDEOS.PAGES.DETAILS.FIELDS.CONTENT_URL.TITLE") }}</span>
                      </VcLabel>
                      <div class="tw-flex tw-flex-row tw-justify-stretch tw-truncate">
                        <div class="tw-truncate">
                          <VcLink
                            class="vc-link tw-text-s tw-truncate tw-w-full"
                            @click="openLink(videoDetails?.contentUrl)"
                            >{{ videoDetails?.contentUrl }}</VcLink
                          >
                        </div>
                        <VcButton
                          icon="far fa-copy"
                          size="m"
                          class="tw-ml-2"
                          text
                          :title="t('VIDEOS.PAGES.DETAILS.FIELDS.COPY')"
                          @click="copyLink(videoDetails?.contentUrl)"
                        ></VcButton>
                      </div>
                    </div>
                    <div class="tw-grow tw-basis-0">
                      <VcLabel class="tw-mt-2">
                        <span>{{ $t("VIDEOS.PAGES.DETAILS.FIELDS.EMBED_URL.TITLE") }}</span>
                      </VcLabel>
                      <div class="tw-flex tw-flex-row tw-justify-stretch tw-truncate">
                        <div class="tw-truncate">
                          <VcLink
                            class="vc-link tw-text-s tw-truncate tw-w-full"
                            @click="openLink(videoDetails?.embedUrl)"
                            >{{ videoDetails?.embedUrl }}</VcLink
                          >
                        </div>
                        <VcButton
                          icon="far fa-copy"
                          size="m"
                          class="tw-ml-2"
                          text
                          :title="t('VIDEOS.PAGES.DETAILS.FIELDS.COPY')"
                          @click="copyLink(videoDetails?.embedUrl)"
                        ></VcButton>
                      </div>
                    </div>
                    <div class="tw-grow tw-basis-0">
                      <VcLabel class="tw-mt-2">
                        <span>{{ $t("VIDEOS.PAGES.DETAILS.FIELDS.THUMBNAIL_URL.TITLE") }}</span>
                      </VcLabel>
                      <div class="tw-flex tw-flex-row tw-justify-stretch tw-truncate">
                        <div class="tw-truncate">
                          <VcLink
                            class="vc-link tw-text-s tw-truncate tw-w-full"
                            @click="openLink(videoDetails?.thumbnailUrl)"
                            >{{ videoDetails?.thumbnailUrl }}</VcLink
                          >
                        </div>
                        <VcButton
                          icon="far fa-copy"
                          size="m"
                          class="tw-ml-2"
                          text
                          :title="t('VIDEOS.PAGES.DETAILS.FIELDS.COPY')"
                          @click="copyLink(videoDetails?.thumbnailUrl)"
                        ></VcButton>
                      </div>
                    </div>
                  </VcCol>
                </VcRow>
              </div>
              <!-- Name -->
              <div class="tw-mb-4 tw-flex tw-flex-row tw-items-center">
                <Field
                  v-slot="{ errorMessage, handleChange, errors }"
                  :label="t('VIDEOS.PAGES.DETAILS.FIELDS.NAME.TITLE')"
                  name="video_name"
                  rules="required"
                >
                  <VcInput
                    v-model="videoDetails.name"
                    class="tw-grow tw-basis-0"
                    :label="$t('VIDEOS.PAGES.DETAILS.FIELDS.NAME.TITLE')"
                    :placeholder="$t('VIDEOS.PAGES.DETAILS.FIELDS.NAME.PLACEHOLDER')"
                    required
                    :disabled="true"
                    :error="!!errors.length"
                    :error-message="errorMessage"
                    @update:model-value="handleChange"
                  ></VcInput>
                </Field>
              </div>
              <!-- Description -->
              <div class="tw-mb-4 tw-flex tw-flex-row tw-items-center">
                <Field
                  v-slot="{ errorMessage, handleChange, errors }"
                  :label="t('VIDEOS.PAGES.DETAILS.FIELDS.DESCRIPTION.TITLE')"
                  name="video_description"
                >
                  <VcTextarea
                    v-model="videoDetails.description"
                    class="tw-grow tw-basis-0"
                    :label="t('VIDEOS.PAGES.DETAILS.FIELDS.DESCRIPTION.TITLE')"
                    :placeholder="t('VIDEOS.PAGES.DETAILS.FIELDS.DESCRIPTION.PLACEHOLDER')"
                    :disabled="true"
                    :error="!!errors.length"
                    :error-message="errorMessage"
                    @update:model-value="handleChange"
                  ></VcTextarea>
                </Field>
              </div>
              <!-- Preview -->
              <div class="tw-mb-4 tw-flex tw-flex-row tw-items-center">
                <Field
                  v-slot="{ errorMessage, handleChange, errors }"
                  :label="$t('VIDEOS.PAGES.DETAILS.FIELDS.PREVIEW.TITLE')"
                  name="content_url"
                >
                  <VcVideo
                    :source="videoDetails?.embedUrl"
                    class="tw-grow tw-basis-0"
                    :label="$t('VIDEOS.PAGES.DETAILS.FIELDS.PREVIEW.TITLE')"
                    size="xxl"
                    :error="!!errors.length"
                    :error-message="errorMessage"
                    @update:model-value="handleChange"
                  ></VcVideo>
                </Field>
              </div>
            </div>
          </VcForm>
        </div>
      </div>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { IParentCallArgs, IBladeToolbar, usePopup } from "@vc-shell/framework";
import { IVideo } from "vcmp-vendor-portal-api/catalog";
import { CreateVideoCommand } from "vcmp-vendor-portal-api/marketplacevendor";
import { useVideo, useVideos } from "../composables";
import { Field } from "vee-validate";
import moment from "moment/moment";

export interface Props {
  expanded: boolean;
  closable: boolean;
  param?: string;
  options?: {
    video: IVideo;
    isNew: boolean;
    productId: string;
  };
}

export interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "close:blade"): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

const emit = defineEmits<Emits>();
const { t } = useI18n({ useScope: "global" });
const { createVideo, saveVideo, videoLoadedWithoutErrors, modified } = useVideo();
const { deleteVideos } = useVideos();
const { showConfirmation } = usePopup();

const container = ref();
const videoLoading = ref(false);
const videoDetails = ref();
const isNew = ref(true);
const productId = ref<string>();
const videoUrl = ref<string>();
const newVideoLoaded = ref(false);

onMounted(async () => {
  await reload();
});

const reload = async () => {
  try {
    videoLoading.value = true;
    videoDetails.value = props.options?.video;
    isNew.value = props.options?.isNew;
    productId.value = props.options?.productId;
  } finally {
    videoLoading.value = false;
  }
};

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: computed(() => t("VIDEOS.PAGES.DETAILS.TOOLBAR.SAVE")),
    icon: "fas fa-save",
    async clickHandler() {
      await saveVideo(videoDetails.value);
      emit("parent:call", {
        method: "reload",
      });
      emit("parent:call", {
        method: "markProductDirty",
      });
      emit("close:blade");
    },
    disabled: computed(() => !modified.value && !videoDetails.value),
    isVisible: computed(() => isNew.value),
  },
  {
    id: "delete",
    title: computed(() => t("VIDEOS.PAGES.DETAILS.TOOLBAR.DELETE")),
    icon: "fas fa-trash",
    async clickHandler() {
      if (await showConfirmation(t("VIDEOS.PAGES.DETAILS.DELETE_CONFIRMATION.MESSAGE"))) {
        await deleteVideos([videoDetails.value.id]);
        emit("parent:call", {
          method: "reload",
        });
        emit("parent:call", {
          method: "markProductDirty",
        });
        emit("close:blade");
      }
    },
    isVisible: computed(() => !isNew.value),
  },
]);

async function getVideo() {
  const command = new CreateVideoCommand({
    contentUrl: videoUrl.value,
    languageCode: "en-US",
    ownerId: productId.value,
    ownerType: "Product",
  });
  try {
    const createVideoResult = await createVideo(command);
    videoDetails.value = createVideoResult;
    newVideoLoaded.value = true;
  } catch (e) {
    videoDetails.value = null;
    newVideoLoaded.value = false;
  }
}

const validateYoutubeUrl = [
  (value: string): string | boolean => {
    return videoLoadedWithoutErrors.value;
  },
];

function copyLink(link: string) {
  if (link.charAt(0) === "/") {
    navigator.clipboard?.writeText(`${location.origin}${link}`);
  } else {
    navigator.clipboard?.writeText(link);
  }
}

function openLink(link: string) {
  location.href = link;
}
</script>
