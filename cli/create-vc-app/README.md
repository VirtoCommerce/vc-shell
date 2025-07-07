# Creating your first application

Make sure you have executed `yarn` command and your current working directory is the one where you intend to create a project.

## Interactive Mode (Default)

Run following command:
```bash
$ npx create-vc-app
```

This command will execute application scaffolding tool. You will be presented with prompts:

```text
✔ Project name: … <your-app-name>
✔ Package name: … <your-package-name>
✔ Base path: … /apps/<your-app-name>/
✔ Select module variant: › Classic view modules boilerplate
✔ Module name: … <your-first-module-name>
✔ Do you want to include additional module with sample data? … No / Yes

Scaffolding app in ./<your-app-name>...

Done.
```

## Non-Interactive Mode

For automation, CI/CD, or when you want to skip prompts, you can use command line arguments:

```bash
$ npx create-vc-app my-app --variant classic --module-name "My Module" --mocks
```

### Available Options

| Option | Description | Default |
|--------|-------------|---------|
| `--name`, `--app-name` | Name of the application | Directory name |
| `--package-name` | Package name | App name (validated) |
| `--variant` | Module variant (classic\|dynamic) | `classic` |
| `--module-name` | Module name | App name in title case |
| `--base-path` | Base path for the application | `/apps/<app-name>/` |
| `--mocks` | Include additional module with sample data | `false` |
| `--overwrite` | Overwrite existing files without confirmation | `false` |
| `--help`, `-h` | Show help message | - |
| `--version`, `-v` | Show version | - |

### Examples

**Basic usage:**
```bash
npx create-vc-app my-app
```

**With custom options:**
```bash
npx create-vc-app my-app --variant classic --module-name "My Module" --mocks
```

**With custom paths:**
```bash
npx create-vc-app my-app --base-path "/custom/path/" --package-name "@my-org/my-app"
```

**Overwrite existing directory:**
```bash
npx create-vc-app existing-dir --overwrite
```

**Create in current directory:**
```bash
npx create-vc-app . --name my-existing-project --overwrite
```

**Full non-interactive example:**
```bash
npx create-vc-app my-ecommerce-app \
  --variant classic \
  --module-name "Product Catalog" \
  --base-path "/apps/ecommerce/" \
  --package-name "@mycompany/ecommerce-app" \
  --mocks \
  --overwrite
```

## After Creation

Once app is created, follow the instructions to install dependencies and start dev server:
```bash
$ cd <your-app-name>
$ yarn
$ yarn serve
```

## Available Variants

- **classic** - Classic view modules boilerplate (default)
- **dynamic** - Dynamic view modules boilerplate (coming soon)

## Notes

- If you provide a project name as the first argument, it will be used as the app name
- The `--variant` option is required for non-interactive mode
- Use `--overwrite` to automatically overwrite existing files without confirmation
- Package names are automatically validated and converted to valid npm package names
