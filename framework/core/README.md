# VC-Shell Framework Services and Composables Documentation

This document provides an overview of all services and their corresponding composables in the VC-Shell framework.

## Table of Contents

- [VC-Shell Framework Services and Composables Documentation](#vc-shell-framework-services-and-composables-documentation)
  - [Table of Contents](#table-of-contents)
  - [Services](#services)
    - [Widget Service](#widget-service)
    - [Menu Service](#menu-service)
    - [Dashboard Service](#dashboard-service)
    - [App Bar Mobile Buttons Service](#app-bar-mobile-buttons-service)
    - [Global Search Service](#global-search-service)
    - [App Bar Menu Service](#app-bar-menu-service)
    - [Settings Menu Service](#settings-menu-service)
  - [Composables](#composables)
    - [useWidgets](#usewidgets)
    - [useMenuService](#usemenuservice)
    - [useDashboard](#usedashboard)
    - [useAppBarMobileButtons](#useappbarmobilebuttons)
    - [useGlobalSearch](#useglobalsearch)
    - [useAppBarWidget](#useappbarwidget)
    - [useSettingsMenu](#usesettingsmenu)

## Services

### Widget Service

**File:** `/framework/core/services/widget-service.ts`

The Widget Service manages UI components that can be dynamically registered to blades in the application. It provides a central registry for managing widget instances across the application.

**Key Features:**
- Register and unregister widgets to specific blades
- Track active widgets
- Get widgets associated with specific blades
- Update widget properties

**API:**
```typescript
interface IWidgetService {
  registerWidget: (widget: IWidget, bladeId: string) => void;
  unregisterWidget: (widgetId: string, bladeId: string) => void;
  getWidgets: (bladeId: string) => IWidget[];
  clearBladeWidgets: (bladeId: string) => void;
  registeredWidgets: IWidgetRegistration[];
  isActiveWidget: (id: string) => boolean;
  setActiveWidget: (ref: ComponentInternalInstance["exposed"]) => void;
  updateActiveWidget: () => void;
  isWidgetRegistered: (id: string) => boolean;
  updateWidget: ({ id, bladeId, widget }: { id: string; bladeId: string; widget: Partial<IWidget> }) => void;
}
```

### Menu Service

**File:** `/framework/core/services/menu-service.ts`

The Menu Service manages the application's navigation menu structure. It provides functionality for registering, organizing, and retrieving menu items, including support for grouping items and localization.

**Key Features:**
- Add and remove menu items
- Automatic grouping of menu items
- Priority-based ordering
- Support for localized menu item titles
- Pre-registration mechanism for items added before service initialization

**API:**
```typescript
interface MenuService {
  addMenuItem: (item: MenuItem) => void;
  menuItems: Ref<MenuItem[]>;
  removeMenuItem: (item: MenuItem) => void;
}
```

### Dashboard Service

**File:** `/framework/core/services/dashboard-service.ts`

The Dashboard Service manages and organizes dashboard widgets. It provides functionality for registering widgets, updating their positions, and retrieving widgets based on user permissions.

**Key Features:**
- Register dashboard widgets
- Retrieve widgets with permission checking
- Update widget positions
- Get the layout of dashboard widgets

**API:**
```typescript
interface IDashboardService {
  registerWidget: (widget: DashboardWidget) => void;
  getWidgets: () => DashboardWidget[];
  updateWidgetPosition: (widgetId: string, position: DashboardWidgetPosition) => void;
  getLayout: () => Map<string, DashboardWidgetPosition>;
}
```

### App Bar Mobile Buttons Service

**File:** `/framework/core/services/app-bar-mobile-buttons-service.ts`

The App Bar Mobile Buttons Service manages the buttons displayed in the mobile application bar. It provides functionality for registering, organizing, and retrieving these buttons.

**Key Features:**
- Register and unregister mobile buttons
- Retrieve buttons with permission checking
- Support for prioritization and ordering

### Global Search Service

**File:** `/framework/core/services/global-search-service.ts`

The Global Search Service provides a centralized mechanism for searching across the application. It allows registering search providers and executing search operations.

**Key Features:**
- Register search providers
- Execute search operations
- Handle search results

### App Bar Menu Service

**File:** `/framework/core/services/app-bar-menu-service.ts`

The App Bar Menu Service manages the menu items displayed in the application bar. It provides functionality for registering, organizing, and retrieving these menu items.

**Key Features:**
- Register and manage app bar menu items
- Support for grouping and organization
- Priority-based ordering

### Settings Menu Service

**File:** `/framework/core/services/settings-menu-service.ts`

The Settings Menu Service manages the items displayed in the settings menu. It provides functionality for registering, organizing, and retrieving settings menu items.

**Key Features:**
- Register and manage settings menu items
- Support for grouping and organization
- Priority-based ordering

## Composables

### useWidgets

**File:** `/framework/core/composables/useWidgets/index.ts`

The useWidgets composable provides access to the Widget Service within Vue components. It also includes functions for providing the Widget Service to child components.

**Key Functions:**
- `provideWidgetService()`: Creates and provides the Widget Service to the component tree
- `useWidgets()`: Retrieves the Widget Service instance from the component's injection context
- `registerWidget()`: Utility function to pre-register widgets before service initialization

**Usage Example:**
```typescript
import { useWidgets } from '@vc-shell/framework';

export default {
  setup() {
    const widgetService = useWidgets();
    
    // Register a widget to a blade
    widgetService.registerWidget({
      id: 'my-widget',
      component: MyWidgetComponent,
      title: 'My Widget'
    }, 'blade-id');
    
    return { 
      // Access widget service methods
      getWidgets: widgetService.getWidgets 
    };
  }
};
```

### useMenuService

**File:** `/framework/core/composables/useMenuService/index.ts`

The useMenuService composable provides access to the Menu Service within Vue components. It also includes functions for providing the Menu Service to child components.

**Key Functions:**
- `provideMenuService()`: Creates and provides the Menu Service to the component tree
- `useMenuService()`: Retrieves the Menu Service instance from the component's injection context
- `addMenuItem()`: Utility function to pre-register menu items before service initialization

**Usage Example:**
```typescript
import { useMenuService } from '@vc-shell/framework';

export default {
  setup() {
    const menuService = useMenuService();
    
    // Add a menu item
    menuService.addMenuItem({
      title: 'New Item',
      path: '/new-item',
      priority: 100
    });
    
    return { 
      menuItems: menuService.menuItems 
    };
  }
};
```

### useDashboard

**File:** `/framework/core/composables/useDashboard/index.ts`

The useDashboard composable provides access to the Dashboard Service within Vue components. It also includes functions for providing the Dashboard Service to child components.

**Key Functions:**
- `provideDashboardService()`: Creates and provides the Dashboard Service to the component tree
- `useDashboard()`: Retrieves the Dashboard Service instance from the component's injection context
- `registerDashboardWidget()`: Utility function to pre-register dashboard widgets before service initialization

**Usage Example:**
```typescript
import { useDashboard } from '@vc-shell/framework';

export default {
  setup() {
    const dashboardService = useDashboard();
    
    // Register a dashboard widget
    dashboardService.registerWidget({
      id: 'sales-widget',
      name: 'Sales Overview',
      component: SalesWidgetComponent,
      size: { width: 2, height: 1 }
    });
    
    return { 
      widgets: dashboardService.getWidgets() 
    };
  }
};
```

### useAppBarMobileButtons

**File:** `/framework/core/composables/useAppBarMobileButtons/index.ts`

The useAppBarMobileButtons composable provides access to the App Bar Mobile Buttons Service within Vue components.

**Key Functions:**
- `provideAppBarMobileButtonsService()`: Creates and provides the service to the component tree
- `useAppBarMobileButtons()`: Retrieves the service instance from the component's injection context

### useGlobalSearch

**File:** `/framework/core/composables/useGlobalSearch/index.ts`

The useGlobalSearch composable provides access to the Global Search Service within Vue components.

**Key Functions:**
- `provideGlobalSearchService()`: Creates and provides the service to the component tree
- `useGlobalSearch()`: Retrieves the service instance from the component's injection context

### useAppBarWidget

**File:** `/framework/core/composables/useAppBarWidget/index.ts`

The useAppBarWidget composable provides functionality for managing widgets in the application bar.

**Key Functions:**
- Retrieve and manage app bar widgets
- Register custom app bar widgets

### useSettingsMenu

**File:** `/framework/core/composables/useSettingsMenu/index.ts`

The useSettingsMenu composable provides access to the Settings Menu Service within Vue components.

**Key Functions:**
- `provideSettingsMenuService()`: Creates and provides the service to the component tree
- `useSettingsMenu()`: Retrieves the service instance from the component's injection context 
