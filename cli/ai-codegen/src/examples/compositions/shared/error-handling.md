# Error Handling Pattern

Standardized error handling with user notifications.

## Description
Provides:
- Try-catch wrappers for async operations
- Error logging
- User-friendly error messages
- Error recovery strategies

## Usage
Apply to any async operations (load, save, delete, etc.).

## Code

```typescript
import { useNotifications } from "@vc-shell/framework";

const { notification } = useNotifications();

// Load with error handling
async function loadWithErrorHandling(id: string) {
  loading.value = true;
  try {
    const data = await fetchEntity(id);
    entity.value = data;
  } catch (error) {
    console.error("Failed to load entity:", error);

    notification.error(
      error instanceof Error ? error.message : "Failed to load data",
      {
        timeout: 5000,
      }
    );

    // Optional: redirect or retry
    // emit("close", { error: true });
  } finally {
    loading.value = false;
  }
}

// Save with error handling
async function saveWithErrorHandling() {
  loading.value = true;
  try {
    await saveEntity(entity.value);
    modified.value = false;

    notification.success("Saved successfully", {
      timeout: 3000,
    });
  } catch (error) {
    console.error("Failed to save entity:", error);

    notification.error(
      error instanceof Error ? error.message : "Failed to save",
      {
        timeout: 5000,
      }
    );
  } finally {
    loading.value = false;
  }
}

// Delete with error handling and confirmation
async function deleteWithErrorHandling(id: string) {
  const confirmed = await confirm(
    "Delete this item?",
    "This action cannot be undone."
  );

  if (!confirmed) return;

  loading.value = true;
  try {
    await deleteEntity(id);

    notification.success("Deleted successfully", {
      timeout: 3000,
    });

    // Reload list or close blade
    await load();
  } catch (error) {
    console.error("Failed to delete entity:", error);

    notification.error(
      error instanceof Error ? error.message : "Failed to delete",
      {
        timeout: 5000,
      }
    );
  } finally {
    loading.value = false;
  }
}

// Batch operation with partial error handling
async function batchDeleteWithErrorHandling(ids: string[]) {
  const confirmed = await confirm(
    `Delete ${ids.length} items?`,
    "This action cannot be undone."
  );

  if (!confirmed) return;

  loading.value = true;
  const errors: Array<{ id: string; error: string }> = [];

  for (const id of ids) {
    try {
      await deleteEntity(id);
    } catch (error) {
      errors.push({
        id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  loading.value = false;

  if (errors.length === 0) {
    notification.success(`Deleted ${ids.length} items successfully`, {
      timeout: 3000,
    });
  } else if (errors.length < ids.length) {
    notification.warning(
      `Deleted ${ids.length - errors.length} items, ${errors.length} failed`,
      {
        timeout: 5000,
      }
    );
  } else {
    notification.error("Failed to delete items", {
      timeout: 5000,
    });
  }

  await load();
}
```

```typescript
// Network error detection
function handleNetworkError(error: unknown) {
  if (error instanceof TypeError && error.message.includes("fetch")) {
    notification.error("Network error. Please check your connection.", {
      timeout: 5000,
    });
    return true;
  }
  return false;
}

// API error response handling
function handleApiError(error: unknown) {
  if (error && typeof error === "object" && "status" in error) {
    const apiError = error as { status: number; message?: string };

    switch (apiError.status) {
      case 400:
        notification.error(apiError.message || "Invalid request", {
          timeout: 5000,
        });
        break;
      case 401:
        notification.error("Unauthorized. Please login again.", {
          timeout: 5000,
        });
        // Redirect to login
        break;
      case 403:
        notification.error("You don't have permission to perform this action.", {
          timeout: 5000,
        });
        break;
      case 404:
        notification.error("Resource not found.", {
          timeout: 5000,
        });
        break;
      case 500:
        notification.error("Server error. Please try again later.", {
          timeout: 5000,
        });
        break;
      default:
        notification.error(apiError.message || "An error occurred", {
          timeout: 5000,
        });
    }
    return true;
  }
  return false;
}
```
