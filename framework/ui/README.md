# Platform Manager UI

Vue3 components library also shipped as Vue plugin.

Here you can get anything you need to blazingly fast build specialized [VirtoCommerce](https://virtocommerce.com/) back-office applications.

## Design System

* Design inspired from [Google Retail UX Playbook](https://services.google.com/fh/files/events/pdf_retail_ux_playbook.pdf)
* [Atomic Design pattern](http://bradfrost.com/blog/post/atomic-web-design/) for components


### Core Concepts

*ToDo*


### Atoms

*ToDo*


### Molecules

*ToDo*


### Organisms

*ToDo*


## Code Usage

Connect as Vue plugin to whole App to auto register all UI components:

```typescript
import { createApp } from "vue";
import App from "./App.vue";
import UI from "@vc-shell/ui";

createApp(App)
  .use(UI)
  .mount("#app");
```

or use components individually:

```typescript
import { defineComponent } from "vue";
import { VcButton } from "@vc-shell/ui";

export default defineComponent({
  name: "MyAwesomeComponent",
  components: { VcButton },
});
```
