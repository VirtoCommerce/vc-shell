<template>
  <div class="vc-video">
    <VcLabel
      v-if="label"
      class="vc-video__label"
    >
      <span>{{ label }}</span>
      <template
        v-if="tooltip"
        #tooltip
      >
        {{ tooltip }}
      </template>
    </VcLabel>

    <div class="vc-video__container">
      <div v-if="source">
        <iframe
          :src="source"
          :title="label || 'Video'"
          width="100%"
          height="300px"
          frameborder="0"
          :sandbox="sandbox"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy"
        >
        </iframe>
      </div>
      <div
        v-else
        class="vc-video__placeholder"
        role="img"
        :aria-label="$t('COMPONENTS.ATOMS.VC_VIDEO.NO_SOURCE')"
      >
        <VcIcon
          icon="lucide-film"
          size="xl"
          aria-hidden="true"
        ></VcIcon>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import { VcLabel } from "@ui/components/atoms/vc-label";

/**
 * Embed hosts that need their own origin to bootstrap a player. Cross-origin by
 * definition, so `allow-same-origin` cannot be used to reach the parent frame:
 * the Same-Origin Policy blocks that. It only lets the framed page use its own
 * storage, which YouTube requires before it can build the player.
 */
const TRUSTED_EMBED_HOSTS = ["youtube.com", "youtube-nocookie.com", "youtu.be", "vimeo.com"];

function isTrustedEmbedHost(source: string): boolean {
  let host: string;
  try {
    host = new URL(source).hostname.toLowerCase();
  } catch {
    // Relative or malformed source — may resolve to our own origin, stay strict.
    return false;
  }
  // Suffix match must be on a dot boundary, or `evil-youtube.com` would pass.
  return TRUSTED_EMBED_HOSTS.some((trusted) => host === trusted || host.endsWith(`.${trusted}`));
}

export interface Props {
  label?: string;
  tooltip?: string;
  source?: string;
  /**
   * Additional iframe sandbox tokens to append to the resolved sandbox.
   * Space-separated.
   *
   * The base is `allow-scripts allow-presentation`, plus `allow-same-origin`
   * when `source` points at a known video host. Adding `allow-same-origin`
   * yourself for a source on the app's own origin lets the framed page remove
   * its sandbox and reach the parent DOM — do not do it for user-supplied URLs.
   */
  additionalSandbox?: string;
}

export interface Emits {
  (event: "click"): void;
}

const props = defineProps<Props>();
defineEmits<Emits>();

const sandbox = computed(() => {
  const base = ["allow-scripts", "allow-presentation"];
  if (props.source && isTrustedEmbedHost(props.source)) {
    base.push("allow-same-origin");
  }
  const extra = (props.additionalSandbox ?? "").split(/\s+/).filter(Boolean);
  return [...new Set([...base, ...extra])].join(" ");
});
</script>

<style lang="scss">
:root {
  --video-icon-color: var(--neutrals-400);
  --video-placeholder-bg: var(--neutrals-100);
  --video-border-radius: 6px;
  --video-border-color: var(--neutrals-200);
}

.vc-video {
  @apply tw-inline-block tw-relative;

  &__label {
    @apply tw-mb-2;
  }

  &__container {
    @apply tw-w-full tw-relative tw-rounded-[var(--video-border-radius)] tw-overflow-hidden tw-border tw-border-solid tw-border-[color:var(--video-border-color)];
  }

  &__placeholder {
    @apply tw-w-full tw-h-[200px] tw-flex tw-items-center tw-justify-center tw-text-[color:var(--video-icon-color)] tw-bg-[color:var(--video-placeholder-bg)];
  }
}
</style>
