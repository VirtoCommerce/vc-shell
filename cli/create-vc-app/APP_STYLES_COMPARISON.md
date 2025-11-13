# App Initialization Styles - Comparison

Visual comparison of two common patterns for initializing Vue apps in VC-Shell.

---

## Style 1: Chain (Method Chaining) ⛓️

**Used in:** `auth-test-app`, most generated apps

### Pattern

```typescript
const app = createApp(RouterView)
  .use(VirtoShellFramework, {
    router,
    i18n: { /* ... */ }
  })
  .use(ProductsModule, { router })
  .use(OrdersModule, { router })
  .use(router);

bootstrap(app);
app.mount("#app");
```

### Characteristics

- ✅ One-liner declaration (continued with `.`)
- ✅ Fluent interface
- ✅ Compact syntax
- ⚠️ Harder to add conditional logic
- ⚠️ Harder to insert async operations

### CLI Generated Code

```typescript
.use(NewModule, { router })  // ← No "app." prefix
```

---

## Style 2: Separate Statements 📝

**Used in:** `vendor-portal`, complex apps with dynamic loading

### Pattern

```typescript
const app = createApp(RouterView);

const { load } = useDynamicModules(app, { router });

app.use(VirtoShellFramework, {
  router,
  i18n: { /* ... */ }
});

app.use(ProductsModule, { router });
app.use(OrdersModule, { router });

await load();  // ← Can insert async operations

app.use(router);

bootstrap(app);
app.mount("#app");
```

### Characteristics

- ✅ Each `.use()` is separate statement
- ✅ Easy to add conditional logic
- ✅ Easy to insert async operations
- ✅ Can store intermediate results
- ⚠️ More verbose

### CLI Generated Code

```typescript
app.use(NewModule, { router });  // ← Has "app." prefix and semicolon
```

---

## Side-by-Side Comparison

| Feature | Chain Style | Separate Style |
|---------|-------------|----------------|
| **Declaration** | `const app = createApp()` | `const app = createApp();` |
| **Continuation** | `.use()...` | `app.use()...;` |
| **Terminator** | Last `.use(router);` | Each line ends with `;` |
| **Async support** | ❌ No | ✅ Yes |
| **Conditionals** | ❌ Difficult | ✅ Easy |
| **Line count** | Lower | Higher |
| **Readability** | Compact | Explicit |

---

## Detection Logic

### How CLI Detects Style

```typescript
// 1. Find app declaration
const createAppMatch = content.match(
  /const\s+app\s*=\s*createApp\([^)]*\)([;\s]*\n)/
);

// 2. Check what comes after
const afterCreateApp = content.slice(
  afterDeclaration, 
  afterDeclaration + 50
);

// 3. Determine style
const isChainStyle = /^\s*\.use\(/.test(afterCreateApp);
//                   └─ Starts with .use? → Chain
//                   └─ Otherwise → Separate
```

### Examples

**Input 1:**
```typescript
const app = createApp(RouterView)
  .use(VirtoShellFramework, { router })
```
**Detection:** `isChainStyle = true` (next line starts with `.use`)

**Input 2:**
```typescript
const app = createApp(RouterView);

app.use(VirtoShellFramework, { router });
```
**Detection:** `isChainStyle = false` (semicolon, no immediate `.use`)

---

## Generated Code Examples

### Chain Style Result

**Before:**
```typescript
const app = createApp(RouterView)
  .use(VirtoShellFramework, { router })
  .use(router);
```

**After CLI adds module:**
```typescript
import ProductsModule from "./modules/products";

const app = createApp(RouterView)
  .use(VirtoShellFramework, { router })
  .use(ProductsModule, { router })  // ← Added by CLI
  .use(router);
```

### Separate Style Result

**Before:**
```typescript
const app = createApp(RouterView);

app.use(VirtoShellFramework, { router });
app.use(router);
```

**After CLI adds module:**
```typescript
import ProductsModule from "./modules/products";

const app = createApp(RouterView);

app.use(VirtoShellFramework, { router });
app.use(ProductsModule, { router });  // ← Added by CLI
app.use(router);
```

---

## When to Use Each Style

### Use Chain Style When:

- ✅ Simple, straightforward app initialization
- ✅ No dynamic module loading
- ✅ No conditional logic needed
- ✅ Prefer compact code
- ✅ Generated app (default from CLI)

**Example:**
```typescript
const app = createApp(RouterView)
  .use(VirtoShellFramework, { router })
  .use(Module1, { router })
  .use(Module2, { router })
  .use(router);
```

### Use Separate Style When:

- ✅ Complex initialization logic
- ✅ Dynamic module loading (`useDynamicModules`)
- ✅ Conditional module registration
- ✅ Async operations between `.use()` calls
- ✅ Need intermediate variables

**Example:**
```typescript
const app = createApp(RouterView);

const { load } = useDynamicModules(app, { router });

app.use(VirtoShellFramework, { router });

if (process.env.USE_PRODUCTS) {
  app.use(ProductsModule, { router });
}

await load();  // Load remote modules

app.use(router);
```

---

## Migration Between Styles

### Chain → Separate

**Before:**
```typescript
const app = createApp(RouterView)
  .use(Module1, { router })
  .use(router);
```

**After:**
```typescript
const app = createApp(RouterView);

app.use(Module1, { router });
app.use(router);
```

**Steps:**
1. Add `;` after `createApp(RouterView)`
2. Change `.use(` to `app.use(`
3. Add `;` at end of each `.use()`

### Separate → Chain

**Before:**
```typescript
const app = createApp(RouterView);

app.use(Module1, { router });
app.use(router);
```

**After:**
```typescript
const app = createApp(RouterView)
  .use(Module1, { router })
  .use(router);
```

**Steps:**
1. Remove `;` after `createApp(RouterView)`
2. Change `app.use(` to `.use(`
3. Remove `;` from each `.use()` except last

---

## ⚠️ Common Mistakes

### Mistake 1: Mixing Styles

```typescript
// ❌ Wrong: starts chain but uses app.use
const app = createApp(RouterView)
  .use(Module1, { router });

app.use(router);  // Error: app already consumed by chain
```

### Mistake 2: Hanging .use()

```typescript
// ❌ Wrong: .use() without app or chain
const app = createApp(RouterView);

.use(Module1, { router });  // Syntax error!
```

### Mistake 3: Missing Terminator

```typescript
// ❌ Wrong: chain without final use(router)
const app = createApp(RouterView)
  .use(Module1, { router })
  .use(Module2, { router })

app.mount("#app");  // Error: app not defined
```

---

## 📚 TypeScript Considerations

Both styles are type-safe:

```typescript
// Chain - returns App<Element>
const app: App<Element> = createApp(RouterView)
  .use(plugin1)
  .use(plugin2);

// Separate - app is App<Element>
const app: App<Element> = createApp(RouterView);
app.use(plugin1);
app.use(plugin2);
```

---

## ✅ Recommendations

### For New Projects

**Start with Chain Style:**
- Simpler
- Less code
- Default from CLI
- Easy to read

**Switch to Separate Style when you need:**
- Dynamic modules
- Conditional logic
- Async operations
- Complex initialization

### For Existing Projects

**Keep your current style** - both are fully supported by CLI!

---

## 🎯 Summary

| Aspect | Chain | Separate |
|--------|-------|----------|
| **Syntax** | `.use()` | `app.use()` |
| **Best for** | Simple apps | Complex apps |
| **CLI support** | ✅ Auto-detected | ✅ Auto-detected |
| **Async** | ❌ No | ✅ Yes |
| **Lines** | Fewer | More |

**Both styles work perfectly with CLI!** The CLI automatically detects which style you're using and generates appropriate code. 🎉

---

**Choose the style that fits your app's complexity!**



