---
id: component-VcInputDropdown-demo
type: COMPONENT
complexity: SIMPLE
category: component
tags: ["component","input","dropdown","form"]
title: "VcInputDropdown Demo"
description: "Input field with dropdown suggestions"
componentRole: form-input
bladeContext: ["details"]
---

# VcInputDropdown Demo

Real-world input dropdown examples for measurements with unit selectors.

## Weight Input with Unit Selector

```vue
<template>
  <div class="tw-space-y-4">
    <VcLabel :required="true">
      {{ $t("PRODUCTS.WEIGHT") }}
    </VcLabel>

    <VcInputDropdown
      v-model="product.weight"
      v-model:unit="product.weightUnit"
      :options="weightUnits"
      :placeholder="$t('PRODUCTS.WEIGHT_PLACEHOLDER')"
    />

    <VcHint>
      {{ $t("PRODUCTS.WEIGHT_HINT") }}
    </VcHint>

    <div class="tw-text-sm tw-text-[var(--neutrals-600)]">
      {{ $t("PRODUCTS.ENTERED_WEIGHT") }}: <strong>{{ product.weight }} {{ product.weightUnit }}</strong>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { VcLabel, VcInputDropdown, VcHint } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const product = reactive({
  weight: 0,
  weightUnit: "kg",
});

const weightUnits = ["kg", "g", "lb", "oz"];
</script>
```

## Dimensions Form

```vue
<template>
  <VcForm @submit="onSubmit">
    <div class="tw-space-y-6">
      <div class="tw-border tw-rounded-lg tw-p-4">
        <h3 class="tw-font-bold tw-mb-4">{{ $t("PRODUCTS.DIMENSIONS") }}</h3>

        <div class="tw-grid tw-grid-cols-4 tw-gap-4">
          <!-- Length -->
          <div class="tw-col-span-3">
            <VcLabel :required="true">
              {{ $t("PRODUCTS.LENGTH") }}
            </VcLabel>
            <Field v-slot="{ field, errorMessage }" name="length" :rules="dimensionRules">
              <VcInputDropdown
                v-bind="field"
                v-model:unit="dimensions.lengthUnit"
                :error-message="errorMessage"
                :options="dimensionUnits"
                :placeholder="$t('PRODUCTS.LENGTH_PLACEHOLDER')"
              />
            </Field>
          </div>

          <!-- Width -->
          <div class="tw-col-span-3">
            <VcLabel :required="true">
              {{ $t("PRODUCTS.WIDTH") }}
            </VcLabel>
            <Field v-slot="{ field, errorMessage }" name="width" :rules="dimensionRules">
              <VcInputDropdown
                v-bind="field"
                v-model:unit="dimensions.widthUnit"
                :error-message="errorMessage"
                :options="dimensionUnits"
                :placeholder="$t('PRODUCTS.WIDTH_PLACEHOLDER')"
              />
            </Field>
          </div>

          <!-- Height -->
          <div class="tw-col-span-3">
            <VcLabel :required="true">
              {{ $t("PRODUCTS.HEIGHT") }}
            </VcLabel>
            <Field v-slot="{ field, errorMessage }" name="height" :rules="dimensionRules">
              <VcInputDropdown
                v-bind="field"
                v-model:unit="dimensions.heightUnit"
                :error-message="errorMessage"
                :options="dimensionUnits"
                :placeholder="$t('PRODUCTS.HEIGHT_PLACEHOLDER')"
              />
            </Field>
          </div>

          <!-- Unit selector for all -->
          <div class="tw-flex tw-items-end">
            <VcButton
              outlined
              class="tw-w-full"
              @click="syncAllUnits"
            >
              <VcIcon icon="material-sync" size="s" class="tw-mr-1" />
              {{ $t("PRODUCTS.SYNC_UNITS") }}
            </VcButton>
          </div>
        </div>

        <!-- Volume calculation -->
        <div v-if="dimensions.length && dimensions.width && dimensions.height" class="tw-mt-4 tw-p-3 tw-bg-[var(--info-50)] tw-rounded">
          <div class="tw-text-sm">
            {{ $t("PRODUCTS.VOLUME") }}: 
            <strong class="tw-text-[var(--info-700)]">
              {{ calculateVolume() }}
            </strong>
          </div>
        </div>
      </div>

      <!-- Weight -->
      <div class="tw-border tw-rounded-lg tw-p-4">
        <h3 class="tw-font-bold tw-mb-4">{{ $t("PRODUCTS.WEIGHT") }}</h3>

        <div class="tw-grid tw-grid-cols-2 tw-gap-4">
          <div>
            <VcLabel :required="true">
              {{ $t("PRODUCTS.WEIGHT") }}
            </VcLabel>
            <VcInputDropdown
              v-model="dimensions.weight"
              v-model:unit="dimensions.weightUnit"
              :options="weightUnits"
              :placeholder="$t('PRODUCTS.WEIGHT_PLACEHOLDER')"
            />
          </div>

          <div>
            <VcLabel :required="false">
              {{ $t("PRODUCTS.PACKAGE_WEIGHT") }}
            </VcLabel>
            <VcInputDropdown
              v-model="dimensions.packageWeight"
              v-model:unit="dimensions.weightUnit"
              :options="weightUnits"
              :placeholder="$t('PRODUCTS.PACKAGE_WEIGHT_PLACEHOLDER')"
            />
          </div>
        </div>
      </div>

      <!-- Submit -->
      <div class="tw-flex tw-justify-end tw-gap-2">
        <VcButton outlined @click="onCancel">
          {{ $t("COMMON.CANCEL") }}
        </VcButton>
        <VcButton type="submit" variant="primary">
          {{ $t("COMMON.SAVE") }}
        </VcButton>
      </div>
    </div>
  </VcForm>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import {
  VcLabel,
  VcInputDropdown,
  VcForm,
  VcButton,
  VcIcon,
} from "@vc-shell/framework";
import { Field } from "vee-validate";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const dimensions = reactive({
  length: 0,
  lengthUnit: "cm",
  width: 0,
  widthUnit: "cm",
  height: 0,
  heightUnit: "cm",
  weight: 0,
  packageWeight: 0,
  weightUnit: "kg",
});

const dimensionUnits = ["cm", "m", "in", "ft"];
const weightUnits = ["kg", "g", "lb", "oz"];

function dimensionRules(value: number) {
  if (!value || value <= 0) return t("VALIDATION.REQUIRED");
  return true;
}

function syncAllUnits() {
  const commonUnit = dimensions.lengthUnit;
  dimensions.widthUnit = commonUnit;
  dimensions.heightUnit = commonUnit;
}

function calculateVolume(): string {
  const volume = dimensions.length * dimensions.width * dimensions.height;
  const unit = dimensions.lengthUnit;
  
  let volumeUnit = "";
  if (unit === "cm") volumeUnit = "cm³";
  else if (unit === "m") volumeUnit = "m³";
  else if (unit === "in") volumeUnit = "in³";
  else if (unit === "ft") volumeUnit = "ft³";
  
  return `${volume.toFixed(2)} ${volumeUnit}`;
}

function onSubmit() {
  console.log("Dimensions saved:", dimensions);
}

function onCancel() {
  console.log("Cancelled");
}
</script>
```

## Speed Input with Unit Conversion

```vue
<template>
  <div class="tw-space-y-4">
    <VcCard :header="$t('SHIPPING.SPEED_LIMITS')">
      <div class="tw-space-y-4">
        <div>
          <VcLabel :required="true">
            {{ $t("SHIPPING.MAX_SPEED") }}
          </VcLabel>
          <VcInputDropdown
            v-model="maxSpeed"
            v-model:unit="speedUnit"
            :options="speedUnits"
            :placeholder="$t('SHIPPING.ENTER_SPEED')"
          />
        </div>

        <!-- Converted values -->
        <div class="tw-border tw-rounded-lg tw-p-3 tw-space-y-2">
          <h4 class="tw-font-medium tw-text-sm">
            {{ $t("SHIPPING.CONVERSIONS") }}
          </h4>
          <div
            v-for="unit in speedUnits.filter(u => u !== speedUnit)"
            :key="unit"
            class="tw-flex tw-justify-between tw-text-sm"
          >
            <span class="tw-text-[var(--neutrals-600)]">{{ unit }}:</span>
            <span class="tw-font-medium">
              {{ convertSpeed(maxSpeed, speedUnit, unit) }}
            </span>
          </div>
        </div>
      </div>
    </VcCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcCard, VcLabel, VcInputDropdown } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const maxSpeed = ref(0);
const speedUnit = ref("km/h");

const speedUnits = ["km/h", "mph", "m/s"];

// Conversion factors to m/s
const speedConversions: Record<string, number> = {
  "km/h": 0.277778,
  "mph": 0.44704,
  "m/s": 1,
};

function convertSpeed(value: number, from: string, to: string): string {
  if (!value) return "0";
  
  // Convert to m/s first
  const inMetersPerSecond = value * speedConversions[from];
  
  // Convert to target unit
  const converted = inMetersPerSecond / speedConversions[to];
  
  return converted.toFixed(2);
}
</script>
```

## Temperature Input

```vue
<template>
  <div class="tw-space-y-4">
    <div>
      <VcLabel :required="true">
        {{ $t("PRODUCTS.STORAGE_TEMPERATURE") }}
      </VcLabel>

      <div class="tw-grid tw-grid-cols-2 tw-gap-4">
        <div>
          <VcLabel class="tw-text-sm">
            {{ $t("PRODUCTS.MIN_TEMP") }}
          </VcLabel>
          <VcInputDropdown
            v-model="storage.minTemp"
            v-model:unit="storage.tempUnit"
            :options="tempUnits"
            :placeholder="$t('PRODUCTS.MIN_TEMP_PLACEHOLDER')"
          />
        </div>

        <div>
          <VcLabel class="tw-text-sm">
            {{ $t("PRODUCTS.MAX_TEMP") }}
          </VcLabel>
          <VcInputDropdown
            v-model="storage.maxTemp"
            v-model:unit="storage.tempUnit"
            :options="tempUnits"
            :placeholder="$t('PRODUCTS.MAX_TEMP_PLACEHOLDER')"
          />
        </div>
      </div>

      <VcHint v-if="storage.minTemp && storage.maxTemp">
        <div class="tw-space-y-1">
          <div>
            {{ $t("PRODUCTS.TEMPERATURE_RANGE") }}: 
            <strong>{{ storage.minTemp }}° - {{ storage.maxTemp }}° {{ storage.tempUnit }}</strong>
          </div>
          <div v-if="storage.tempUnit !== 'C'" class="tw-text-xs">
            ({{ convertTemp(storage.minTemp, storage.tempUnit, "C") }}°C - 
            {{ convertTemp(storage.maxTemp, storage.tempUnit, "C") }}°C)
          </div>
        </div>
      </VcHint>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { VcLabel, VcInputDropdown, VcHint } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const storage = reactive({
  minTemp: 0,
  maxTemp: 0,
  tempUnit: "C",
});

const tempUnits = ["C", "F", "K"];

function convertTemp(value: number, from: string, to: string): string {
  if (!value && value !== 0) return "0";
  
  let celsius = value;
  
  // Convert to Celsius first
  if (from === "F") {
    celsius = (value - 32) * 5 / 9;
  } else if (from === "K") {
    celsius = value - 273.15;
  }
  
  // Convert to target unit
  if (to === "C") {
    return celsius.toFixed(1);
  } else if (to === "F") {
    return ((celsius * 9 / 5) + 32).toFixed(1);
  } else if (to === "K") {
    return (celsius + 273.15).toFixed(1);
  }
  
  return "0";
}
</script>
```

## Input Dropdown in Table

```vue
<template>
  <div class="tw-space-y-4">
    <div class="tw-flex tw-justify-between tw-items-center">
      <h3 class="tw-font-bold">{{ $t("PRODUCTS.SHIPPING_DIMENSIONS") }}</h3>
      <VcButton variant="primary" @click="addProduct">
        <VcIcon icon="material-add" class="tw-mr-2" />
        {{ $t("PRODUCTS.ADD") }}
      </VcButton>
    </div>

    <VcTable
      :items="products"
      :columns="columns"
    >
      <template #item_weight="{ item }">
        <VcInputDropdown
          v-model="item.weight"
          v-model:unit="item.weightUnit"
          :options="weightUnits"
          size="s"
          @blur="updateProduct(item)"
        />
      </template>

      <template #item_dimensions="{ item }">
        <div class="tw-flex tw-gap-2">
          <VcInput
            v-model="item.length"
            :placeholder="$t('PRODUCTS.L')"
            size="s"
            class="tw-w-20"
          />
          <span class="tw-text-[var(--neutrals-500)]">×</span>
          <VcInput
            v-model="item.width"
            :placeholder="$t('PRODUCTS.W')"
            size="s"
            class="tw-w-20"
          />
          <span class="tw-text-[var(--neutrals-500)]">×</span>
          <VcInput
            v-model="item.height"
            :placeholder="$t('PRODUCTS.H')"
            size="s"
            class="tw-w-20"
          />
          <VcSelect
            v-model="item.dimensionUnit"
            :options="dimensionUnits"
            size="s"
            class="tw-w-20"
          />
        </div>
      </template>

      <template #item_actions="{ item }">
        <VcButton
          size="s"
          text
          variant="danger"
          @click="removeProduct(item.id)"
        >
          <VcIcon icon="material-delete" size="s" />
        </VcButton>
      </template>
    </VcTable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  VcButton,
  VcIcon,
  VcTable,
  VcInputDropdown,
  VcInput,
  VcSelect,
} from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface Product {
  id: string;
  name: string;
  weight: number;
  weightUnit: string;
  length: number;
  width: number;
  height: number;
  dimensionUnit: string;
}

const products = ref<Product[]>([
  {
    id: "1",
    name: "Product A",
    weight: 1.5,
    weightUnit: "kg",
    length: 10,
    width: 20,
    height: 5,
    dimensionUnit: "cm",
  },
]);

const weightUnits = ["kg", "g", "lb", "oz"];
const dimensionUnits = ["cm", "m", "in", "ft"];

const columns = computed(() => [
  { id: "name", title: t("PRODUCTS.NAME") },
  { id: "weight", title: t("PRODUCTS.WEIGHT") },
  { id: "dimensions", title: t("PRODUCTS.DIMENSIONS") },
  { id: "actions", title: t("COMMON.ACTIONS"), align: "center" },
]);

function addProduct() {
  products.value.push({
    id: Date.now().toString(),
    name: `Product ${products.value.length + 1}`,
    weight: 0,
    weightUnit: "kg",
    length: 0,
    width: 0,
    height: 0,
    dimensionUnit: "cm",
  });
}

function updateProduct(product: Product) {
  console.log("Product updated:", product);
}

function removeProduct(id: string) {
  const index = products.value.findIndex(p => p.id === id);
  if (index !== -1) {
    products.value.splice(index, 1);
  }
}
</script>
```

## Key Points

### V-Model Binding
- `v-model` - Value binding
- `v-model:unit` - Unit binding (dropdown selection)

### Props
- `:options` - Array of available units
- `:placeholder` - Placeholder text
- `:disabled` - Disable input
- `:error-message` - Show error message
- `size` - s, m (default)

### Common Use Cases

1. **Weight**: Product weight with kg/lb/g/oz
```vue
<VcInputDropdown
  v-model="weight"
  v-model:unit="weightUnit"
  :options="['kg', 'lb', 'g', 'oz']"
/>
```

2. **Dimensions**: Length/Width/Height with cm/m/in/ft
```vue
<VcInputDropdown
  v-model="length"
  v-model:unit="lengthUnit"
  :options="['cm', 'm', 'in', 'ft']"
/>
```

3. **Temperature**: Storage temp with C/F/K
```vue
<VcInputDropdown
  v-model="temperature"
  v-model:unit="tempUnit"
  :options="['C', 'F', 'K']"
/>
```

4. **Speed**: Max speed with km/h/mph/m/s
```vue
<VcInputDropdown
  v-model="speed"
  v-model:unit="speedUnit"
  :options="['km/h', 'mph', 'm/s']"
/>
```

### Best Practices

- Provide unit conversion display for user reference
- Use consistent units within related fields
- Add "Sync Units" button for multi-field forms
- Calculate derived values (volume from L×W×H)
- Store numeric values separately from units
- Validate numeric input (positive numbers, decimals)
- Show converted values in common units
- Use size="s" for table cells
- Group related measurements together
- Provide hints about preferred units

