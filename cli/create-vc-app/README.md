# Creating your first application

Make sure you have executed `yarn` command and your current working directory is the one where you intend to create a project.

Run following command:
```bash
$ npx create-vc-app
```

This command will execute application scaffolding tool. You will be presented with prompts:

```text
✔ App name: … <your-app-name>
✔ Add Dashboard page? … No / Yes
✔ Add Login/Invite/Reset password pages? … No / Yes
✔ Add module starter? … No / Yes
✔ Module starter name: … <your-first-module-name>

Scaffolding app in ./<your-app-name>...

Done.
```


Once app is created, follow the instructions to install dependencies and start dev server:
```bash
$ cd <your-app-name>
$ yarn
$ yarn serve
```
