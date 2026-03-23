---
name: vc-app:update
description: Update vc-app skill to latest version
allowed-tools:
  - Bash
  - AskUserQuestion
---

Run: `npx @vc-shell/vc-app-skill install`

Show the user what version was installed and what's new.
After update, remind user to restart the session for changes to take effect.
