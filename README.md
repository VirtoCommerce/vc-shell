# Platform Manager Demo

Clickable demo with some scenarios to show various use cases.

## Important notes

#### Monorepo setup version update recommended flow
```bash

# package.json in @vc-shell/root
$ yarn bump-version patch/minor/major
```

#### Standalone app-vendor-portal
```bash
## Standalone app-vendor-portal
$ yarn version patch/minor/major
$ yarn changelog && yarn add-to-commit
```
