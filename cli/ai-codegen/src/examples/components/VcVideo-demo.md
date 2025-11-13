# VcVideo Demo

Real-world video embed examples for product demos, tutorials, and marketing content.

## YouTube Video Embed

```vue
<template>
  <div class="tw-space-y-4">
    <VcLabel>
      {{ $t("PRODUCTS.DEMO_VIDEO") }}
    </VcLabel>

    <VcVideo
      :src="youtubeUrl"
      :title="$t('PRODUCTS.PRODUCT_DEMO')"
    />

    <VcHint>
      {{ $t("PRODUCTS.VIDEO_HINT") }}
    </VcHint>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcLabel, VcVideo, VcHint } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const youtubeUrl = ref("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
</script>
```

## Video with Custom Controls

```vue
<template>
  <div class="tw-space-y-4">
    <VcCard :header="$t('TUTORIALS.GETTING_STARTED')">
      <div class="tw-space-y-4">
        <VcVideo
          :src="tutorialVideo"
          :title="$t('TUTORIALS.INTRO_VIDEO')"
          :autoplay="false"
          :controls="true"
          :muted="false"
        />

        <div class="tw-flex tw-items-center tw-justify-between">
          <div>
            <div class="tw-font-medium">{{ $t("TUTORIALS.INTRO_TITLE") }}</div>
            <div class="tw-text-sm tw-text-[var(--neutrals-500)]">
              {{ $t("TUTORIALS.DURATION") }}: 5:32
            </div>
          </div>

          <div class="tw-flex tw-gap-2">
            <VcButton
              size="s"
              outlined
              @click="shareVideo"
            >
              <VcIcon icon="material-share" size="s" class="tw-mr-1" />
              {{ $t("COMMON.SHARE") }}
            </VcButton>
            <VcButton
              size="s"
              outlined
              @click="downloadVideo"
            >
              <VcIcon icon="material-download" size="s" class="tw-mr-1" />
              {{ $t("COMMON.DOWNLOAD") }}
            </VcButton>
          </div>
        </div>
      </div>
    </VcCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcCard, VcVideo, VcButton, VcIcon } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const tutorialVideo = ref("https://www.youtube.com/watch?v=tutorial-id");

function shareVideo() {
  console.log("Sharing video");
  navigator.share?.({
    title: "Tutorial Video",
    url: tutorialVideo.value,
  });
}

function downloadVideo() {
  console.log("Downloading video");
}
</script>
```

## Video Playlist

```vue
<template>
  <div class="tw-grid tw-grid-cols-3 tw-gap-6">
    <!-- Main video player -->
    <div class="tw-col-span-2">
      <VcCard :header="currentVideo.title">
        <VcVideo
          :src="currentVideo.url"
          :title="currentVideo.title"
        />

        <div class="tw-mt-4 tw-space-y-3">
          <div>
            <h3 class="tw-font-bold">{{ currentVideo.title }}</h3>
            <p class="tw-text-sm tw-text-[var(--neutrals-600)] tw-mt-2">
              {{ currentVideo.description }}
            </p>
          </div>

          <div class="tw-flex tw-items-center tw-gap-4 tw-text-sm">
            <div class="tw-flex tw-items-center tw-gap-2">
              <VcIcon icon="material-visibility" size="s" />
              <span>{{ currentVideo.views }} {{ $t("VIDEO.VIEWS") }}</span>
            </div>
            <div class="tw-flex tw-items-center tw-gap-2">
              <VcIcon icon="material-schedule" size="s" />
              <span>{{ currentVideo.duration }}</span>
            </div>
          </div>
        </div>
      </VcCard>
    </div>

    <!-- Playlist sidebar -->
    <div class="tw-col-span-1">
      <VcCard :header="$t('VIDEO.PLAYLIST')">
        <div class="tw-space-y-2">
          <div
            v-for="(video, index) in playlist"
            :key="video.id"
            class="tw-p-3 tw-border tw-rounded tw-cursor-pointer tw-transition"
            :class="[
              currentVideo.id === video.id
                ? 'tw-border-[var(--primary-500)] tw-bg-[var(--primary-50)]'
                : 'hover:tw-bg-[var(--neutrals-50)]'
            ]"
            @click="selectVideo(video)"
          >
            <div class="tw-flex tw-gap-3">
              <div class="tw-text-sm tw-font-bold tw-text-[var(--neutrals-500)]">
                {{ index + 1 }}
              </div>
              <div class="tw-flex-1">
                <div class="tw-text-sm tw-font-medium">{{ video.title }}</div>
                <div class="tw-text-xs tw-text-[var(--neutrals-500)]">
                  {{ video.duration }}
                </div>
              </div>
              <VcStatusIcon
                v-if="video.watched"
                variant="success"
              />
            </div>
          </div>
        </div>
      </VcCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcCard, VcVideo, VcIcon, VcStatusIcon } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  duration: string;
  views: number;
  watched: boolean;
}

const playlist = ref<Video[]>([
  {
    id: "1",
    title: "Introduction to VC-Shell",
    description: "Learn the basics of VC-Shell framework",
    url: "https://www.youtube.com/watch?v=intro",
    duration: "5:32",
    views: 1243,
    watched: true,
  },
  {
    id: "2",
    title: "Building Your First Module",
    description: "Step-by-step guide to creating a module",
    url: "https://www.youtube.com/watch?v=module",
    duration: "12:45",
    views: 856,
    watched: false,
  },
  {
    id: "3",
    title: "Advanced Component Usage",
    description: "Master complex component patterns",
    url: "https://www.youtube.com/watch?v=advanced",
    duration: "18:20",
    views: 612,
    watched: false,
  },
]);

const currentVideo = ref(playlist.value[0]);

function selectVideo(video: Video) {
  currentVideo.value = video;
  video.watched = true;
}
</script>
```

## Video Form Field

```vue
<template>
  <VcForm @submit="onSubmit">
    <div class="tw-space-y-4">
      <div>
        <VcLabel :required="false">
          {{ $t("PRODUCTS.VIDEO_URL") }}
        </VcLabel>
        <VcInput
          v-model="videoUrl"
          :placeholder="$t('PRODUCTS.VIDEO_URL_PLACEHOLDER')"
          @blur="validateVideoUrl"
        />
        <VcHint v-if="!videoError">
          {{ $t("PRODUCTS.VIDEO_SUPPORTED") }}
        </VcHint>
        <VcBanner
          v-if="videoError"
          variant="danger"
          :closable="true"
          @close="videoError = ''"
        >
          {{ videoError }}
        </VcBanner>
      </div>

      <!-- Video preview -->
      <div v-if="videoUrl && !videoError" class="tw-border tw-rounded-lg tw-p-4">
        <h4 class="tw-font-medium tw-mb-3">{{ $t("COMMON.PREVIEW") }}</h4>
        <VcVideo
          :src="videoUrl"
          :title="$t('PRODUCTS.VIDEO_PREVIEW')"
        />
      </div>

      <div class="tw-flex tw-justify-end tw-gap-2">
        <VcButton outlined @click="onCancel">
          {{ $t("COMMON.CANCEL") }}
        </VcButton>
        <VcButton type="submit" variant="primary" :disabled="!videoUrl || !!videoError">
          {{ $t("COMMON.SAVE") }}
        </VcButton>
      </div>
    </div>
  </VcForm>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  VcLabel,
  VcInput,
  VcVideo,
  VcHint,
  VcBanner,
  VcForm,
  VcButton,
} from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const videoUrl = ref("");
const videoError = ref("");

function validateVideoUrl() {
  videoError.value = "";

  if (!videoUrl.value) return;

  // Check if it's a valid YouTube/Vimeo URL
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+/;

  if (!youtubeRegex.test(videoUrl.value) && !vimeoRegex.test(videoUrl.value)) {
    videoError.value = t("VALIDATION.INVALID_VIDEO_URL");
  }
}

function onSubmit() {
  console.log("Video URL saved:", videoUrl.value);
}

function onCancel() {
  console.log("Cancelled");
}
</script>
```

## Video Gallery

```vue
<template>
  <div class="tw-space-y-4">
    <div class="tw-flex tw-justify-between tw-items-center">
      <h3 class="tw-font-bold">{{ $t("PRODUCTS.VIDEO_GALLERY") }}</h3>
      <VcButton variant="primary" @click="addVideo">
        <VcIcon icon="material-add" class="tw-mr-2" />
        {{ $t("PRODUCTS.ADD_VIDEO") }}
      </VcButton>
    </div>

    <div class="tw-grid tw-grid-cols-3 tw-gap-4">
      <div
        v-for="(video, index) in videos"
        :key="index"
        class="tw-border tw-rounded-lg tw-overflow-hidden tw-group"
      >
        <div class="tw-relative">
          <VcVideo
            :src="video.url"
            :title="video.title"
            class="tw-aspect-video"
          />
          
          <div
            class="tw-absolute tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-flex tw-items-center tw-justify-center tw-gap-2 tw-opacity-0 group-hover:tw-opacity-100 tw-transition"
          >
            <VcButton
              size="s"
              @click="editVideo(index)"
            >
              <VcIcon icon="material-edit" size="s" />
            </VcButton>
            <VcButton
              size="s"
              variant="danger"
              @click="removeVideo(index)"
            >
              <VcIcon icon="material-delete" size="s" />
            </VcButton>
          </div>

          <VcBadge
            v-if="index === 0"
            content="MAIN"
            variant="primary"
            size="s"
            :custom-position="true"
            top="8px"
            right="8px"
          />
        </div>

        <div class="tw-p-3">
          <div class="tw-font-medium tw-text-sm tw-truncate">
            {{ video.title }}
          </div>
          <div class="tw-text-xs tw-text-[var(--neutrals-500)]">
            {{ video.duration }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  VcButton,
  VcIcon,
  VcVideo,
  VcBadge,
} from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface VideoItem {
  url: string;
  title: string;
  duration: string;
}

const videos = ref<VideoItem[]>([
  {
    url: "https://www.youtube.com/watch?v=demo1",
    title: "Product Demo",
    duration: "3:45",
  },
  {
    url: "https://www.youtube.com/watch?v=demo2",
    title: "How to Use",
    duration: "5:20",
  },
  {
    url: "https://www.youtube.com/watch?v=demo3",
    title: "Unboxing",
    duration: "2:15",
  },
]);

function addVideo() {
  console.log("Add video modal");
}

function editVideo(index: number) {
  console.log("Edit video:", index);
}

function removeVideo(index: number) {
  videos.value.splice(index, 1);
}
</script>
```

## Key Points

### Props
- `src` - Video URL (YouTube, Vimeo, or direct video file)
- `title` - Video title for accessibility
- `autoplay` - Auto-play video (default: false)
- `controls` - Show player controls (default: true)
- `muted` - Mute audio (default: false)
- `loop` - Loop video (default: false)

### Supported Platforms
- **YouTube**: `https://www.youtube.com/watch?v=VIDEO_ID`
- **Vimeo**: `https://vimeo.com/VIDEO_ID`
- **Direct Files**: `.mp4`, `.webm`, `.ogg`

### Common Use Cases

1. **Product Demos**: Showcase product features
```vue
<VcVideo
  :src="demoUrl"
  :title="$t('PRODUCTS.DEMO')"
/>
```

2. **Tutorials**: Educational content
```vue
<VcVideo
  :src="tutorialUrl"
  :title="$t('TUTORIALS.INTRO')"
  :controls="true"
/>
```

3. **Marketing Videos**: Promotional content
```vue
<VcVideo
  :src="promoUrl"
  :autoplay="true"
  :muted="true"
  :loop="true"
/>
```

### Best Practices

- Always provide a descriptive `title` for accessibility
- Use `autoplay` sparingly (can be annoying)
- Mute auto-playing videos to respect user preferences
- Validate video URLs before saving
- Show thumbnail/preview for video galleries
- Provide video duration information
- Add sharing and download options
- Support playlists for multiple videos
- Track watch progress for tutorials
- Use aspect ratio containers for responsive videos
- Consider bandwidth (don't auto-load multiple videos)
- Add captions for accessibility

