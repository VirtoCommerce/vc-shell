# create-vc-app

Scaffolding tool for VC Shell applications and modules.

## Create a New Project

```bash
npx @vc-shell/create-vc-app [project-name]
```

Interactive prompts guide you through project setup. Two project types are available:

| Type               | Description                                        |
| ------------------ | -------------------------------------------------- |
| **Standalone App** | Full application with bundled modules              |
| **Dynamic Module** | Remote module loaded by host via Module Federation |

### Non-Interactive Mode

Pass flags to skip prompts:

```bash
# Standalone app with dashboard and sample data
npx @vc-shell/create-vc-app my-app --type standalone --module-name "Products" --dashboard --mocks

# Dynamic module
npx @vc-shell/create-vc-app my-module --type dynamic-module --module-name "Reviews"
```

### Options

| Option                 | Description                                      | Default                |
| ---------------------- | ------------------------------------------------ | ---------------------- |
| `--type <type>`        | Project type: `standalone` \| `dynamic-module` ` | _(prompted)_           |
| `--name`, `--app-name` | Application name                                 | Directory name         |
| `--package-name`       | npm package name                                 | App name (validated)   |
| `--module-name`        | Initial module name                              | App name in title case |
| `--base-path`          | Base path for the application                    | `/apps/<name>/`        |
| `--tenant-routes`      | Include tenant routing (`/:tenantId` prefix)     | `false`                |
| `--ai-agent`           | Include AI Agent configuration                   | `false`                |
| `--dashboard`          | Include Dashboard with widgets                   | `false`                |
| `--mocks`              | Include sample module with mock data             | `false`                |
| `--overwrite`          | Overwrite existing files without confirmation    | `false`                |
| `--help`, `-h`         | Show help                                        | —                      |
| `--version`, `-v`      | Show version                                     | —                      |

## Add a Module to Existing Project

From your project root:

```bash
npx @vc-shell/create-vc-app add-module <module-name>
```

This will:

1. Create `src/modules/<module-name>/` with list + details pages
2. Update `src/main.ts` — add import and `app.use()`
3. Update `src/bootstrap.ts` — add menu item

If `main.ts` or `bootstrap.ts` can't be parsed automatically, manual instructions are printed.

## After Creation

```bash
cd <project-name>
yarn install
yarn serve
```

## Documentation

https://docs.virtocommerce.org/platform/developer-guide/latest/custom-apps-development/vc-shell/vc-shell-overview/
