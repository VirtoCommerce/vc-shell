<template>
  <div class="tw-p-6 tw-max-w-4xl tw-mx-auto">
    <h1 class="tw-text-2xl tw-font-bold tw-mb-6">Icon Component Test Suite</h1>

    <div class="tw-space-y-8">
      <!-- Test 1: Basic Icon Types -->
      <section class="tw-border tw-border-gray-200 tw-rounded-lg tw-p-5 tw-shadow-sm">
        <h2 class="tw-text-xl tw-font-bold tw-mb-3 tw-border-b tw-pb-2">Test 1: Basic Icon Types</h2>
        <div class="tw-grid tw-grid-cols-4 tw-gap-6 tw-mt-4">
          <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
            <VcIcon
              icon="material-home"
              size="l"
            />
            <span class="tw-text-sm tw-font-medium">Material</span>
          </div>
          <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
            <VcIcon
              icon="bi-house"
              size="l"
            />
            <span class="tw-text-sm tw-font-medium">Bootstrap</span>
          </div>
          <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
            <VcIcon
              icon="lucide-home"
              size="l"
            />
            <span class="tw-text-sm tw-font-medium">Lucide</span>
          </div>
          <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
            <VcIcon
              icon="fas fa-home"
              size="l"
            />
            <span class="tw-text-sm tw-font-medium">FontAwesome</span>
          </div>
        </div>
      </section>

      <!-- Test 2: Icon Sizes -->
      <section class="tw-border tw-border-gray-200 tw-rounded-lg tw-p-5 tw-shadow-sm">
        <h2 class="tw-text-xl tw-font-bold tw-mb-3 tw-border-b tw-pb-2">Test 2: Icon Sizes</h2>
        <p class="tw-text-sm tw-mb-4 tw-text-gray-600">
          All icons should be visually the same size when using the same size value
        </p>

        <div class="tw-space-y-6">
          <div class="tw-bg-gray-50 tw-p-4 tw-rounded-lg">
            <h3 class="tw-font-semibold tw-mb-3">Size: XS</h3>
            <div class="tw-flex tw-flex-row tw-gap-8 tw-items-center tw-justify-center">
              <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
                <VcIcon
                  icon="material-home"
                  size="xs"
                />
                <span class="tw-text-xs">Material</span>
              </div>
              <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
                <VcIcon
                  icon="bi-house"
                  size="xs"
                />
                <span class="tw-text-xs">Bootstrap</span>
              </div>
              <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
                <VcIcon
                  icon="lucide-home"
                  size="xs"
                />
                <span class="tw-text-xs">Lucide</span>
              </div>
              <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
                <VcIcon
                  icon="fas fa-home"
                  size="xs"
                />
                <span class="tw-text-xs">FontAwesome</span>
              </div>
            </div>
          </div>

          <div class="tw-bg-gray-50 tw-p-4 tw-rounded-lg">
            <h3 class="tw-font-semibold tw-mb-3">Size: M (default)</h3>
            <div class="tw-flex tw-flex-row tw-gap-8 tw-items-center tw-justify-center">
              <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
                <VcIcon icon="material-home" />
                <span class="tw-text-xs">Material</span>
              </div>
              <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
                <VcIcon icon="bi-house" />
                <span class="tw-text-xs">Bootstrap</span>
              </div>
              <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
                <VcIcon icon="lucide-home" />
                <span class="tw-text-xs">Lucide</span>
              </div>
              <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
                <VcIcon icon="fas fa-home" />
                <span class="tw-text-xs">FontAwesome</span>
              </div>
            </div>
          </div>

          <div class="tw-bg-gray-50 tw-p-4 tw-rounded-lg">
            <h3 class="tw-font-semibold tw-mb-3">Size: XL</h3>
            <div class="tw-flex tw-flex-row tw-gap-8 tw-items-center tw-justify-center">
              <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
                <VcIcon
                  icon="material-home"
                  size="xl"
                />
                <span class="tw-text-xs">Material</span>
              </div>
              <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
                <VcIcon
                  icon="bi-house"
                  size="xl"
                />
                <span class="tw-text-xs">Bootstrap</span>
              </div>
              <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
                <VcIcon
                  icon="lucide-home"
                  size="xl"
                />
                <span class="tw-text-xs">Lucide</span>
              </div>
              <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
                <VcIcon
                  icon="fas fa-home"
                  size="xl"
                />
                <span class="tw-text-xs">FontAwesome</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Test 3: Color Variants -->
      <section class="tw-border tw-border-gray-200 tw-rounded-lg tw-p-5 tw-shadow-sm">
        <h2 class="tw-text-xl tw-font-bold tw-mb-3 tw-border-b tw-pb-2">Test 3: Color Variants</h2>
        <div class="tw-space-y-4 tw-mt-4">
          <div class="tw-flex tw-flex-row tw-gap-4 tw-items-center">
            <div class="tw-w-24 tw-font-medium tw-text-right">Default:</div>
            <div class="tw-flex tw-gap-6">
              <VcIcon
                icon="material-info"
                size="l"
              />
              <VcIcon
                icon="bi-info-circle"
                size="l"
              />
              <VcIcon
                icon="lucide-info"
                size="l"
              />
              <VcIcon
                icon="fas fa-info-circle"
                size="l"
              />
            </div>
          </div>

          <div class="tw-flex tw-flex-row tw-gap-4 tw-items-center">
            <div class="tw-w-24 tw-font-medium tw-text-right">Warning:</div>
            <div class="tw-flex tw-gap-6">
              <VcIcon
                icon="material-warning"
                variant="warning"
                size="l"
              />
              <VcIcon
                icon="bi-exclamation-triangle"
                variant="warning"
                size="l"
              />
              <VcIcon
                icon="lucide-alert-triangle"
                variant="warning"
                size="l"
              />
              <VcIcon
                icon="fas fa-exclamation-triangle"
                variant="warning"
                size="l"
              />
            </div>
          </div>

          <div class="tw-flex tw-flex-row tw-gap-4 tw-items-center">
            <div class="tw-w-24 tw-font-medium tw-text-right">Danger:</div>
            <div class="tw-flex tw-gap-6">
              <VcIcon
                icon="material-error"
                variant="danger"
                size="l"
              />
              <VcIcon
                icon="bi-exclamation-circle"
                variant="danger"
                size="l"
              />
              <VcIcon
                icon="lucide-alert-circle"
                variant="danger"
                size="l"
              />
              <VcIcon
                icon="fas fa-exclamation-circle"
                variant="danger"
                size="l"
              />
            </div>
          </div>

          <div class="tw-flex tw-flex-row tw-gap-4 tw-items-center">
            <div class="tw-w-24 tw-font-medium tw-text-right">Success:</div>
            <div class="tw-flex tw-gap-6">
              <VcIcon
                icon="material-check_circle"
                variant="success"
                size="l"
              />
              <VcIcon
                icon="bi-check-circle"
                variant="success"
                size="l"
              />
              <VcIcon
                icon="lucide-check-circle"
                variant="success"
                size="l"
              />
              <VcIcon
                icon="fas fa-check-circle"
                variant="success"
                size="l"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Test 4: Custom Size -->
      <section class="tw-border tw-border-gray-200 tw-rounded-lg tw-p-5 tw-shadow-sm">
        <h2 class="tw-text-xl tw-font-bold tw-mb-3 tw-border-b tw-pb-2">Test 5: Custom Size</h2>
        <div class="tw-flex tw-flex-row tw-gap-8 tw-items-end tw-justify-center tw-mt-4">
          <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
            <VcIcon
              icon="material-star"
              :custom-size="32"
            />
            <span class="tw-text-xs">Material (32px)</span>
          </div>
          <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
            <VcIcon
              icon="bi-star"
              :custom-size="32"
            />
            <span class="tw-text-xs">Bootstrap (32px)</span>
          </div>
          <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
            <VcIcon
              icon="lucide-star"
              :custom-size="32"
            />
            <span class="tw-text-xs">Lucide (32px)</span>
          </div>
          <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
            <VcIcon
              icon="fas fa-star"
              :custom-size="32"
            />
            <span class="tw-text-xs">FontAwesome (32px)</span>
          </div>
        </div>
      </section>

      <!-- Test 5: With/Without Container -->
      <section class="tw-border tw-border-gray-200 tw-rounded-lg tw-p-5 tw-shadow-sm">
        <h2 class="tw-text-xl tw-font-bold tw-mb-3 tw-border-b tw-pb-2">Test 5: With/Without Container</h2>
        <div class="tw-space-y-6 tw-mt-4">
          <div class="tw-bg-gray-50 tw-p-4 tw-rounded-lg">
            <h3 class="tw-font-semibold tw-mb-3">With Container (default)</h3>
            <div class="tw-flex tw-flex-row tw-gap-8 tw-items-center tw-justify-center tw-bg-blue-50 tw-p-4 tw-rounded">
              <VcIcon
                icon="material-home"
                size="l"
              />
              <VcIcon
                icon="bi-house"
                size="l"
              />
              <VcIcon
                icon="lucide-home"
                size="l"
              />
              <VcIcon
                icon="fas fa-home"
                size="l"
              />
            </div>
          </div>

          <div class="tw-bg-gray-50 tw-p-4 tw-rounded-lg">
            <h3 class="tw-font-semibold tw-mb-3">Without Container</h3>
            <div class="tw-flex tw-flex-row tw-gap-8 tw-items-center tw-justify-center tw-bg-blue-50 tw-p-4 tw-rounded">
              <VcIcon
                icon="material-home"
                :use-container="false"
                size="l"
              />
              <VcIcon
                icon="bi-house"
                :use-container="false"
                size="l"
              />
              <VcIcon
                icon="lucide-home"
                :use-container="false"
                size="l"
              />
              <VcIcon
                icon="fas fa-home"
                :use-container="false"
                size="l"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Test 6: Icon Size Comparison -->
      <section class="tw-border tw-border-gray-200 tw-rounded-lg tw-p-5 tw-shadow-sm">
        <h2 class="tw-text-xl tw-font-bold tw-mb-3 tw-border-b tw-pb-2">Test 6: Icon Size Comparison</h2>
        <div class="tw-space-y-6 tw-mt-4">
          <div class="tw-bg-gray-50 tw-p-4 tw-rounded-lg">
            <h3 class="tw-font-semibold tw-mb-3">Size "M" Comparison</h3>
            <div class="tw-flex tw-flex-row tw-gap-8 tw-items-center tw-justify-center">
              <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
                <VcIcon
                  icon="material-home"
                  size="m"
                />
                <span class="tw-text-xs">Material</span>
              </div>
              <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
                <VcIcon
                  icon="bi-house"
                  size="m"
                />
                <span class="tw-text-xs">Bootstrap</span>
              </div>
              <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
                <VcIcon
                  icon="lucide-home"
                  size="m"
                />
                <span class="tw-text-xs">Lucide</span>
              </div>
              <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
                <VcIcon
                  icon="fas fa-home"
                  size="m"
                />
                <span class="tw-text-xs">FontAwesome</span>
              </div>
            </div>
          </div>

          <div class="tw-bg-gray-50 tw-p-4 tw-rounded-lg">
            <h3 class="tw-font-semibold tw-mb-3">Heart Icons Comparison</h3>
            <div class="tw-flex tw-flex-row tw-gap-8 tw-items-center tw-justify-center">
              <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
                <VcIcon
                  icon="material-favorite"
                  size="xl"
                />
                <span class="tw-text-xs">Material</span>
              </div>
              <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
                <VcIcon
                  icon="bi-heart"
                  size="xl"
                />
                <span class="tw-text-xs">Bootstrap</span>
              </div>
              <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
                <VcIcon
                  icon="lucide-heart"
                  size="xl"
                />
                <span class="tw-text-xs">Lucide</span>
              </div>
              <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
                <VcIcon
                  icon="fas fa-heart"
                  size="xl"
                />
                <span class="tw-text-xs">FontAwesome</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VcIcon } from "@ui/components/atoms/vc-icon";
import type { IconSize } from "@ui/components/atoms/vc-icon/vc-icon.vue";
</script>
