# Notifications System

## Overview

The VC-Shell notification system provides a flexible and customizable way to display notifications in your Vue.js application. The system supports different types of notifications, multiple positioning options with position-specific animations, timeouts, and custom content.

## Architecture

The notification system follows a modular architecture with clear separation of concerns:

- **Core API**: Main notification functionality exposed through the `notification` object
- **Container**: Manages the rendering and positioning of notifications
- **Components**: Visual representation of individual notifications
- **Composables**: Reusable logic for notification management

## Installation and Setup

No additional setup is required as the notification system is integrated into the VC-Shell framework.

## Basic Usage

```typescript
import { notification } from 'framework/shared/components/notifications';

// Basic notification
notification('This is a notification');

// Success notification
notification.success('Operation completed successfully');

// Error notification
notification.error('An error occurred');

// Warning notification
notification.warning('Warning: This action cannot be undone');
```

## API Reference

### Main Methods

```typescript
// Basic notification (type: default)
notification(content: Content, options?: NotificationOptions): string | number;

// Type-specific notifications
notification.success(content: Content, options?: NotificationOptions): string | number;
notification.error(content: Content, options?: NotificationOptions): string | number;
notification.warning(content: Content, options?: NotificationOptions): string | number;

// Remove specific notification by ID
notification.remove(notificationId?: number | string): void;

// Remove all notifications
notification.clearAll(): void;

// Remove all notifications in a specific position
notification.clearPosition(position: NotificationPosition): void;

// Update existing notification
notification.update(notificationId: string | number, options: NotificationOptions): void;

// Set global position for notifications
notification.setPosition(position: NotificationPosition): void;
```

### Options

```typescript
interface NotificationOptions {
  // Maximum number of notifications to display at once (per position)
  limit?: number;
  
  // Whether to pause timeout when hovering
  pauseOnHover?: boolean;
  
  // Timeout in milliseconds, or false for no timeout
  timeout?: number | boolean;
  
  // Content to display in the notification
  content?: Content;
  
  // Unique identifier for the notification
  notificationId?: number | string;
  
  // Type of notification (default, success, error, warning)
  type?: NotificationType;
  
  // Callback function when notification is opened
  onOpen?: <T>(payload: T) => void;
  
  // Callback function when notification is closed
  onClose?: <T>(payload: T) => void;
  
  // Custom data to pass to callbacks
  payload?: string | Record<string, any>;
  
  // ID for updating existing notification
  updateId?: string | number;
  
  // Position on screen
  position?: NotificationPosition;
}
```

### Content Types

Notifications support the following content types:

```typescript
type Content = string | VNode | DefineComponent<{}, {}, any>;
```

### Positioning and Animations

Notifications can be positioned in six different locations on the screen, each with its own unique entrance and exit animations:

```typescript
type NotificationPosition = 
  | 'top-center'    // Slides down from top
  | 'top-right'     // Slides from top-right corner
  | 'top-left'      // Slides from top-left corner
  | 'bottom-center' // Slides up from bottom
  | 'bottom-right'  // Slides from bottom-right corner
  | 'bottom-left'   // Slides from bottom-left corner
```

Each position has a tailored animation that feels natural and intuitive:
- Top positions slide in from above
- Bottom positions slide in from below
- Side positions slide in diagonally from their respective corners

## Visual Features

The notification system includes the following visual enhancements:

- **Color-coded type indicators**: Each notification type has a colored indicator bar
- **Smooth animations**: Position-specific animations with spring-like easing
- **Hover effects**: Enhanced shadow and visual feedback on hover
- **Interactive dismiss button**: Rotating effect on hover
- **Scaled exit animations**: Notifications scale slightly down while exiting

## Advanced Usage

### Custom Component as Content

```typescript
import MyCustomComponent from './MyCustomComponent.vue';

notification({
  content: MyCustomComponent,
  timeout: 5000,
  position: 'top-right'
});
```

### Multiple Positioned Notifications

```typescript
// Show notifications in different positions simultaneously
notification.success('Top right notification', {
  position: 'top-right'
});

notification.error('Bottom left notification', {
  position: 'bottom-left'
});

// Each position maintains its own queue and limit
notification.warning('Another top right', {
  position: 'top-right', 
  limit: 2
});
```

### Updating Notifications

```typescript
// Create notification and get its ID
const notificationId = notification.success('Processing...', {
  position: 'top-right'
});

// Later, update the notification
// You can even move it to a different position
notification.update(notificationId, {
  content: 'Process completed successfully',
  type: 'success',
  position: 'bottom-right'
});
```

### Using Callbacks

```typescript
notification.success('Operation successful', {
  onOpen: (payload) => {
    console.log('Notification opened:', payload);
  },
  onClose: (payload) => {
    console.log('Notification closed:', payload);
  },
  payload: { id: 123, operation: 'data-transfer' }
});
```

### Clearing Specific Positions

```typescript
// Clear only notifications in the top-right position
notification.clearPosition('top-right');

// Clear all notifications regardless of position
notification.clearAll();
```

## Styling

The notification system uses CSS variables for easy customization:

```css
:root {
  /* Basic appearance */
  --notification-background: var(--additional-50);
  --notification-border-radius: var(--multivalue-border-radius);
  --notification-border-color: var(--neutrals-200);
  --notification-content-color: var(--neutrals-600);
  --notification-dismiss-color: var(--secondary-500);

  /* Type indicators */
  --notification-warning: var(--warning-500);
  --notification-error: var(--danger-500);
  --notification-success: var(--success-500);
  --notification-info: var(--info-500);

  /* Effects and animations */
  --notification-shadow-color: var(--neutrals-300);
  --notification-shadow: 2px 2px 11px rgb(from var(--notification-shadow-color) r g b / 40%);
  --notification-hover-shadow: 2px 2px 15px rgb(from var(--notification-shadow-color) r g b / 60%);
  --notification-animation-duration: 300ms;
  --notification-animation-timing: cubic-bezier(0.175, 0.885, 0.32, 1.275); /* Spring-like animation */
  --notification-slide-distance: 30px;
  
  /* Layout */
  --notification-indicator-width: 4px;
}
```

## Accessibility

Notifications are designed with accessibility in mind:
- Proper focus management
- Color contrast compliance
- Keyboard navigation support
- Screen reader announcements
- Visible type indicators not dependent on color alone

## Mobile Support

The notification system is fully responsive and adapts to mobile screens:
- Adjusts width and positioning on small screens
- Touch-friendly dismiss buttons
- Optimized for different device orientations
- Tailored animations for smaller viewports

## Performance Considerations

- Notifications are rendered only when needed
- Components are unmounted when not in use
- Efficient DOM manipulation with Vue's virtual DOM
- Proper cleanup of event listeners and timeouts
- Multiple containers are created only when needed
- Animation uses hardware acceleration where possible (transform, opacity)

## Common Patterns and Examples

### Dashboard Layout with Multiple Notification Areas

```typescript
// Configure notifications for different areas of your dashboard

// System alerts (top center)
notification.warning('System maintenance scheduled', {
  position: 'top-center',
  timeout: false
});

// User actions feedback (top right)
notification.success('Settings saved successfully', {
  position: 'top-right',
  timeout: 3000
});

// Process updates (bottom right)
notification.info('Backup in progress', {
  position: 'bottom-right',
  timeout: false
});

// Warnings and errors (bottom left)
notification.error('Connection lost to secondary server', {
  position: 'bottom-left',
  timeout: false
});
```

### Process Feedback in Different Locations

```typescript
// Show concurrent notifications in different positions
const uploadingId = notification('Uploading files...', {
  timeout: false,
  position: 'top-right'
});

const processingId = notification('Processing data...', {
  timeout: false,
  position: 'bottom-right'
});

// Later update them independently
notification.update(uploadingId, {
  content: 'Upload complete',
  type: 'success',
  timeout: 3000
});

notification.update(processingId, {
  content: 'Processing complete',
  type: 'success',
  timeout: 3000
});
```

## Browser Compatibility

The notification system is compatible with all modern browsers including:
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers on iOS and Android

## Troubleshooting

Common issues and their solutions:
- **Notifications not appearing**: Check z-index conflicts
- **Animations not working**: Verify browser support for CSS animations
- **Custom components not rendering**: Ensure proper import/export
- **Overlapping notifications**: Adjust position or limit for each position
- **Animation performance issues**: Reduce the complexity of animations on lower-end devices
