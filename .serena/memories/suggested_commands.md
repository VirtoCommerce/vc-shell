# Suggested Commands for VC-Shell Development

## Installation
```bash
yarn                    # Install all dependencies (runs husky install)
```

## Building
```bash
yarn build              # Build all packages
yarn build-framework    # Build framework only
yarn build-cli:config   # Build config generator CLI
yarn build-cli:api-client # Build API client generator
```

## Development
```bash
yarn storybook-serve    # Start Storybook dev server on port 6006
yarn storybook-build    # Build Storybook for production
```

## Code Quality
```bash
yarn lint               # Run ESLint with --fix on framework, cli, configs
yarn lint-staged        # Run lint-staged (pre-commit hook)
yarn check-locales      # Verify locale files
```

## API Generation
```bash
yarn generate:api-client # Generate API clients from Swagger
```

## Release
```bash
yarn release            # Run release script
yarn release:dry        # Dry run release
yarn changed            # Show changed packages (lerna)
yarn diff               # Show diff (lerna)
```

## System Utilities (macOS/Darwin)
```bash
ls -la                  # List files with details
find . -name "*.vue"    # Find Vue files
grep -r "pattern" .     # Search in files
```
