# App Bar Mobile Buttons Service Documentation

The App Bar Mobile Buttons Service is a core component of the VC-Shell framework that manages the buttons displayed in the mobile application bar. It provides functionality for registering, organizing, and retrieving these buttons based on user permissions and visibility conditions.

## Overview

The App Bar Mobile Buttons Service enables a consistent and centralized approach to managing mobile action buttons that appear in the application bar. It handles button registration, priority-based ordering, and permission-based visibility.

## File Path
`/framework/core/services/app-bar-mobile-buttons-service.ts`

## Core Interfaces

Based on the usage patterns, the core interfaces likely include:

```typescript
export interface AppBarButtonContent {
  id: string;
  icon: Component | string;
  onClick?: () => void;
  onClose?: () => void;
  isVisible?: boolean | Ref<boolean> | ComputedRef<boolean>;
  component?: Component;
  props?: Record<string, unknown>;
  order?: number;
  permissions?: string[];
}

export interface IAppBarMobileButtonsService {
  register: (button: AppBarButtonContent) => void;
  unregister: (buttonId: string) => void;
  getButtons: () => AppBarButtonContent[];
}
```

## Primary Features

### Button Registration

The service allows registering buttons that will appear in the mobile application bar, with support for icons, click handlers, and associated components.

```typescript
// Register a mobile button
appBarMobileButtonsService.register({
  id: "global-search",
  icon: SearchIcon,
  onClick: () => {
    // Handle click logic
  },
  onClose: () => {
    // Handle close logic
  },
  isVisible: computed(() => true),
  order: 5
});
```

### Button Ordering

Buttons are ordered based on their `order` property, allowing for a customizable and consistent layout.

```typescript
// Register buttons with different priorities
appBarMobileButtonsService.register({
  id: "primary-action",
  icon: PrimaryIcon,
  order: 1 // Will appear before buttons with higher order values
});

appBarMobileButtonsService.register({
  id: "secondary-action",
  icon: SecondaryIcon,
  order: 10 // Will appear after buttons with lower order values
});
```

### Dynamic Visibility Control

Buttons can be conditionally displayed based on a visibility setting, which can be a boolean, a computed reference, or a reactive reference.

```typescript
// Button with conditional visibility
appBarMobileButtonsService.register({
  id: "conditional-button",
  icon: ConditionalIcon,
  isVisible: computed(() => userHasPermission('view-button'))
});
```

## Usage in Components

The App Bar Mobile Buttons Service is typically accessed through the `useAppBarMobileButtons` composable. Here's a real-world example from the `AppBarMobileActions` component:

```typescript
// From framework/ui/components/organisms/vc-app/_internal/vc-app-bar/_internal/AppBarMobileActions.vue
<script lang="ts" setup>
import { VcButton } from "../../../../../../..";
import { useAppBarMobileButtons } from "../../../../../../../core/composables/useAppBarMobileButtons";
import AppBarOverlay from "./AppBarOverlay.vue";
import { useAppBarMobileActions } from "./../composables/useAppBarMobileActions";
import { MaybeRef, ref, watch } from "vue";
import { vOnClickOutside } from "@vueuse/components";
import { AppBarButtonContent } from "../../../../../../../core/services/app-bar-mobile-buttons-service";
import { useRoute } from "vue-router";

export interface Props {
  isSidebarMode: boolean;
  expanded: MaybeRef<boolean>;
}

defineProps<Props>();

const { getButtons } = useAppBarMobileButtons();
const { currentAction, toggleAction, hideAllActions, isAnyActionVisible } = useAppBarMobileActions();
const route = useRoute();

const handleButtonClick = (button: AppBarButtonContent) => {
  // If the current button is already active - hide it
  if (currentAction.value?.id === button.id) {
    button.onClose?.();
    hideAllActions();
    return;
  }

  // If the previous active button exists - close it
  if (currentAction.value) {
    currentAction.value.onClose?.();
  }

  // Enable the new button
  toggleAction(button.id);

  // Call onClick for a button without a component
  if (!button.component && button.onClick) {
    button.onClick();
  }
};

const handleClose = (button: AppBarButtonContent) => {
  button.onClose?.();
  hideAllActions();
};

// Hide actions when route changes
watch(route, () => {
  hideAllActions();
});
</script>
```

This implementation demonstrates how the App Bar Mobile Buttons Service:

1. Provides access to registered buttons via `getButtons`
2. Supports toggling button actions and associated components
3. Manages button state and visibility

## Template Rendering

The mobile buttons are rendered in the template with their proper event handlers and visibility conditions:

```vue
<!-- From framework/ui/components/organisms/vc-app/_internal/vc-app-bar/_internal/AppBarMobileActions.vue -->
<template>
  <div
    v-if="$isMobile.value"
    class="app-bar-mobile-actions"
  >
    <div
      v-for="button in getButtons"
      :key="button.id"
    >
      <VcButton
        v-if="button.isVisible !== undefined ? button.isVisible : true"
        text
        class="app-bar-mobile-actions__button"
        :class="{ 'app-bar-mobile-actions__button--active': button.id === currentAction?.id }"
        :icon="button.icon"
        icon-size="l"
        @click="handleButtonClick(button)"
      />
    </div>

    <Transition name="overlay">
      <AppBarOverlay
        v-if="isAnyActionVisible && currentAction?.component"
        :is-sidebar-mode="isSidebarMode"
        :expanded="expanded"
      >
        <component
          :is="currentAction?.component"
          v-bind="currentAction?.props || {}"
          v-on-click-outside="[handleClose, { ignore: ['.app-bar-mobile-actions__button'] }]"
          @close="handleClose"
        />
      </AppBarOverlay>
    </Transition>
  </div>
</template>
```

## Integration with Other Services

The App Bar Mobile Buttons Service often works with other services, such as the Global Search Service. Here's an example of registering a search button in a table header component:

```typescript
// From framework/ui/components/organisms/vc-table/_internal/vc-table-header/vc-table-header.vue
const { register: registerMobileButton, unregister: unregisterMobileButton } = useAppBarMobileButtons();
const globalSearch = useGlobalSearch();

// Configure search button
const searchButtonConfig = ref({
  id: "global-search",
  icon: SearchIcon,
  onClick: () => {
    globalSearch.toggleSearch(bladeId.value);
  },
  onClose: () => {
    globalSearch.closeSearch(bladeId.value);
  },
  isVisible: computed(() => Boolean(blade.value?.navigation?.idx === 0 && showHeader.value)),
  order: 5,
});

// Register and unregister the button based on component lifecycle
onMounted(() => {
  if (props.hasHeaderSlot || props.header) {
    registerMobileButton(searchButtonConfig.value);
  }
});

onBeforeUnmount(() => {
  unregisterMobileButton("global-search");
});
```

## Best Practices

1. **Button Identification**: Always use unique, descriptive IDs for buttons to avoid conflicts.

2. **Clean Up on Unmount**: Always unregister buttons when their associated components are unmounted.

3. **Order Planning**: Plan your button order values in advance to maintain a consistent layout.

4. **Visibility Control**: Use computed properties for dynamic button visibility control.

5. **Component Integration**: When a button needs to display additional content, provide a component and handle its visibility appropriately.

6. **Route Changes**: Consider hiding or updating button states when routes change.

## Related Composables

- `useAppBarMobileButtons`: Provides access to the App Bar Mobile Buttons Service within Vue components.
- `provideAppBarMobileButtonsService`: Creates and provides the App Bar Mobile Buttons Service to the component tree. 
