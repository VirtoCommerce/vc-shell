# VC-Shell Framework Services Documentation

This is the index of all service documentation for the VC-Shell framework. Each service plays a key role in the framework's architecture, providing specific functionality for building feature-rich applications.

## Core Services

| Service | Description | Documentation |
|---------|-------------|---------------|
| **Widget Service** | Manages UI components that can be dynamically registered to blades in the application | [Widget Service Documentation](./widget-service.md) |
| **Menu Service** | Manages the application's navigation menu structure with support for grouping and localization | [Menu Service Documentation](./menu-service.md) |
| **Dashboard Service** | Manages and organizes dashboard widgets with support for layouts and permissions | [Dashboard Service Documentation](./dashboard-service.md) |
| **Global Search Service** | Provides a centralized mechanism for implementing search functionality across the application | [Global Search Service Documentation](./global-search-service.md) |
| **App Bar Mobile Buttons Service** | Manages the buttons displayed in the mobile application bar | [App Bar Mobile Buttons Service Documentation](./app-bar-mobile-buttons-service.md) |
| **App Bar Menu Service** | Manages the menu items displayed in the application bar | [App Bar Menu Service Documentation](./app-bar-menu-service.md) |
| **Settings Menu Service** | Manages the items displayed in the settings menu with priority-based ordering | [Settings Menu Service Documentation](./settings-menu-service.md) |
| **Toolbar Service** | Manages the items displayed in the toolbar with priority-based ordering | [Toolbar Service Documentation](./toolbar-service.md) |

## Service Architecture

The services in VC-Shell follow a consistent architecture pattern:

1. **Service Definition**: Each service is defined in its own file in the `/framework/core/services/` directory
2. **Composable Interface**: Services are exposed through composables in the `/framework/core/composables/` directory
3. **Dependency Injection**: Services are provided to components using Vue's provide/inject pattern
4. **Pre-Registration Support**: Most services support registering items before the service is initialized

## Common Service Features

Most services in the VC-Shell framework share the following common features:

- **Registration/Unregistration**: Add or remove items from the service
- **Retrieval**: Get items managed by the service
- **Ordering**: Sort items based on priority values
- **Permission Control**: Restrict visibility based on user permissions
- **Reactivity**: Reactive references for view updates
- **Pre-Registration**: Register items before service initialization

## Getting Started

To use services in your components:

1. Import the appropriate composable from the framework:
   ```typescript
   import { useWidgets, useMenuService, useDashboard, /* etc */ } from '@vc-shell/framework';
   ```

2. Use the composable in your component's setup function:
   ```typescript
   const widgets = useWidgets();
   const menuService = useMenuService();
   ```

3. Access service methods and properties:
   ```typescript
   // Register an item
   widgets.registerWidget({...}, 'blade-id');
   
   // Get items
   const menuItems = menuService.menuItems;
   ```

## Best Practices

When working with VC-Shell services, we recommend the following best practices:

1. **Clean Up**: Always unregister items when components are unmounted
2. **Unique IDs**: Use descriptive, unique IDs for all registered items
3. **Permission Planning**: Design your permission structure consistently across services
4. **Priority Values**: Use consistent priority scales across your application
5. **Component Optimization**: Use `markRaw` for components to prevent unnecessary reactivity 
