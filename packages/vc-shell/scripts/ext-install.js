const npm = require("npm");
const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const extlist = process.argv.slice(2);

let installedExtensions = [];

try {
  installedExtensions = require("../src/extensions/index.js");
  if (!Array.isArray(installedExtensions)) {
    console.warn("Error parsing extension index, resetting list");
    installedExtensions = [];
  }
} catch (err) {
  console.warn("Error loading extension index, resetting list");
}

if (extlist.length) {
  npm.load(() => {
    npm.commands.install(extlist, err => {
      if (!err) {
        console.log(`Extensions ${extlist.join(", ")} successfully installed`);

        mkdirp(path.resolve(__dirname, "../src/extensions"));

        extlist.forEach(ext => {
          const extPath = ext.replace(/(?!^)@(.*)$/, "");
          installedExtensions.push(extPath);
        });

        fs.writeFileSync(
          path.resolve(__dirname, "../src/extensions/index.js"),
          `module.exports = ${JSON.stringify([
            ...new Set(installedExtensions)
          ])};`
        );

        fs.writeFileSync(
          path.resolve(__dirname, "../src/extensions/loader.js"),
          `${[...new Set(installedExtensions)].map(
            ext => `require("${ext}");\n`
          )}`
        );
      } else {
        console.error("Extensions install failed", err);
      }
    });
  });
} else {
  console.log(
    "VirtoCommerce Shell Extensions installer.\nUsage: npm run ext-install [package-name] [package-name2]..."
  );
}
